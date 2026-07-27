import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PomodoroTimer from '../components/PomodoroTimer';
import ActivityTimeline from '../components/ActivityTimeline';
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
    { label: 'New Plan', icon: Plus, color: '#ed8936', action: () => navigate('/plans') },
    { label: 'Continue', icon: Play, color: '#38a169', action: () => activePlan && navigate(`/plans/${activePlan.id}`) },
    { label: 'Pomodoro', icon: Clock, color: '#ed8936', action: () => navigate('/study-hours') },
    { label: 'Log Hours', icon: Clock, color: '#319795', action: () => navigate('/study-hours') },
    { label: 'Resume Video', icon: Youtube, isSpecial: true, action: handleResumeVideo },
    { label: 'Add Task', icon: CheckSquare, color: '#ed8936', action: () => navigate('/plans') },
    { label: 'Calendar', icon: Calendar, color: '#e53e3e', action: () => navigate('/calendar') },
    { label: 'Analytics', icon: BarChart3, color: '#319795', action: () => navigate('/analytics') },
    { label: 'Profile', icon: User, color: '#dd6b20', action: () => navigate('/profile') },
    { label: 'Settings', icon: Settings, color: '#718096', action: () => navigate('/settings') },
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
        {/* Quick Actions Bar */}
        <div className="dash-card p-5">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl hover:bg-[#ebf0f7] transition-all group cursor-pointer"
              >
                <div
                  className={qa.isSpecial 
                    ? "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative shadow-md group-hover:scale-110" 
                    : "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                  }
                  style={{ 
                    background: qa.isSpecial 
                      ? 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' 
                      : qa.color 
                  }}
                >
                  <qa.icon className="w-5 h-5 text-white" />
                </div>
                <span className={qa.isSpecial 
                  ? "text-[11px] font-bold text-[#ed8936]"
                  : "text-[11px] text-[#718096] group-hover:text-[#1a202c] transition-colors"
                }>
                  {qa.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Today's Hours */}
          <div className="dash-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#ed8936]" />
              <span className="text-xs font-medium text-[#718096]">Today's Hours</span>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedCounter value={stats.todayHours} suffix="h" className="text-2xl font-bold text-[#1a202c]" />
              <span className="text-xs mb-1 text-[#718096]">/ {stats.dailyGoal}h</span>
            </div>
            <div className="mt-3 h-2 rounded-full overflow-hidden bg-[#e6ebf2]" style={{ boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.8)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#ed8936] to-[#dd6b20]"
                style={{ width: `${Math.min(100, (stats.todayHours / stats.dailyGoal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Tasks Completed */}
          <div className="dash-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-[#ed8936]" />
              <span className="text-xs font-medium text-[#718096]">Tasks Done</span>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedCounter value={stats.completedTasks} className="text-2xl font-bold text-[#1a202c]" />
              <span className="text-xs mb-1 text-[#718096]">/ {stats.totalTasks}</span>
            </div>
            <div className="mt-3 h-2 rounded-full overflow-hidden bg-[#e6ebf2]" style={{ boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.8)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#ed8936] to-[#dd6b20]"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="dash-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-[#ed8936]" />
              <span className="text-xs font-medium text-[#718096]">Study Streak</span>
            </div>
            <AnimatedCounter value={stats.streak} suffix=" days" className="text-2xl font-bold text-[#1a202c]" />
            <p className="text-[11px] mt-1 text-[#718096]">Keep going! 🔥</p>
          </div>

          {/* Overall Progress */}
          <div className="dash-card flex items-center justify-between p-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#ed8936]" />
                <span className="text-xs font-medium text-[#718096]">Overall</span>
              </div>
              <AnimatedCounter value={stats.overallProgress} suffix="%" className="text-2xl font-bold text-[#1a202c]" />
            </div>
            <ProgressRing percent={stats.overallProgress} size={64} strokeWidth={5} color="#ed8936" />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Weekly Study Chart */}
          <div className="dash-card lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-[#1a202c] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#ed8936]" /> Weekly Study Hours
              </h3>
              {stats.weeklyLine.length > 0 && <MiniLineChart data={stats.weeklyLine} width={80} height={24} color="#ed8936" />}
            </div>
            {stats.weekData.length > 0 ? (
              <BarChart data={stats.weekData} maxHeight={100} barColor="#ed8936" />
            ) : (
              <p className="text-sm text-center py-8 text-[#718096]">No study data yet</p>
            )}
          </div>

          {/* Pomodoro Timer */}
          <div className="dash-card flex flex-col items-center justify-center p-6">
            <h3 className="text-sm font-semibold text-[#1a202c] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ed8936]" /> Pomodoro
            </h3>
            <PomodoroTimer compact />
          </div>
        </div>

        {/* Continue Learning Section */}
        {(learningStats.activeSession || learningStats.recentTutorials.length > 0) && (
          <div className="dash-card p-6 mb-5">
            <h3 className="text-sm font-semibold text-[#1a202c] mb-4 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-[#ed8936]" /> Continue Learning
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Active Session Card */}
              {learningStats.activeSession && learningStats.activeSessionTask && (
                <div className="md:col-span-3 p-4 mb-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#ed8936]/40 bg-[#e6ebf2]" style={{ boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.4), inset -2px -2px 5px rgba(255,255,255,0.8)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ed8936] animate-ping" />
                    <div>
                      <span className="text-[10px] text-[#ed8936] font-bold uppercase tracking-wider">Active Study Session</span>
                      <h4 className="text-xs font-bold text-[#1a202c] leading-tight">{learningStats.activeSessionTask.title}</h4>
                      <p className="text-[10px] text-[#718096] mt-0.5">Time logged: {formatDuration(learningStats.activeSession.duration)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/learn/${learningStats.activeSession.planId}/${learningStats.activeSession.taskId}`)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer brass-btn shrink-0"
                  >
                    Resume Session
                  </button>
                </div>
              )}

              {/* Recent In-Progress Tutorials */}
              {learningStats.recentTutorials.map(({ task, plan, videoId, progress }) => (
                <div 
                  key={task.id} 
                  className="p-3 rounded-xl flex gap-3 cursor-pointer bg-[#e6ebf2] border border-white/70 hover:bg-[#ebf0f7] transition-all"
                  style={{ boxShadow: '4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.85)' }}
                  onClick={() => navigate(`/learn/${plan.id}/${task.id}`)}
                >
                  <div className="relative w-20 aspect-video rounded-lg overflow-hidden shrink-0 bg-black/10 border border-white/40">
                    <img src={getThumbnailUrl(videoId)} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#ed8936]">{plan.name}</span>
                    <h4 className="text-xs font-bold text-[#1a202c] truncate leading-tight mt-0.5">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#e6ebf2]" style={{ boxShadow: 'inset 1px 1px 3px rgba(163,177,198,0.5), inset -1px -1px 3px rgba(255,255,255,0.8)' }}>
                        <div className="h-full rounded-full bg-[#ed8936]" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[9px] text-[#718096]">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's Tasks */}
          <div className="dash-card p-6">
            <h3 className="text-sm font-semibold text-[#1a202c] mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#ed8936]" /> Today's Tasks
            </h3>
            {(!stats.todayTasks || stats.todayTasks.length === 0) ? (
              <p className="text-sm text-center py-4 text-[#718096]">No tasks for today</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {stats.todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-1.5">
                    <button
                      onClick={() => dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: activePlan.id, taskId: task.id } })}
                      className="w-4 h-4 rounded-full border-2 shrink-0 cursor-pointer transition-all"
                      style={{
                        borderColor: task.status === 'completed' ? '#38a169' : task.status === 'in-progress' ? '#ed8936' : '#cbd5e0',
                        background: task.status === 'completed' ? '#38a169' : 'transparent',
                      }}
                    />
                    <span className="text-sm truncate" style={{ color: task.status === 'completed' ? '#718096' : '#1a202c', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Quick Add */}
            {activePlan && (
              <form onSubmit={handleQuickTask} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={quickTask}
                  onChange={(e) => setQuickTask(e.target.value)}
                  placeholder="Quick add task..."
                  className="flex-1 px-3 py-2 text-xs focus:outline-none inset-field"
                />
                <button type="submit" className="px-3 py-2 text-xs cursor-pointer brass-btn">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Quick Notes */}
          <div className="dash-card p-6 relative">
            <h3 className="text-sm font-semibold text-[#1a202c] mb-4 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-[#ed8936]" /> Quick Notes
            </h3>
            <textarea
              value={quickNote}
              onChange={handleNoteChange}
              placeholder="Write notes..."
              rows={6}
              className="w-full p-3 text-sm focus:outline-none resize-none inset-field text-[#1a202c]"
            />
          </div>

          {/* Recent Activity */}
          <div className="dash-card p-6">
            <h3 className="text-sm font-semibold text-[#1a202c] mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ed8936]" /> Recent Activity
            </h3>
            <div className="max-h-[240px] overflow-y-auto">
              <ActivityTimeline
                activities={[...(activePlan?.activities || []), ...(state.globalActivities || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
                maxItems={10}
              />
            </div>
          </div>
        </div>

        {/* Active Plan Card */}
        {activePlan && (
          <div className="dash-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs mb-1 text-[#718096]">Active Plan</p>
                <h3 className="text-lg font-semibold text-[#1a202c]">{activePlan.name}</h3>
                {activePlan.description && <p className="text-sm mt-1 text-[#718096]">{activePlan.description}</p>}
              </div>
              <button
                onClick={() => navigate(`/plans/${activePlan.id}`)}
                className="px-4 py-2 text-sm font-medium transition-all cursor-pointer brass-btn"
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
