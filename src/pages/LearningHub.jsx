import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { extractVideoId, getThumbnailUrl, formatDuration } from '../utils/youtube';
import {
  Search, Filter, Youtube, Play, Clock, BookOpen,
  CheckCircle2, Circle, ExternalLink, RefreshCw, BarChart2
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

      {/* Main HUD Row: Dual Concentric Circular Ring + Premium Segmented Glow Pills */}
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
  const { state } = useStudy();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [search, setSearch] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, progress, title

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-main flex items-center gap-2">
            <Youtube className="w-6 h-6 text-accent-primary" /> YouTube Learning Hub
          </h2>
          <p className="text-xs text-muted">Track tutorials and video study sessions across all plans</p>
        </div>
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
        <div className="p-12 text-center rounded-2xl flex flex-col items-center justify-center" style={cardStyle}>
          <Youtube className="w-12 h-12 text-muted mb-3" />
          <h3 className="text-sm font-semibold text-main mb-1">No tutorials match filters</h3>
          <p className="text-xs text-muted">Try expanding your search query or selecting a different tab.</p>
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
    </DashboardLayout>
  );
}
