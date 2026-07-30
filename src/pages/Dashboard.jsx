import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PomodoroTimer from '../components/PomodoroTimer';
import ActivityTimeline from '../components/ActivityTimeline';
import StylishAnalogClock from '../components/StylishAnalogClock';
import { ProgressRing, AnimatedCounter, BarChart, MiniLineChart } from '../components/Charts';
import {
  getGreeting, getAllTasksInPlan, calculateProgress,
} from '../utils/helpers';
import {
  Plus, Play, Clock, CheckSquare, Calendar, BarChart3, User, Settings,
  BookOpen, Target, Flame, TrendingUp, StickyNote, Youtube,
} from 'lucide-react';
import { extractVideoId, getThumbnailUrl, formatDuration } from '../utils/youtube';

export default function Dashboard() {
  const { state, dispatch, activePlan, showToast } = useStudy();
  const navigate = useNavigate();
  const cardsRef = useRef(null);
  const [quickNote, setQuickNote] = useState(activePlan?.notes || '');
  const [quickTask, setQuickTask] = useState('');

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.dash-card');
      if (cards.length > 0) {
        gsap.fromTo(cards, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
      }
    }
  }, []);

  // Stats - wrapped in try-catch for safety
  const stats = useMemo(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const studyHours = state.globalStudyHours || [];
      const todayHours = studyHours
        .filter((h) => h.date === today)
        .reduce((sum, h) => sum + (h.hours || 0) + (h.minutes || 0) / 60, 0);

      const allTasks = activePlan ? getAllTasksInPlan(activePlan) : [];
      const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
      const todayTasks = allTasks.filter((t) => t.dayDate === today);
      const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;

      // Weekly study data
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekData = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const hrs = studyHours.filter((h) => h.date === dateStr).reduce((s, h) => s + (h.hours || 0) + (h.minutes || 0) / 60, 0);
        weekData.push({ label: dayLabels[d.getDay()], value: Math.round(hrs * 10) / 10 });
      }

      // Streak
      let streak = 0;
      const d = new Date();
      while (streak < 365) {
        const ds = d.toISOString().split('T')[0];
        const has = studyHours.some((h) => h.date === ds);
        if (has) { streak++; d.setDate(d.getDate() - 1); } else break;
      }

      return {
        todayHours: Math.round(todayHours * 10) / 10,
        dailyGoal: state.profile?.dailyGoal || 6,
        totalTasks: allTasks.length,
        completedTasks,
        todayTasks,
        todayCompleted,
        overallProgress: calculateProgress(completedTasks, allTasks.length),
        weekData,
        streak,
        weeklyLine: weekData.map((d) => d.value),
      };
    } catch (err) {
      console.error('Dashboard stats error:', err);
      return {
        todayHours: 0, dailyGoal: 6, totalTasks: 0, completedTasks: 0,
        todayTasks: [], todayCompleted: 0, overallProgress: 0,
        weekData: [], streak: 0, weeklyLine: [],
      };
    }
  }, [state.globalStudyHours, activePlan, state.profile]);

  // Compute YouTube session and recent tutorials
  const learningStats = useMemo(() => {
    let activeSession = null;
    let activeSessionTask = null;
    let activeSessionPlan = null;
    if (state.activeSessionId) {
      activeSession = (state.studySessions || []).find((s) => s.id === state.activeSessionId && !s.isCompleted);
      if (activeSession) {
        (state.plans || []).forEach((p) => {
          if (p.id === activeSession.planId) {
            activeSessionPlan = p;
            p.months?.forEach((m) => m.weeks?.forEach((w) => w.days?.forEach((d) => d.tasks?.forEach((t) => {
              if (t.id === activeSession.taskId) activeSessionTask = t;
            }))));
          }
        });
      }
    }

    const tutorialTasks = [];
    (state.plans || []).forEach((p) => {
      if (p.archived) return;
      p.months?.forEach((m) => m.weeks?.forEach((w) => w.days?.forEach((d) => d.tasks?.forEach((t) => {
        if (t.youtubeUrl) {
          const videoId = extractVideoId(t.youtubeUrl);
          if (videoId) {
            const vp = state.videoProgress?.[videoId];
            if (vp && vp.progress > 0 && vp.progress < 95) {
              tutorialTasks.push({
                task: t,
                plan: p,
                videoId,
                progress: vp.progress,
                currentTime: vp.currentTime,
                duration: vp.duration,
                lastWatchedAt: vp.lastWatchedAt || ''
              });
            }
          }
        }
      }))));
    });

    tutorialTasks.sort((a, b) => {
      if (!a.lastWatchedAt) return 1;
      if (!b.lastWatchedAt) return -1;
      return new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt);
    });
    const recentTutorials = tutorialTasks.slice(0, 3);

    return { activeSession, activeSessionTask, activeSessionPlan, recentTutorials };
  }, [state.plans, state.videoProgress, state.studySessions, state.activeSessionId]);

  // Find the recently played video, task, and plan
  const { recentPlan, recentTask } = useMemo(() => {
    const sortedProgress = Object.entries(state.videoProgress)
      .filter(([_, data]) => data && data.lastWatchedAt)
      .sort((a, b) => new Date(b[1].lastWatchedAt) - new Date(a[1].lastWatchedAt));

    const latestVideoId = sortedProgress[0]?.[0];
    if (!latestVideoId) return { recentPlan: null, recentTask: null };

    for (const plan of state.plans) {
      if (plan.archived) continue;
      for (const m of plan.months || []) {
        for (const w of m.weeks || []) {
          for (const d of w.days || []) {
            for (const t of d.tasks || []) {
              if (t.youtubeUrl && extractVideoId(t.youtubeUrl) === latestVideoId) {
                return { recentPlan: plan, recentTask: t };
              }
            }
          }
        }
      }
    }
    return { recentPlan: null, recentTask: null };
  }, [state.plans, state.videoProgress]);

  const handleResumeVideo = useCallback(() => {
    if (recentPlan && recentTask) {
      navigate(`/learn/${recentPlan.id}/${recentTask.id}`, { state: { autoResume: true } });
    } else {
      showToast('No recently watched videos found. Go to the Learning Hub to start one!', 'info');
    }
  }, [recentPlan, recentTask, navigate, showToast]);

  const quickActions = [
    { label: 'New Plan', icon: Plus, color: 'var(--accent-orange)', action: () => navigate('/plans') },
    { label: 'Continue', icon: Play, color: '#38a169', action: () => activePlan && navigate(`/plans/${activePlan.id}`) },
    { label: 'Timer', icon: Clock, color: 'var(--accent-orange)', action: () => navigate('/study-hours') },
    { label: 'Log Hours', icon: Clock, color: '#319795', action: () => navigate('/study-hours') },
    { label: 'Resume Video', icon: Youtube, isSpecial: true, action: handleResumeVideo },
    { label: 'Add Task', icon: CheckSquare, color: 'var(--accent-orange)', action: () => navigate('/plans') },
    { label: 'Calendar', icon: Calendar, color: '#e53e3e', action: () => navigate('/calendar') },
    { label: 'Analytics', icon: BarChart3, color: '#319795', action: () => navigate('/analytics') },
    { label: 'Profile', icon: User, color: '#dd6b20', action: () => navigate('/profile') },
    { label: 'Settings', icon: Settings, color: 'var(--neu-text-muted)', action: () => navigate('/settings') },
  ];

  const handleQuickTask = useCallback((e) => {
    e.preventDefault();
    if (!quickTask.trim() || !activePlan) return;
    const days = [];
    activePlan.months?.forEach((m) => m.weeks?.forEach((w) => w.days?.forEach((d) => days.push(d))));
    const today = new Date().toISOString().split('T')[0];
    let targetDay = days.find((d) => d.date === today);
    if (!targetDay && days.length > 0) targetDay = days[days.length - 1];
    if (targetDay) {
      dispatch({ type: 'ADD_TASK', payload: { planId: activePlan.id, dayId: targetDay.id, title: quickTask.trim() } });
      showToast(`Task "${quickTask.trim()}" added`, 'success');
      setQuickTask('');
    } else {
      showToast('Create a day in your plan first', 'warning');
    }
  }, [quickTask, activePlan, dispatch, showToast]);

  const handleNoteChange = useCallback((e) => {
    setQuickNote(e.target.value);
    if (activePlan) {
      dispatch({ type: 'UPDATE_PLAN', payload: { id: activePlan.id, updates: { notes: e.target.value } } });
    }
  }, [activePlan, dispatch]);

  return (
    <DashboardLayout title={`${getGreeting()}, ${state.profile?.name || 'Student'}`} subtitle="Here's your study overview for today">
      <div ref={cardsRef} className="space-y-8">
        {/* Quick Actions Bar (Centered) */}
        <div className="dash-card p-5">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                className="flex flex-col items-center justify-center text-center gap-2 p-2.5 rounded-xl hover:bg-[var(--neu-border-subtle)] transition-all group cursor-pointer"
              >
                <div
                  className={qa.isSpecial 
                    ? "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative shadow-md group-hover:scale-110" 
                    : "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                  }
                  style={{ 
                    background: qa.isSpecial 
                      ? 'var(--accent-btn-bg)' 
                      : qa.color 
                  }}
                >
                  <qa.icon className="w-5 h-5 text-white" />
                </div>
                <span className={qa.isSpecial 
                  ? "text-[11px] font-bold text-accent-primary text-center"
                  : "text-[11px] text-muted group-hover:text-main transition-colors text-center font-medium"
                }>
                  {qa.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid (Centered) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Today's Hours (Centered) */}
          <div className="dash-card p-6 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-center w-full">
              <Clock className="w-4 h-4 text-accent-primary shrink-0" />
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider text-center">Today's Hours</span>
            </div>
            <div className="flex items-baseline justify-center gap-1.5 text-center">
              <AnimatedCounter value={stats.todayHours} suffix="h" className="text-2xl font-black text-main text-center" />
              <span className="text-xs text-muted font-bold text-center">/ {stats.dailyGoal}h</span>
            </div>
            <div className="mt-3 h-2 w-full max-w-[160px] rounded-full overflow-hidden neu-card mx-auto" style={{ boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.8)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#ed8936] to-[#dd6b20]"
                style={{ width: `${Math.min(100, (stats.todayHours / stats.dailyGoal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Tasks Completed (Centered) */}
          <div className="dash-card p-6 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-center w-full">
              <CheckSquare className="w-4 h-4 text-accent-primary shrink-0" />
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider text-center">Tasks Done</span>
            </div>
            <div className="flex items-baseline justify-center gap-1.5 text-center">
              <AnimatedCounter value={stats.completedTasks} className="text-2xl font-black text-main text-center" />
              <span className="text-xs text-muted font-bold text-center">/ {stats.totalTasks}</span>
            </div>
            <div className="mt-3 h-2 w-full max-w-[160px] rounded-full overflow-hidden neu-card mx-auto" style={{ boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.8)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#ed8936] to-[#dd6b20]"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Streak (Centered) */}
          <div className="dash-card p-6 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-center w-full">
              <Flame className="w-4 h-4 text-accent-primary shrink-0" />
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider text-center">Study Streak</span>
            </div>
            <AnimatedCounter value={stats.streak} suffix=" days" className="text-2xl font-black text-main text-center" />
            <p className="text-[11px] font-bold mt-1 text-muted text-center uppercase tracking-wider">Keep going! 🔥</p>
          </div>

          {/* Overall Progress (Centered) */}
          <div className="dash-card flex flex-col items-center justify-center p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-center w-full">
              <Target className="w-4 h-4 text-accent-primary shrink-0" />
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider text-center">Overall</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-center mt-1">
              <AnimatedCounter value={stats.overallProgress} suffix="%" className="text-2xl font-black text-main text-center" />
              <ProgressRing percent={stats.overallProgress} size={54} strokeWidth={5} color="var(--accent-orange)" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Weekly Study Chart (Centered) */}
          <div className="dash-card lg:col-span-2 p-6 flex flex-col justify-between">
            <div className="notebook-header-line flex items-center justify-between text-center">
              <h3 className="text-sm font-bold text-main flex items-center gap-2 uppercase tracking-wider text-center">
                <TrendingUp className="w-4 h-4 text-accent-primary shrink-0" /> Weekly Study Hours
              </h3>
              {stats.weeklyLine.length > 0 && <MiniLineChart data={stats.weeklyLine} width={80} height={24} color="var(--accent-orange)" />}
            </div>
            {stats.weekData.length > 0 ? (
              <BarChart data={stats.weekData} maxHeight={100} barColor="var(--accent-orange)" />
            ) : (
              <p className="text-sm text-center py-8 text-muted font-bold">No study data yet</p>
            )}
          </div>

          {/* Timer (Centered) */}
          <div className="dash-card flex flex-col items-center justify-center p-6 text-center">
            <div className="notebook-header-line w-full text-center">
              <h3 className="text-sm font-bold text-main flex items-center justify-center gap-2 text-center uppercase tracking-wider">
                <Clock className="w-4 h-4 text-accent-primary shrink-0" /> Timer
              </h3>
            </div>
            <PomodoroTimer compact />
          </div>
        </div>

        {/* Continue Learning Section (Centered) */}
        {(learningStats.activeSession || learningStats.recentTutorials.length > 0) && (
          <div className="dash-card p-6 mb-5">
            <div className="notebook-header-line text-center">
              <h3 className="text-sm font-bold text-main flex items-center justify-center gap-2 text-center uppercase tracking-wider">
                <Youtube className="w-4 h-4 text-accent-primary shrink-0" /> Continue Learning
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Active Session Card (Centered) */}
              {learningStats.activeSession && learningStats.activeSessionTask && (
                <div className="md:col-span-3 p-4 mb-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[var(--accent-orange)]/40 inset-field text-center sm:text-left">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] animate-ping shrink-0" />
                    <div>
                      <span className="text-[10px] text-accent-primary font-bold uppercase tracking-wider block">Active Study Session</span>
                      <h4 className="text-xs font-bold text-main leading-tight">{learningStats.activeSessionTask.title}</h4>
                      <p className="text-[10px] text-muted mt-0.5 font-semibold">Time logged: {formatDuration(learningStats.activeSession.duration)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/learn/${learningStats.activeSession.planId}/${learningStats.activeSession.taskId}`)}
                    className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer brass-btn shrink-0 mx-auto sm:mx-0"
                    style={{ background: 'var(--accent-btn-bg)', color: 'var(--accent-btn-text)' }}
                  >
                    Resume Session
                  </button>
                </div>
              )}

              {/* Recent In-Progress Tutorials (Centered) */}
              {learningStats.recentTutorials.map(({ task, plan, videoId, progress }) => (
                <div 
                  key={task.id} 
                  className="p-3 rounded-xl flex items-center gap-3 cursor-pointer neu-card border border-[var(--neu-border)] hover:bg-[var(--neu-border-subtle)] transition-all"
                  style={{ boxShadow: 'var(--neu-shadow-raised)' }}
                  onClick={() => navigate(`/learn/${plan.id}/${task.id}`)}
                >
                  <div className="relative w-20 aspect-video rounded-lg overflow-hidden shrink-0 bg-black/10 border border-white/40">
                    <img src={getThumbnailUrl(videoId)} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-center">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-accent-primary block text-center">{plan.name}</span>
                    <h4 className="text-xs font-bold text-main truncate leading-tight mt-0.5 text-center">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden neu-card" style={{ boxShadow: 'inset 1px 1px 3px rgba(163,177,198,0.5), inset -1px -1px 3px rgba(255,255,255,0.8)' }}>
                        <div className="h-full rounded-full bg-[var(--accent-orange)]" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[9px] text-muted font-bold">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's Tasks (Centered) */}
          <div className="dash-card p-6 flex flex-col justify-between">
            <div>
              <div className="notebook-header-line text-center">
                <h3 className="text-sm font-bold text-main flex items-center justify-center gap-2 text-center uppercase tracking-wider">
                  <CheckSquare className="w-4 h-4 text-accent-primary shrink-0" /> Today's Tasks
                </h3>
              </div>
              {(!stats.todayTasks || stats.todayTasks.length === 0) ? (
                <p className="text-xs text-center py-6 text-muted font-bold uppercase tracking-wider">No tasks scheduled for today</p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {stats.todayTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-center gap-3 py-1.5 text-center">
                      <button
                        onClick={() => dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: activePlan.id, taskId: task.id } })}
                        className="w-4 h-4 rounded-full border-2 shrink-0 cursor-pointer transition-all"
                        style={{
                          borderColor: task.status === 'completed' ? '#38a169' : task.status === 'in-progress' ? 'var(--accent-orange)' : '#cbd5e0',
                          background: task.status === 'completed' ? '#38a169' : 'transparent',
                        }}
                      />
                      <span className="text-xs font-bold truncate text-center" style={{ color: task.status === 'completed' ? '#718096' : 'var(--neu-text-main)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Quick Add Task Input (Centered Pill) */}
            {activePlan && (
              <form onSubmit={handleQuickTask} className="mt-4 flex gap-2 max-w-sm mx-auto w-full">
                <input
                  type="text"
                  value={quickTask}
                  onChange={(e) => setQuickTask(e.target.value)}
                  placeholder="Quick add task..."
                  className="flex-1 px-4 py-2 text-xs focus:outline-none rounded-full premium-search-input text-center font-bold tracking-wider"
                />
                <button type="submit" className="px-3.5 py-2 text-xs cursor-pointer brass-btn rounded-full shrink-0 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Stylish Analog Clock (Centered) */}
          <StylishAnalogClock />

          {/* Recent Activity (Centered) */}
          <div className="dash-card p-6 flex flex-col justify-between">
            <div className="notebook-header-line text-center">
              <h3 className="text-sm font-bold text-main flex items-center justify-center gap-2 text-center uppercase tracking-wider">
                <Flame className="w-4 h-4 text-accent-primary shrink-0" /> Recent Activity
              </h3>
            </div>
            <div className="max-h-[240px] overflow-y-auto text-center">
              <ActivityTimeline
                activities={[...(activePlan?.activities || []), ...(state.globalActivities || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
                maxItems={10}
              />
            </div>
          </div>
        </div>

        {/* Active Plan Card (Centered) */}
        {activePlan && (
          <div className="dash-card p-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-0.5">Active Plan</p>
                <h3 className="text-base font-extrabold text-main">{activePlan.name}</h3>
                {activePlan.description && <p className="text-xs mt-0.5 text-muted font-medium">{activePlan.description}</p>}
              </div>
              <button
                onClick={() => navigate(`/plans/${activePlan.id}`)}
                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer brass-btn shrink-0"
                style={{ background: 'var(--accent-btn-bg)', color: 'var(--accent-btn-text)' }}
              >
                Open Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
