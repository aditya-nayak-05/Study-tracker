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
  BookOpen, Target, Flame, TrendingUp, StickyNote,
} from 'lucide-react';

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

  const quickActions = [
    { label: 'New Plan', icon: Plus, color: '#6366f1', action: () => navigate('/plans') },
    { label: 'Continue', icon: Play, color: '#34d399', action: () => activePlan && navigate(`/plans/${activePlan.id}`) },
    { label: 'Pomodoro', icon: Clock, color: '#fbbf24', action: () => navigate('/study-hours') },
    { label: 'Log Hours', icon: Clock, color: '#60a5fa', action: () => navigate('/study-hours') },
    { label: 'Add Task', icon: CheckSquare, color: '#a78bfa', action: () => navigate('/plans') },
    { label: 'Calendar', icon: Calendar, color: '#ec4899', action: () => navigate('/calendar') },
    { label: 'Analytics', icon: BarChart3, color: '#06b6d4', action: () => navigate('/analytics') },
    { label: 'Profile', icon: User, color: '#818cf8', action: () => navigate('/profile') },
    { label: 'Settings', icon: Settings, color: '#5a5a88', action: () => navigate('/settings') },
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
        {/* Quick Actions */}
        <div className="dash-card" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: qa.color }}
                >
                  <qa.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] text-[#8888aa] group-hover:text-white transition-colors">{qa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Today's Hours */}
          <div className="dash-card" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: '#60a5fa' }} />
              <span className="text-xs font-medium" style={{ color: '#8888aa' }}>Today's Hours</span>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedCounter value={stats.todayHours} suffix="h" className="text-2xl font-bold text-white" />
              <span className="text-xs mb-1" style={{ color: '#5a5a88' }}>/ {stats.dailyGoal}h</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e35' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (stats.todayHours / stats.dailyGoal) * 100)}%`, background: 'linear-gradient(to right, #60a5fa, #6366f1)' }}
              />
            </div>
          </div>

          {/* Tasks Completed */}
          <div className="dash-card" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4" style={{ color: '#34d399' }} />
              <span className="text-xs font-medium" style={{ color: '#8888aa' }}>Tasks Done</span>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedCounter value={stats.completedTasks} className="text-2xl font-bold text-white" />
              <span className="text-xs mb-1" style={{ color: '#5a5a88' }}>/ {stats.totalTasks}</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e35' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${stats.overallProgress}%`, background: 'linear-gradient(to right, #34d399, #10b981)' }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="dash-card" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4" style={{ color: '#fbbf24' }} />
              <span className="text-xs font-medium" style={{ color: '#8888aa' }}>Study Streak</span>
            </div>
            <AnimatedCounter value={stats.streak} suffix=" days" className="text-2xl font-bold text-white" />
            <p className="text-[11px] mt-1" style={{ color: '#5a5a88' }}>Keep going! 🔥</p>
          </div>

          {/* Overall Progress */}
          <div className="dash-card flex items-center justify-between" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: '#a78bfa' }} />
                <span className="text-xs font-medium" style={{ color: '#8888aa' }}>Overall</span>
              </div>
              <AnimatedCounter value={stats.overallProgress} suffix="%" className="text-2xl font-bold text-white" />
            </div>
            <ProgressRing percent={stats.overallProgress} size={64} strokeWidth={5} color="#8b5cf6" />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Weekly Study Chart */}
          <div className="dash-card lg:col-span-2" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#818cf8' }} /> Weekly Study Hours
              </h3>
              {stats.weeklyLine.length > 0 && <MiniLineChart data={stats.weeklyLine} width={80} height={24} color="#6366f1" />}
            </div>
            {stats.weekData.length > 0 ? (
              <BarChart data={stats.weekData} maxHeight={100} barColor="#6366f1" />
            ) : (
              <p className="text-sm text-center py-8" style={{ color: '#5a5a88' }}>No study data yet</p>
            )}
          </div>

          {/* Pomodoro Timer */}
          <div className="dash-card flex flex-col items-center justify-center" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#fbbf24' }} /> Pomodoro
            </h3>
            <PomodoroTimer compact />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's Tasks */}
          <div className="dash-card" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" style={{ color: '#34d399' }} /> Today's Tasks
            </h3>
            {(!stats.todayTasks || stats.todayTasks.length === 0) ? (
              <p className="text-sm text-center py-4" style={{ color: '#5a5a88' }}>No tasks for today</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {stats.todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-1.5">
                    <button
                      onClick={() => dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: activePlan.id, taskId: task.id } })}
                      className="w-4 h-4 rounded-full border-2 shrink-0 cursor-pointer transition-all"
                      style={{
                        borderColor: task.status === 'completed' ? '#34d399' : task.status === 'in-progress' ? '#fbbf24' : '#5a5a88',
                        background: task.status === 'completed' ? '#34d399' : 'transparent',
                      }}
                    />
                    <span className="text-sm truncate" style={{ color: task.status === 'completed' ? '#5a5a88' : '#d0d0e0', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</span>
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
                  className="flex-1 px-3 py-2 text-xs rounded-lg focus:outline-none"
                  style={{ background: '#161625', border: '1px solid rgba(255,255,255,0.1)', color: '#d0d0e0' }}
                />
                <button type="submit" className="px-3 py-2 rounded-lg text-xs cursor-pointer" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Quick Notes */}
          <div className="dash-card" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <StickyNote className="w-4 h-4" style={{ color: '#fbbf24' }} /> Quick Notes
            </h3>
            <textarea
              value={quickNote}
              onChange={handleNoteChange}
              placeholder="Write notes..."
              rows={6}
              className="w-full rounded-xl p-3 text-sm focus:outline-none resize-none"
              style={{ background: '#161625', border: '1px solid rgba(255,255,255,0.1)', color: '#d0d0e0' }}
            />
          </div>

          {/* Recent Activity */}
          <div className="dash-card" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4" style={{ color: '#818cf8' }} /> Recent Activity
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
          <div className="dash-card" style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: '#5a5a88' }}>Active Plan</p>
                <h3 className="text-lg font-semibold text-white">{activePlan.name}</h3>
                {activePlan.description && <p className="text-sm mt-1" style={{ color: '#8888aa' }}>{activePlan.description}</p>}
              </div>
              <button
                onClick={() => navigate(`/plans/${activePlan.id}`)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
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
