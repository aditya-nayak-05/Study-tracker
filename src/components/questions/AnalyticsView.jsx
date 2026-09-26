import React, { useState, useMemo } from 'react';
import {
  BarChart3, CheckCircle2, Circle, TrendingUp, Calendar, Clock,
  Download, Upload, Trash2, Star, Sparkles, FileText
} from 'lucide-react';
import { exportAllQuestionsBackup, validateImportedQuestionSet } from '../../utils/questionParser';
import QuestionConfirmDialog from './QuestionConfirmDialog';

export default function AnalyticsView({
  questionSets = [],
  onImportAll,
  onClearAll,
  showToast,
}) {
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [importFileError, setImportFileError] = useState('');

  // Calculate comprehensive metrics
  const analytics = useMemo(() => {
    let totalQuestions = 0;
    let completedCount = 0;
    let answeredCount = 0;
    let importantCount = 0;
    let importantUnansweredCount = 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Compute start of week (7 days ago) and start of month (30 days ago)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    let completedToday = 0;
    let completedThisWeek = 0;
    let completedThisMonth = 0;

    // Daily breakdown for the last 7 days
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const ds = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[ds] = { dateStr: ds, dayName, count: 0 };
    }

    const setBreakdowns = [];

    questionSets.forEach((set) => {
      let setCompleted = 0;
      let setAnswered = 0;
      const setTotal = set.questions?.length || 0;

      (set.questions || []).forEach((q) => {
        totalQuestions++;
        if (q.completed) {
          completedCount++;
          setCompleted++;
        }
        if (q.answer && q.answer.trim()) {
          answeredCount++;
          setAnswered++;
        }
        if (q.important) {
          importantCount++;
          if (!q.answer || !q.answer.trim()) {
            importantUnansweredCount++;
          }
        }

        if (q.completedAt) {
          const compDate = new Date(q.completedAt);
          const compStr = q.completedAt.split('T')[0];

          if (compStr === todayStr) completedToday++;
          if (compDate >= sevenDaysAgo) completedThisWeek++;
          if (compDate >= thirtyDaysAgo) completedThisMonth++;

          if (daysMap[compStr]) {
            daysMap[compStr].count++;
          }
        }
      });

      const setPercent = setTotal > 0 ? Math.round((setCompleted / setTotal) * 100) : 0;
      setBreakdowns.push({
        id: set.id,
        name: set.name,
        subject: set.subject,
        color: set.color || '#6366f1',
        total: setTotal,
        completed: setCompleted,
        answered: setAnswered,
        percent: setPercent,
      });
    });

    // Sort setBreakdowns by highest progress
    setBreakdowns.sort((a, b) => b.percent - a.percent);

    const completionRate = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
    const answerCoverage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    return {
      totalSets: questionSets.length,
      totalQuestions,
      completedCount,
      answeredCount,
      unansweredCount: totalQuestions - answeredCount,
      importantCount,
      importantUnansweredCount,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      completionRate,
      answerCoverage,
      dailyChart: Object.values(daysMap),
      setBreakdowns,
      };
  }, [questionSets]);

  const maxChartCount = useMemo(() => {
    const counts = analytics.dailyChart.map((d) => d.count);
    return Math.max(5, ...counts);
  }, [analytics.dailyChart]);

  // Handle Import Backup
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const validated = validateImportedQuestionSet(json);
        if (validated.valid) {
          if (validated.isBulk) {
            onImportAll(validated.questionSets);
            showToast(`Restored ${validated.questionSets.length} question sets from backup! ✓`, 'success');
          } else {
            onImportAll([...questionSets, validated.questionSet]);
            showToast(`Imported "${validated.questionSet.name}" ✓`, 'success');
          }
          setImportFileError('');
        } else {
          setImportFileError(validated.error || 'Invalid question set file.');
        }
      } catch (err) {
        setImportFileError('Unable to parse file. Please upload a valid JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-10">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        <div className="p-6 rounded-2xl border dash-card flex flex-col justify-between min-h-[120px]" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
          <div className="flex items-center justify-between text-muted text-[13px] font-semibold uppercase tracking-wider">
            <span>Total Question Sets</span>
            <BarChart3 className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="my-3">
            <span className="text-[34px] font-black text-main font-mono">
              {analytics.totalSets}
            </span>
          </div>
          <span className="text-xs text-muted">
            {analytics.totalQuestions} questions total
          </span>
        </div>

        <div className="p-6 rounded-2xl border dash-card flex flex-col justify-between min-h-[120px]" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
          <div className="flex items-center justify-between text-muted text-[13px] font-semibold uppercase tracking-wider">
            <span>Overall Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-[34px] font-black text-main font-mono">
              {analytics.completionRate}%
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {analytics.completedCount} done
            </span>
          </div>
          <span className="text-xs text-muted">
            {analytics.totalQuestions - analytics.completedCount} remaining
          </span>
        </div>

        <div className="p-6 rounded-2xl border dash-card flex flex-col justify-between min-h-[120px]" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
          <div className="flex items-center justify-between text-muted text-[13px] font-semibold uppercase tracking-wider">
            <span>Answer Coverage</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-[34px] font-black text-main font-mono">
              {analytics.answerCoverage}%
            </span>
            <span className="text-xs font-bold text-blue-400">
              {analytics.answeredCount} answered
            </span>
          </div>
          <span className="text-xs text-muted">
            {analytics.unansweredCount} unanswered
          </span>
        </div>

        <div className="p-6 rounded-2xl border dash-card flex flex-col justify-between min-h-[120px]" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
          <div className="flex items-center justify-between text-muted text-[13px] font-semibold uppercase tracking-wider">
            <span>Priority Attention</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-[34px] font-black text-main font-mono">
              {analytics.importantUnansweredCount}
            </span>
            <span className="text-xs font-bold text-amber-400">
              important & empty
            </span>
          </div>
          <span className="text-xs text-muted">
            {analytics.importantCount} total important questions
          </span>
        </div>
      </div>

      {/* Time-Based Study Velocity & Activity Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time-based numbers */}
        <div className="p-7 rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-md flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-primary" />
            <span>Completion Velocity</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl inset-field bg-[var(--neu-inset-bg)]">
              <span className="text-sm font-semibold text-muted">Completed Today</span>
              <span className="text-2xl font-black text-main font-mono">
                {analytics.completedToday}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl inset-field bg-[var(--neu-inset-bg)]">
              <span className="text-sm font-semibold text-muted">Completed This Week</span>
              <span className="text-2xl font-black text-main font-mono">
                {analytics.completedThisWeek}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl inset-field bg-[var(--neu-inset-bg)]">
              <span className="text-sm font-semibold text-muted">Completed This Month</span>
              <span className="text-2xl font-black text-main font-mono">
                {analytics.completedThisMonth}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted italic text-center">
            Calculated dynamically from real completedAt timestamps.
          </p>
        </div>

        {/* 7-Day Completion Bar Chart */}
        <div className="lg:col-span-2 p-7 rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-primary" />
              <span>Questions Completed (Last 7 Days)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-accent-primary">
              {analytics.completedThisWeek} total
            </span>
          </div>

          {/* Clean Custom SVG / HTML Bar Chart */}
          <div className="h-52 flex items-end justify-between gap-3 px-2 pt-4">
            {analytics.dailyChart.map((d, idx) => {
              const heightPercent = Math.max(8, Math.round((d.count / maxChartCount) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip / value */}
                  <span className="text-[10px] font-mono font-bold text-muted group-hover:text-main transition-colors">
                    {d.count}
                  </span>

                  {/* Bar */}
                  <div
                    className="w-full max-w-[42px] rounded-t-xl transition-all duration-500 cursor-pointer group-hover:brightness-125"
                    style={{
                      height: `${heightPercent}%`,
                      background: d.count > 0
                        ? 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)'
                        : 'var(--neu-inset-bg)',
                      boxShadow: d.count > 0 ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none',
                    }}
                  />

                  {/* Day label */}
                  <span className="text-[11px] font-bold text-muted uppercase">
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-[var(--neu-border-subtle)]">
            <span>Keep your daily rhythm active.</span>
            <span>Target: 15 questions/day</span>
          </div>
        </div>
      </div>

      {/* Per-Set Progress Breakdown */}
      <div className="p-7 rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-md space-y-4">
        <h3 className="text-[15px] font-bold text-main uppercase tracking-wider">
          Question Set Mastery Breakdown
        </h3>

        <div className="space-y-3.5">
          {analytics.setBreakdowns.map((set) => (
            <div key={set.id} className="p-5 rounded-2xl inset-field bg-[var(--neu-inset-bg)] border border-[var(--neu-border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: set.color }}
                  />
                  <span className="text-main">{set.name}</span>
                  <span className="text-muted text-[10px] uppercase font-normal">
                    ({set.subject || 'General'})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted">
                    {set.completed} / {set.total}
                  </span>
                  <span className="font-mono text-main">{set.percent}%</span>
                </div>
              </div>

              <div className="w-full h-[6px] rounded-full overflow-hidden neu-card" style={{ background: 'var(--neu-card-bg)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${set.percent}%`,
                    background: set.color || 'var(--accent-orange)',
                  }}
                />
              </div>
            </div>
          ))}

          {analytics.setBreakdowns.length === 0 && (
            <p className="text-xs text-muted italic text-center py-4">
              No Question Sets created yet.
            </p>
          )}
        </div>
      </div>

      {/* Data Backup & Reset Section */}
      <div className="p-7 rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--neu-border-subtle)] pb-3">
          <div>
            <h3 className="text-[15px] font-bold text-main uppercase tracking-wider">
              Data Management & Backup
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Because Study Flow runs entirely client-side, your questions are preserved in localStorage.
            </p>
          </div>
        </div>

        {importFileError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            {importFileError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export All */}
          <div className="p-5 rounded-2xl border border-[var(--neu-border-subtle)] bg-[var(--neu-inset-bg)] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[13px] font-bold text-main block">Export All Questions</span>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Download a complete JSON backup of all Question Sets, answers, notes, and progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportAllQuestionsBackup(questionSets)}
              className="brass-btn w-full py-2 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Import Backup */}
          <div className="p-5 rounded-2xl border border-[var(--neu-border-subtle)] bg-[var(--neu-inset-bg)] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[13px] font-bold text-main block">Restore from Backup</span>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Import a previously exported JSON backup file. Validates format before updating data.
              </p>
            </div>
            <label className="inset-field w-full py-2 rounded-xl text-[13px] font-bold border border-[var(--neu-border)] text-main hover:border-[var(--accent-orange)] transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-accent-primary" />
              <span>Select Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Clear All Data */}
          <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[13px] font-bold text-red-400 block">Clear All Question Data</span>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Permanently wipes all Question Sets and progress. Requires typing DELETE to confirm.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setClearConfirmOpen(true)}
              className="w-full py-2 rounded-xl text-[13px] font-bold bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Questions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <QuestionConfirmDialog
        isOpen={clearConfirmOpen}
        title="Clear All Question Data?"
        message="This will permanently remove all Question Sets, questions, answers, and analytics from localStorage. This action cannot be reversed."
        confirmLabel="Clear All Data"
        confirmVariant="danger"
        requireTextMatch="DELETE"
        onConfirm={() => {
          onClearAll();
          showToast('All question data cleared', 'info');
          setClearConfirmOpen(false);
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </div>
  );
}
