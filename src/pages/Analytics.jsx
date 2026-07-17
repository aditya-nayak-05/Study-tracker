import React, { useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { BarChart, ProgressRing, AnimatedCounter, MiniLineChart } from '../components/Charts';
import StudyHoursChart from '../components/StudyHoursChart';
import {
  Clock, TrendingUp, Flame, Award, Target, BarChart3, Calendar,
} from 'lucide-react';

export default function Analytics() {
  const { state } = useStudy();
  const cardsRef = useRef(null);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.analytics-card');
      gsap.fromTo(cards, { y: 20, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  const stats = useMemo(() => {
    const hours = state.globalStudyHours;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const toDecimal = (entries) => entries.reduce((s, h) => s + (h.hours || 0) + (h.minutes || 0) / 60, 0);

    const todayHours = toDecimal(hours.filter((h) => h.date === today));
    const yesterdayHours = toDecimal(hours.filter((h) => h.date === yesterday));

    // Weekly
    const weekDates = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      weekDates.push(d.toISOString().split('T')[0]);
    }
    const weeklyHours = toDecimal(hours.filter((h) => weekDates.includes(h.date)));
    const weeklyData = weekDates.map((date) => {
      const d = new Date(date);
      const label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      return { label, value: Math.round(toDecimal(hours.filter((h) => h.date === date)) * 10) / 10 };
    });

    // Monthly
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthlyHours = toDecimal(hours.filter((h) => h.date >= monthStart));

    // Total
    const totalHours = toDecimal(hours);

    // Average
    const uniqueDays = new Set(hours.map((h) => h.date)).size;
    const averageHours = uniqueDays > 0 ? totalHours / uniqueDays : 0;

    // Sessions
    const sessions = hours.map((h) => (h.hours || 0) * 60 + (h.minutes || 0));
    const longestSession = sessions.length > 0 ? Math.max(...sessions) : 0;
    const shortestSession = sessions.length > 0 ? Math.min(...sessions.filter((s) => s > 0)) : 0;

    // Streak
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    const d = new Date();
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (hours.some((h) => h.date === ds)) { currentStreak++; d.setDate(d.getDate() - 1); } else break;
    }

    // Best streak
    const allDates = [...new Set(hours.map((h) => h.date))].sort();
    allDates.forEach((date, i) => {
      if (i === 0) { tempStreak = 1; }
      else {
        const prev = new Date(allDates[i - 1]);
        const curr = new Date(date);
        const diff = (curr - prev) / 86400000;
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      bestStreak = Math.max(bestStreak, tempStreak);
    });

    // Daily goal
    const dailyGoal = state.profile?.dailyGoal || 6;
    const dailyGoalProgress = Math.min(100, Math.round((todayHours / dailyGoal) * 100));

    // Line data for last 14 days
    const lineData = [];
    for (let i = 13; i >= 0; i--) {
      const dd = new Date(now); dd.setDate(dd.getDate() - i);
      const ds = dd.toISOString().split('T')[0];
      lineData.push(Math.round(toDecimal(hours.filter((h) => h.date === ds)) * 10) / 10);
    }

    return {
      todayHours: Math.round(todayHours * 10) / 10,
      yesterdayHours: Math.round(yesterdayHours * 10) / 10,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      monthlyHours: Math.round(monthlyHours * 10) / 10,
      totalHours: Math.round(totalHours * 10) / 10,
      averageHours: Math.round(averageHours * 10) / 10,
      longestSession,
      shortestSession,
      currentStreak,
      bestStreak,
      dailyGoalProgress,
      dailyGoal,
      weeklyData,
      lineData,
    };
  }, [state.globalStudyHours, state.profile]);

  const statCards = [
    { label: "Today's Hours", value: stats.todayHours, suffix: 'h', icon: Clock, color: '#60a5fa' },
    { label: "Yesterday", value: stats.yesterdayHours, suffix: 'h', icon: Clock, color: '#818cf8' },
    { label: "This Week", value: stats.weeklyHours, suffix: 'h', icon: Calendar, color: '#a78bfa' },
    { label: "This Month", value: stats.monthlyHours, suffix: 'h', icon: Calendar, color: '#c4b5fd' },
    { label: "Total Hours", value: stats.totalHours, suffix: 'h', icon: TrendingUp, color: '#6366f1' },
    { label: "Average/Day", value: stats.averageHours, suffix: 'h', icon: BarChart3, color: '#34d399' },
    { label: "Longest Session", value: stats.longestSession, suffix: 'm', icon: Award, color: '#fbbf24' },
    { label: "Shortest Session", value: stats.shortestSession, suffix: 'm', icon: Target, color: '#fb7185' },
    { label: "Current Streak", value: stats.currentStreak, suffix: ' days', icon: Flame, color: '#f97316' },
    { label: "Best Streak", value: stats.bestStreak, suffix: ' days', icon: Award, color: '#eab308' },
  ];

  return (
    <DashboardLayout title="Analytics" subtitle="Track your study patterns and performance">
      <div ref={cardsRef} className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="analytics-card glass gradient-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
                <span className="text-[11px] text-dark-400 font-medium">{card.label}</span>
              </div>
              <AnimatedCounter value={card.value} suffix={card.suffix} className="text-xl font-bold text-white" />
            </div>
          ))}
        </div>

        {/* Interactive Study Hours Line Chart */}
        <div className="analytics-card">
          <StudyHoursChart />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Goal Progress */}
          <div className="analytics-card glass gradient-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <Target className="w-4 h-4 text-neon-green" /> Daily Goal Progress
            </h3>
            <div className="flex items-center justify-center gap-8">
              <ProgressRing percent={stats.dailyGoalProgress} size={100} strokeWidth={7} color="#34d399" label="Today" />
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-dark-400">Target</p>
                  <p className="text-lg font-bold text-white">{stats.dailyGoal}h</p>
                </div>
                <div>
                  <p className="text-[11px] text-dark-400">Studied</p>
                  <p className="text-lg font-bold text-neon-green">{stats.todayHours}h</p>
                </div>
              </div>
            </div>
          </div>

          {/* 14-Day Trend */}
          <div className="analytics-card glass gradient-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-400" /> 14-Day Study Trend
            </h3>
            <div className="flex justify-center">
              <MiniLineChart data={stats.lineData} width={Math.min(500, window.innerWidth - 120)} height={80} color="#8b5cf6" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
