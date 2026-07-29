import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { extractVideoId, getThumbnailUrl, formatDuration } from '../utils/youtube';
import {
  Search, Filter, Youtube, Play, Clock, BookOpen,
  CheckCircle2, Circle, ExternalLink, RefreshCw, BarChart2,
  Plus, X, Link2, Sparkles, Check
} from 'lucide-react';

const cardStyle = {
  background: 'var(--neu-card-bg)',
  border: '1px solid var(--neu-border)',
  borderRadius: '1.25rem',
  boxShadow: 'var(--neu-shadow-raised)',
  color: 'var(--neu-text-main)',
};

const inputStyle = {
  background: 'var(--neu-card-bg)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  color: 'var(--neu-text-main)',
  boxShadow: 'var(--neu-shadow-inset)',
};

const activeTabStyle = {
  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.4)',
  boxShadow: '4px 4px 10px rgba(163, 177, 198, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.8)',
};

const inactiveTabStyle = {
  background: 'var(--neu-card-bg)',
  color: 'var(--neu-text-muted)',
  border: '1px solid var(--neu-border)',
  boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.8)',
};

// ── Ultra-Premium Futuristic HUD Progress Component ──
function FuturisticHudProgress({ progress = 0 }) {
  const percent = Math.min(100, Math.max(0, Math.round(progress)));
  const radius = 18;
  const circumference = 2 * Math.PI * radius; // ~113.1
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="p-3 rounded-2xl border flex flex-col gap-2 justify-center transition-all duration-300 group/hud relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.04) 0%, var(--neu-inset-bg) 100%)',
        borderColor: 'var(--neu-border)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), var(--neu-shadow-raised)',
      }}
    >
      {/* Top Header Label */}
      <div className="flex items-center justify-between text-[10px] font-bold text-muted uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
          Progress HUD
        </span>
        <span className="font-extrabold" style={{ color: 'var(--accent-orange-bright)' }}>
          {percent}%
        </span>
      </div>

      {/* Main HUD Row: Dual Concentric Circular HUD Ring + Premium Segmented Glow Pills */}
      <div className="flex items-center gap-3">
        {/* Dual Concentric Circular HUD Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 transform -rotate-90">
            {/* Background Inner Compass Ring */}
            <circle
              cx="24"
              cy="24"
              r="14"
              stroke="var(--neu-border-subtle)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              fill="transparent"
            />
            {/* Outer Background Track */}
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3.5"
              fill="transparent"
            />
            {/* Outer Glowing Progress Arc */}
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="var(--accent-orange)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
              style={{
                filter: 'drop-shadow(0 0 7px var(--accent-orange))',
              }}
            />
          </svg>
          {/* Centered Glowing Percentage Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-[10px] font-black tracking-tight"
              style={{
                color: 'var(--accent-orange-bright)',
                textShadow: '0 0 8px var(--accent-orange)',
              }}
            >
              {percent}
              <span className="text-[7px] font-bold">%</span>
            </span>
          </div>
        </div>

        {/* 10 Segmented Metallic Glass Glow Pills */}
        <div className="flex-1 flex gap-1 items-center h-4 p-1 rounded-xl bg-black/20 border border-white/5">
          {[...Array(10)].map((_, i) => {
            const barThreshold = ((i + 1) / 10) * 100;
            const isActive = percent >= barThreshold;
            return (
              <div
                key={i}
                className={`h-full flex-1 rounded-md transition-all duration-500 ${
                  isActive ? 'scale-y-105' : 'opacity-25'
                }`}
                style={{
                  background: isActive
                    ? 'var(--accent-btn-bg)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: isActive
                    ? '0 0 8px var(--accent-orange), inset 0 1px 1px rgba(255,255,255,0.6)'
                    : 'none',
                  border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LearningHub() {
  const { state, dispatch, showToast } = useStudy();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [search, setSearch] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, progress, title

  // Add YouTube Video Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  // Auto-select first plan when modal opens or plans load
  useEffect(() => {
    if (state.plans && state.plans.length > 0 && !selectedPlan) {
      setSelectedPlan(state.plans[0].id);
    }
  }, [state.plans, selectedPlan]);

  const activePlanObj = useMemo(() => {
    return (state.plans || []).find((p) => p.id === (selectedPlan || (state.plans[0] && state.plans[0].id)));
  }, [state.plans, selectedPlan]);

  const availableDays = useMemo(() => {
    if (!activePlanObj) return [];
    const days = [];
    activePlanObj.months?.forEach((m) => {
      m.weeks?.forEach((w) => {
        w.days?.forEach((d) => {
          days.push({ id: d.id, name: `${m.name} › ${d.name}` });
        });
      });
    });
    return days;
  }, [activePlanObj]);

  const previewVideoId = useMemo(() => {
    return inputUrl.trim() ? extractVideoId(inputUrl.trim()) : null;
  }, [inputUrl]);

  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      showToast('Please enter a YouTube video URL', 'error');
      return;
    }
    const videoId = extractVideoId(inputUrl.trim());
    if (!videoId) {
      showToast('Invalid YouTube video URL format', 'error');
      return;
    }

    const targetPlanId = selectedPlan || (state.plans[0] ? state.plans[0].id : null);
    if (!targetPlanId) {
      showToast('No active study plan found', 'error');
      return;
    }

    let targetDayId = selectedDay;
    if (!targetDayId && availableDays.length > 0) {
      targetDayId = availableDays[0].id;
    }

    const finalTitle = inputTitle.trim() || `YouTube Tutorial (${videoId})`;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        planId: targetPlanId,
        dayId: targetDayId,
        title: finalTitle,
        youtubeUrl: inputUrl.trim(),
        priority: 'high',
      },
    });

    showToast('YouTube Video Tutorial added successfully!', 'success');
    setShowAddModal(false);
    setInputUrl('');
    setInputTitle('');
  };

  // ── Collect all task tutorials across all plans ──
  const tutorials = useMemo(() => {
    const list = [];
    (state.plans || []).forEach((plan) => {
      if (plan.archived) return;
      
      plan.months?.forEach((month) => {
        month.weeks?.forEach((week) => {
          week.days?.forEach((day) => {
            day.tasks?.forEach((task) => {
              if (task.youtubeUrl) {
                const videoId = extractVideoId(task.youtubeUrl);
                if (videoId) {
                  const progressData = state.videoProgress[videoId];
                  let status = 'not-started';
                  let progressVal = 0;
                  let lastWatchedAt = null;

                  if (progressData) {
                    progressVal = progressData.progress || 0;
                    lastWatchedAt = progressData.lastWatchedAt;
                    if (progressVal >= 95) status = 'completed';
                    else if (progressVal > 0) status = 'watching';
                  }

                  list.push({
                    taskId: task.id,
                    taskTitle: task.title,
                    taskStatus: task.status,
                    youtubeUrl: task.youtubeUrl,
                    videoId,
                    planId: plan.id,
                    planName: plan.name,
                    planColor: plan.color,
                    monthName: month.name,
                    weekName: week.name,
                    dayName: day.name,
                    progress: progressVal,
                    currentTime: progressData?.currentTime || 0,
                    duration: progressData?.duration || 0,
                    status,
                    lastWatchedAt,
                  });
                }
              }
            });
          });
        });
      });
    });
    return list;
  }, [state.plans, state.videoProgress]);

  // ── Filter plans having tutorials ──
  const plansWithTutorials = useMemo(() => {
    const map = {};
    tutorials.forEach((t) => {
      map[t.planId] = t.planName;
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [tutorials]);

  // ── Stats Summary ──
  const stats = useMemo(() => {
    const total = tutorials.length;
    const watching = tutorials.filter((t) => t.status === 'watching').length;
    const completed = tutorials.filter((t) => t.status === 'completed').length;
    return { total, watching, completed };
  }, [tutorials]);

  // ── Filtered & Sorted Tutorials ──
  const filteredTutorials = useMemo(() => {
    let result = [...tutorials];

    // Filter by Plan
    if (selectedPlanId !== 'all') {
      result = result.filter((t) => t.planId === selectedPlanId);
    }

    // Filter by Status Tab
    if (selectedStatus !== 'all') {
      result = result.filter((t) => t.status === selectedStatus);
    }

    // Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.taskTitle.toLowerCase().includes(q));
    }

    // Sort
    if (sortBy === 'recent') {
      result.sort((a, b) => {
        if (!a.lastWatchedAt) return 1;
        if (!b.lastWatchedAt) return -1;
        return new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt);
      });
    } else if (sortBy === 'progress') {
      result.sort((a, b) => b.progress - a.progress);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.taskTitle.localeCompare(b.taskTitle));
    }

    return result;
  }, [tutorials, selectedPlanId, selectedStatus, search, sortBy]);

  // ── GSAP Staggered Entrance Animation ──
  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.tutorial-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', overwrite: 'auto' }
        );
      }
    }
  }, [filteredTutorials.length, selectedStatus, selectedPlanId]);

  return (
    <DashboardLayout>
      <div className="p-5 mb-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={cardStyle}>
        <div>
          <h2 className="text-xl font-bold text-main flex items-center gap-2">
            <Youtube className="w-6 h-6 text-accent-primary" /> YouTube Learning Hub
          </h2>
          <p className="text-xs text-muted">Track tutorials and video study sessions across all plans</p>
        </div>

        {/* Animated Round RGB Glow Button to Add YouTube Link */}
        <button
          onClick={() => setShowAddModal(true)}
          className="rgb-theme-glow-btn px-5 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-extrabold shadow-xl cursor-pointer group transition-all shrink-0"
          title="Add YouTube Video Link"
        >
          <div className="relative flex items-center justify-center">
            <Youtube className="w-4.5 h-4.5 text-[var(--accent-orange)] group-hover:scale-110 transition-transform duration-300 fill-current" />
            <Plus className="w-3 h-3 absolute -top-1.5 -right-1.5 text-white bg-[var(--accent-orange)] rounded-full p-0.5 shadow font-bold" />
          </div>
          <span className="tracking-wide">Add Video Link</span>
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 flex flex-col items-center justify-center text-center" style={cardStyle}>
          <span className="text-[10px] uppercase font-bold text-muted mb-0.5">Total Tutorials</span>
          <span className="text-xl font-bold text-main">{stats.total}</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center text-center" style={cardStyle}>
          <span className="text-[10px] uppercase font-bold text-muted mb-0.5">In Progress</span>
          <span className="text-xl font-bold text-accent-primary">{stats.watching}</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center text-center" style={cardStyle}>
          <span className="text-[10px] uppercase font-bold text-muted mb-0.5">Completed</span>
          <span className="text-xl font-bold text-[#38a169]">{stats.completed}</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-5 mb-6 flex flex-col gap-4" style={cardStyle}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs with Accordion Glow Expansion Animation */}
          <div className="accordion-glow-container flex-1 max-w-xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'watching', label: 'Watching' },
              { id: 'not-started', label: 'Not Started' },
              { id: 'completed', label: 'Completed' }
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`accordion-glow-tab ${isActive ? 'active' : ''}`}
                  style={{ borderColor: '#26658c' }}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent-primary z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tutorial tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-6 py-2.5 text-xs rounded-full focus:outline-none premium-search-input text-center font-bold tracking-wider"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
          {/* Plan Filter */}
          <div className="flex items-center gap-2">
            <span className="text-muted">Filter by Plan:</span>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-white/60 text-main focus:outline-none inset-field"
            >
              <option value="all">All Plans</option>
              {plansWithTutorials.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-muted">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-white/60 text-main focus:outline-none inset-field"
            >
              <option value="recent">Recently Watched</option>
              <option value="progress">Progress %</option>
              <option value="title">Task Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredTutorials.length === 0 ? (
        <div className="p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-4" style={cardStyle}>
          <div className="rgb-theme-glow-btn w-16 h-16 rounded-full flex items-center justify-center shadow-2xl">
            <Youtube className="w-8 h-8 text-[var(--accent-orange)] fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-main mb-1">No tutorials in your Learning Hub yet</h3>
            <p className="text-xs text-muted max-w-sm">Attach a YouTube video tutorial to any topic in your roadmap to get started.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rgb-theme-glow-btn px-6 py-3 rounded-full text-xs font-extrabold shadow-xl cursor-pointer flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4 text-white bg-[var(--accent-orange)] rounded-full p-0.5 font-bold" />
            <span>Add YouTube Video Link</span>
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="space-y-5">
          {filteredTutorials.map((item) => (
            <div
              key={`${item.planId}-${item.taskId}`}
              onClick={() => navigate(`/learn/${item.planId}/${item.taskId}`)}
              className="notebook-settings-card p-4 sm:p-5 cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row gap-5 group"
              style={cardStyle}
            >
              {/* Left Box: YouTube Video Thumbnail */}
              <div className="w-full md:w-64 lg:w-72 aspect-video rounded-xl overflow-hidden bg-black/10 relative shrink-0">
                <img
                  src={getThumbnailUrl(item.videoId)}
                  alt={item.taskTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                  <div className="p-3.5 rounded-full bg-[var(--accent-orange)] text-white shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>
                {item.duration > 0 && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-semibold text-white">
                    {formatDuration(item.duration)}
                  </span>
                )}
              </div>

              {/* Right Side: Top Topic Name Box + 3-Box Bottom Row */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                {/* Top Box: Topic Name (Centered) */}
                <div className="p-3.5 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-inset-bg)] flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.planColor || 'var(--accent-orange)' }} />
                    <span className="text-[10px] font-bold text-muted truncate uppercase tracking-wider text-center">{item.planName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-main text-center line-clamp-2 leading-snug group-hover:text-accent-primary transition-colors">
                    {item.taskTitle}
                  </h4>
                </div>

                {/* Bottom Row: 3 Boxes (Total Duration, Completed Time, Animated Futuristic HUD Progress) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Box 1: Total Duration (Centered) */}
                  <div className="p-3 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-inset-bg)] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-muted mb-0.5 flex items-center justify-center gap-1 text-center">
                      <Clock className="w-3 h-3 text-accent-primary" /> Total Duration
                    </span>
                    <span className="text-xs font-bold text-main text-center">
                      {item.duration > 0 ? formatDuration(item.duration) : '10:53:55'}
                    </span>
                  </div>

                  {/* Box 2: Completed Time of Video (Centered) */}
                  <div className="p-3 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-inset-bg)] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-muted mb-0.5 flex items-center justify-center gap-1 text-center">
                      <CheckCircle2 className="w-3 h-3 text-[#38a169]" /> Completed Time
                    </span>
                    <span className="text-xs font-bold text-main text-center">
                      {item.currentTime > 0 ? formatDuration(item.currentTime) : item.duration > 0 ? formatDuration(Math.round((item.duration * item.progress) / 100)) : '0:00'}
                    </span>
                  </div>

                  {/* Box 3: Futuristic HUD Progress Bar */}
                  <FuturisticHudProgress progress={item.progress} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (RGB Glow Round Button) */}
      <div className="fixed bottom-16 right-8 z-[9999]">
        <button
          onClick={() => setShowAddModal(true)}
          className="rgb-theme-glow-btn w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer group"
          title="Add YouTube Video Tutorial"
        >
          <div className="relative flex items-center justify-center">
            <Youtube className="w-6 h-6 text-[var(--accent-orange)] group-hover:scale-110 transition-transform duration-300 fill-current" />
            <Plus className="w-3.5 h-3.5 absolute -top-1.5 -right-1.5 text-white bg-[var(--accent-orange)] rounded-full p-0.5 shadow font-bold" />
          </div>
        </button>
      </div>

      {/* Add YouTube Video Link Modal Popup */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 relative neu-card flex flex-col space-y-4"
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full cursor-pointer hover:bg-[var(--neu-hover-bg)] text-muted hover:text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="rgb-theme-glow-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                <Youtube className="w-5 h-5 text-[var(--accent-orange)] fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-main">Add YouTube Link</h3>
                <p className="text-xs text-muted">Attach a YouTube video tutorial to your study plan</p>
              </div>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">YouTube Video Link *</label>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-accent-primary pointer-events-none" />
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none inset-field"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Live Video Thumbnail Preview Box */}
              {previewVideoId && (
                <div className="p-3 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-inset-bg)] flex items-center gap-3 animate-fade-in">
                  <img
                    src={getThumbnailUrl(previewVideoId)}
                    alt="Preview"
                    className="w-24 aspect-video rounded-lg object-cover shadow"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider block">Valid Video Detected</span>
                    <p className="text-xs font-semibold text-main truncate">ID: {previewVideoId}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Topic / Tutorial Title</label>
                <input
                  type="text"
                  placeholder="e.g. Python Core Basics & Data Types"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl focus:outline-none inset-field"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Target Study Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => {
                    setSelectedPlan(e.target.value);
                    setSelectedDay('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl focus:outline-none inset-field"
                >
                  {(state.plans || []).map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>

              {availableDays.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Target Module / Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl focus:outline-none inset-field"
                  >
                    {availableDays.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="leather-btn px-4 py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brass-btn px-5 py-2 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Add Tutorial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
