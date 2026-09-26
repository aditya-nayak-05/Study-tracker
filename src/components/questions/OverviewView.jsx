import React, { useMemo } from 'react';
import {
  Play, Plus, Sparkles, Download, Upload, CheckCircle2, Circle,
  TrendingUp, Target, Clock, Star, HelpCircle, ArrowRight
} from 'lucide-react';
import QuestionSetCard from './QuestionSetCard';

export default function OverviewView({
  questionSets = [],
  onOpenSet,
  onStartPractice,
  onCreateSet,
  onPasteQuestions,
  onImportBackup,
  onPinSet,
  onEditSet,
  onDuplicateSet,
  onExportJSON,
  onExportCSV,
  onDeleteSet,
}) {
  // Aggregate overall metrics
  const stats = useMemo(() => {
    let totalQuestions = 0;
    let completedQuestions = 0;
    let answeredQuestions = 0;
    let importantCount = 0;
    let completedToday = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    questionSets.forEach((set) => {
      (set.questions || []).forEach((q) => {
        totalQuestions++;
        if (q.completed) completedQuestions++;
        if (q.answer && q.answer.trim()) answeredQuestions++;
        if (q.important) importantCount++;
        if (q.completedAt && q.completedAt.startsWith(todayStr)) {
          completedToday++;
        }
      });
    });

    const completionPercent = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
    const answerCoverage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    // Daily target: default to 15 questions or dynamic
    const todayGoal = 15;
    const todayPercent = Math.min(100, Math.round((completedToday / todayGoal) * 100));

    return {
      totalQuestions,
      completedQuestions,
      answeredQuestions,
      importantCount,
      completedToday,
      todayGoal,
      todayPercent,
      completionPercent,
      answerCoverage,
    };
  }, [questionSets]);

  // Find the most relevant Question Set to "Continue Studying"
  const continueSet = useMemo(() => {
    if (questionSets.length === 0) return null;
    const sorted = [...questionSets].sort(
      (a, b) => new Date(b.lastOpenedAt || b.updatedAt || 0) - new Date(a.lastOpenedAt || a.updatedAt || 0)
    );
    return sorted[0];
  }, [questionSets]);

  // Find target question in continueSet
  const continueQuestion = useMemo(() => {
    if (!continueSet || !continueSet.questions || continueSet.questions.length === 0) return null;
    const targetId = continueSet.lastPracticeQuestionId;
    if (targetId) {
      const found = continueSet.questions.find((q) => q.id === targetId);
      if (found) return found;
    }
    // Fallback to first uncompleted question
    const firstUncompleted = continueSet.questions.find((q) => !q.completed);
    return firstUncompleted || continueSet.questions[0];
  }, [continueSet]);

  const continueIndex = useMemo(() => {
    if (!continueSet || !continueQuestion) return 0;
    return continueSet.questions.findIndex((q) => q.id === continueQuestion.id);
  }, [continueSet, continueQuestion]);

  // Study Queue calculation: high-priority uncompleted items
  const studyQueue = useMemo(() => {
    const queue = [];
    questionSets.forEach((set) => {
      (set.questions || []).forEach((q) => {
        if (!q.completed && (q.important || !q.answer || !q.answer.trim())) {
          queue.push({ ...q, setName: set.name, setId: set.id });
        }
      });
    });
    return queue.slice(0, 5);
  }, [questionSets]);

  return (
    <div className="space-y-10">
      {/* Quick Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 rounded-2xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-[18px] h-[18px] text-accent-primary animate-pulse" />
          <span className="text-[13px] font-bold text-main">Quick Actions:</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onCreateSet}
            className="brass-btn px-4 py-2.5 rounded-[10px] text-[13px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
            <span>Create Question Set</span>
          </button>

          <button
            type="button"
            onClick={onPasteQuestions}
            className="px-4 py-2.5 rounded-[10px] text-[13px] font-bold inset-field border border-[var(--neu-border)] text-main hover:border-[var(--accent-orange)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
            <span>Paste Questions</span>
          </button>

          <button
            type="button"
            onClick={onImportBackup}
            className="px-4 py-2.5 rounded-[10px] text-[13px] font-bold inset-field border border-[var(--neu-border)] text-muted hover:text-main transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-accent-primary" />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {/* Total Questions */}
        <div className="p-6 min-h-[120px] rounded-2xl border dash-card flex flex-col justify-between" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
          <div className="flex items-center justify-between text-muted text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Questions</span>
            <HelpCircle className="w-5 h-5 text-accent-primary" />
          </div>
          <div className="my-3">
            <span className="text-3xl sm:text-[34px] font-black text-main font-mono">
              {stats.totalQuestions}
            </span>
          </div>
          <span className="text-xs text-muted">
            Across {questionSets.length} question sets
          </span>
        </div>

        {/* Completed */}
        <div className="p-6 min-h-[120px] rounded-2xl border dash-card flex flex-col justify-between" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
          <div className="flex items-center justify-between text-muted text-[11px] font-semibold uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-[34px] font-black text-main font-mono">
              {stats.completedQuestions}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {stats.completionPercent}%
            </span>
          </div>
          <span className="text-xs text-muted">
            {stats.totalQuestions - stats.completedQuestions} remaining
          </span>
        </div>

        {/* Answered */}
        <div className="p-6 min-h-[120px] rounded-2xl border dash-card flex flex-col justify-between" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
          <div className="flex items-center justify-between text-muted text-[11px] font-semibold uppercase tracking-wider">
            <span>Answer Coverage</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-[34px] font-black text-main font-mono">
              {stats.answeredQuestions}
            </span>
            <span className="text-xs font-bold text-blue-400">
              {stats.answerCoverage}%
            </span>
          </div>
          <span className="text-xs text-muted">
            {stats.totalQuestions - stats.answeredQuestions} unanswered
          </span>
        </div>

        {/* Today's Goal */}
        <div className="p-6 min-h-[120px] rounded-2xl border dash-card flex flex-col justify-between" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
          <div className="flex items-center justify-between text-muted text-[11px] font-semibold uppercase tracking-wider">
            <span>Today's Goal</span>
            <Clock className="w-5 h-5 text-accent-primary" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-[34px] font-black text-main font-mono">
              {stats.completedToday}
            </span>
            <span className="text-xs font-bold text-muted">
              / {stats.todayGoal}
            </span>
          </div>
          <div className="w-full h-[6px] rounded-full overflow-hidden neu-card" style={{ background: 'var(--neu-inset-bg)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.todayPercent}%`,
                background: 'linear-gradient(90deg, #ed8936 0%, #dd6b20 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Hero "Continue Studying" Card */}
      {continueSet && continueQuestion && (
        <div
          className="p-7 sm:p-9 rounded-3xl border dash-card relative overflow-hidden shadow-xl"
          style={{
            background: 'var(--neu-card-bg)',
            border: '1.5px solid var(--neu-border)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  Continue Studying
                </span>
                <span className="text-[13px] font-bold text-muted truncate">
                  {continueSet.name}
                </span>
              </div>

              <div>
                <span className="text-[13px] font-mono text-muted block mb-1">
                  Question {continueIndex + 1} of {continueSet.questions?.length || 0}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-main tracking-tight leading-snug">
                  {continueQuestion.text}
                </h3>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md space-y-1 pt-1">
                <div className="flex justify-between text-xs leading-relaxed font-bold text-muted">
                  <span>Set Progress</span>
                  <span className="font-mono text-main">
                    {Math.round(((continueSet.questions?.filter((q) => q.completed).length || 0) / (continueSet.questions?.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-[6px] rounded-full overflow-hidden neu-card" style={{ background: 'var(--neu-inset-bg)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(((continueSet.questions?.filter((q) => q.completed).length || 0) / (continueSet.questions?.length || 1)) * 100)}%`,
                      background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => onStartPractice(continueSet.id, continueQuestion.id)}
                className="brass-btn px-7 py-4 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <span>Continue Practice</span>
                <ArrowRight className="w-4 h-4 text-accent-primary" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Study Queue (Smart Revision list) */}
      {studyQueue.length > 0 && (
        <div
          className="p-6 sm:p-7 rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-md space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-[15px] font-semibold text-main">
                Today's Priority Study Queue
              </h3>
            </div>
            <span className="text-[13px] text-muted font-medium">
              {studyQueue.length} questions waiting
            </span>
          </div>

          <div className="space-y-1">
            {studyQueue.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => onStartPractice(item.setId, item.id)}
                className="py-4 px-4 rounded-lg bg-[var(--neu-inset-bg)] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[13px] font-mono font-bold text-muted px-2 py-0.5 rounded inset-field shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-main truncate group-hover:text-accent-primary transition-colors">
                      {item.text}
                    </p>
                    <span className="text-[11px] text-muted">
                      Set: {item.setName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.important && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      ⭐ Important
                    </span>
                  )}
                  <Play className="w-3.5 h-3.5 text-muted group-hover:text-accent-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pinned & Recent Question Sets Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-main">
            Question Sets Overview
          </h3>
          <button
            type="button"
            onClick={onCreateSet}
            className="text-[13px] font-bold text-accent-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Set</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {questionSets.slice(0, 6).map((set) => (
            <QuestionSetCard
              key={set.id}
              set={set}
              onOpenSet={onOpenSet}
              onContinuePractice={onStartPractice}
              onPin={onPinSet}
              onEdit={onEditSet}
              onDuplicate={onDuplicateSet}
              onExportJSON={onExportJSON}
              onExportCSV={onExportCSV}
              onDelete={onDeleteSet}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
