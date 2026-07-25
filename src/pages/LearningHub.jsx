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

const cardStyle = { background: 'linear-gradient(145deg, #191922, #111116)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' };
const inputStyle = { background: '#101014', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f7' };
const activeTabStyle = { background: 'linear-gradient(90deg, #222230, #161622)', color: '#f2d894', border: '1px solid rgba(212,168,67,0.4)' };
const inactiveTabStyle = { background: 'linear-gradient(90deg, #181820, #121217)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.08)' };

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
          <h2 className="text-xl font-bold text-[#f2d894] flex items-center gap-2">
            <Youtube className="w-6 h-6 text-[#c49235]" /> YouTube Learning Hub
          </h2>
          <p className="text-xs text-[#94a3b8]">Track tutorials and video study sessions across all plans</p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 flex flex-col items-center justify-center text-center" style={cardStyle}>
          <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-0.5">Total Tutorials</span>
          <span className="text-xl font-bold text-[#f5f5f7]">{stats.total}</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center text-center" style={cardStyle}>
          <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-0.5">In Progress</span>
          <span className="text-xl font-bold text-[#c49235]">{stats.watching}</span>
        </div>
        <div className="p-4 flex flex-col items-center justify-center text-center" style={cardStyle}>
          <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-0.5">Completed</span>
          <span className="text-xl font-bold text-[#4a7c3f]">{stats.completed}</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-5 mb-6 flex flex-col gap-4" style={cardStyle}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'watching', label: 'Watching' },
              { id: 'not-started', label: 'Not Started' },
              { id: 'completed', label: 'Completed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border"
                style={selectedStatus === tab.id ? activeTabStyle : inactiveTabStyle}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search tutorial tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-[#c49235] border transition-all inset-field"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
          {/* Plan Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8]">Filter by Plan:</span>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-[#f5f5f7] focus:outline-none bg-[#18181f]"
            >
              <option value="all">All Plans</option>
              {plansWithTutorials.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-[#f5f5f7] focus:outline-none bg-[#18181f]"
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
          <Youtube className="w-12 h-12 text-[#94a3b8] mb-3" />
          <h3 className="text-sm font-semibold text-[#f2d894] mb-1">No tutorials match filters</h3>
          <p className="text-xs text-[#94a3b8]">Try expanding your search query or selecting a different tab.</p>
        </div>
      ) : (
        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTutorials.map((item) => (
            <div
              key={`${item.planId}-${item.taskId}`}
              onClick={() => navigate(`/learn/${item.planId}/${item.taskId}`)}
              className="tutorial-card cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col group bg-[#18181f] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-t-2xl overflow-hidden bg-black/10">
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
                  <div className="p-3.5 rounded-full bg-[#c49235] text-white shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>
                {item.duration > 0 && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-semibold text-white">
                    {formatDuration(item.duration)}
                  </span>
                )}
                {/* Embedded Progress Bar */}
                {item.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e2d6c1]">
                    <div className="h-full bg-[#c49235]" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </div>

              {/* Info Area */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.planColor || '#c49235' }} />
                  <span className="text-[10px] text-[#94a3b8] truncate">{item.planName}</span>
                </div>
                <h4 className="text-xs font-bold text-[#f5f5f7] line-clamp-2 leading-snug group-hover:text-[#c49235] transition-colors mb-2">
                  {item.taskTitle}
                </h4>

                <div className="mt-auto pt-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-[10px] text-[#94a3b8]">
                  <span className="capitalize font-semibold" style={{ color: item.status === 'completed' ? '#4a7c3f' : item.status === 'watching' ? '#c49235' : '#6e6458' }}>
                    {item.status.replace('-', ' ')}
                  </span>
                  <span>
                    {item.progress > 0 ? `${Math.round(item.progress)}% watched` : 'Not watched'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
