import React, { useState, useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { AnimatedCounter, ProgressRing } from '../components/Charts';
import { formatDate } from '../utils/helpers';
import {
  Camera, User, Mail, BookOpen, Target, Clock, Flame,
  Award, Calendar, Edit3, Check, X,
} from 'lucide-react';

export default function Profile() {
  const { state, dispatch, showToast } = useStudy();
  const profile = state.profile;
  const containerRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile || {});

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.profile-card');
      gsap.fromTo(cards, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' });
    }
  }, []);

  const stats = useMemo(() => {
    const totalPlans = state.plans.length;
    const totalHours = state.globalStudyHours.reduce((s, h) => s + (h.hours || 0) + (h.minutes || 0) / 60, 0);
    const totalTasks = state.plans.reduce((s, p) => {
      let count = 0;
      p.months?.forEach((m) => m.weeks?.forEach((w) => w.days?.forEach((d) => { count += d.tasks?.length || 0; })));
      return s + count;
    }, 0);
    const completedTasks = state.plans.reduce((s, p) => {
      let count = 0;
      p.months?.forEach((m) => m.weeks?.forEach((w) => w.days?.forEach((d) => { count += d.tasks?.filter((t) => t.status === 'completed').length || 0; })));
      return s + count;
    }, 0);

    // Streak
    let streak = 0;
    const d = new Date();
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (state.globalStudyHours.some((h) => h.date === ds)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }

    // Badges
    const badges = [];
    if (totalHours >= 1) badges.push({ name: 'First Hour', icon: '⏰', desc: 'Logged 1 hour' });
    if (totalHours >= 10) badges.push({ name: '10 Hours', icon: '📚', desc: 'Logged 10 hours' });
    if (totalHours >= 50) badges.push({ name: '50 Hours', icon: '🏆', desc: 'Logged 50 hours' });
    if (totalHours >= 100) badges.push({ name: 'Century', icon: '💯', desc: 'Logged 100 hours' });
    if (streak >= 3) badges.push({ name: '3-Day Streak', icon: '🔥', desc: 'Studied 3 days in a row' });
    if (streak >= 7) badges.push({ name: 'Week Warrior', icon: '⚡', desc: '7-day streak' });
    if (streak >= 30) badges.push({ name: 'Monthly Master', icon: '👑', desc: '30-day streak' });
    if (completedTasks >= 10) badges.push({ name: 'Task Crusher', icon: '✅', desc: 'Completed 10 tasks' });
    if (completedTasks >= 50) badges.push({ name: 'Task Master', icon: '🎯', desc: 'Completed 50 tasks' });
    if (totalPlans >= 3) badges.push({ name: 'Planner', icon: '📋', desc: 'Created 3 plans' });

    return { totalPlans, totalHours: Math.round(totalHours * 10) / 10, totalTasks, completedTasks, streak, badges };
  }, [state.plans, state.globalStudyHours]);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: form });
    showToast('Profile updated', 'success');
    setEditing(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, avatar: reader.result });
      if (!editing) {
        dispatch({ type: 'UPDATE_PROFILE', payload: { avatar: reader.result } });
        showToast('Avatar updated', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  if (!profile) return null;

  return (
    <DashboardLayout title="Profile" subtitle="Your study profile and achievements">
      <div ref={containerRef} className="space-y-6">
        {/* Profile Card */}
        <div className="profile-card glass gradient-border rounded-2xl p-6">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <label className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group shrink-0">
              {(editing ? form.avatar : profile.avatar) ? (
                <img src={editing ? form.avatar : profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>

            {/* Info */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40" />
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40" />
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" rows={2} className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40 resize-none" />
                  <input type="text" value={form.learningGoal} onChange={(e) => setForm({ ...form, learningGoal: e.target.value })} placeholder="Learning Goal" className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40" />
                  <div>
                    <label className="text-xs text-dark-300 mb-1 block">Daily Goal (hours)</label>
                    <input type="number" min={1} max={24} value={form.dailyGoal} onChange={(e) => setForm({ ...form, dailyGoal: parseInt(e.target.value) || 1 })} className="w-24 px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-brand-500/20 text-brand-400 text-sm font-medium hover:bg-brand-500/30 cursor-pointer flex items-center gap-1"><Check className="w-4 h-4" /> Save</button>
                    <button onClick={() => { setEditing(false); setForm(profile); }} className="px-4 py-2 rounded-xl text-dark-300 hover:text-white text-sm cursor-pointer flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                    <button onClick={() => { setEditing(true); setForm(profile); }} className="text-dark-400 hover:text-white cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                  </div>
                  {profile.username && <p className="text-sm text-dark-400">@{profile.username}</p>}
                  {profile.bio && <p className="text-sm text-dark-300 mt-2">{profile.bio}</p>}
                  {profile.learningGoal && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-dark-300">
                      <Target className="w-3.5 h-3.5 text-brand-400" />
                      <span>{profile.learningGoal}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-dark-500 mt-2">Joined {formatDate(profile.createdAt, 'MMMM yyyy')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Hours', value: stats.totalHours, suffix: 'h', icon: Clock, color: '#6366f1' },
            { label: 'Plans', value: stats.totalPlans, suffix: '', icon: BookOpen, color: '#8b5cf6' },
            { label: 'Tasks Done', value: stats.completedTasks, suffix: '', icon: Target, color: '#34d399' },
            { label: 'Streak', value: stats.streak, suffix: 'd', icon: Flame, color: '#f97316' },
            { label: 'Badges', value: stats.badges.length, suffix: '', icon: Award, color: '#fbbf24' },
          ].map((s) => (
            <div key={s.label} className="profile-card glass gradient-border rounded-2xl p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
              <AnimatedCounter value={s.value} suffix={s.suffix} className="text-lg font-bold text-white block" />
              <p className="text-[10px] text-dark-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="profile-card glass gradient-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-neon-amber" /> Achievements
          </h3>
          {stats.badges.length === 0 ? (
            <p className="text-dark-400 text-sm text-center py-6">Start studying to unlock badges!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {stats.badges.map((badge) => (
                <div key={badge.name} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-800/50 hover:bg-glass-hover transition-all">
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-xs font-medium text-white text-center">{badge.name}</span>
                  <span className="text-[10px] text-dark-400 text-center">{badge.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
