import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import TreeView from '../components/TreeView';
import ActivityTimeline from '../components/ActivityTimeline';
import EmptyState from '../components/EmptyState';
import { ProgressRing } from '../components/Charts';
import { exportToPDF, exportToCSV, exportToExcel, importFromCSV, importFromExcel, buildPlanFromImport } from '../utils/exportImport';
import { calculateProgress, getAllTasksInPlan, formatDate } from '../utils/helpers';
import {
  Plus, ChevronLeft, Trash2, Edit3, Save, X, Check,
  FileUp, FileDown, FolderPlus, GripVertical, Youtube, Play, Link2, Video
} from 'lucide-react';
import { extractVideoId, isValidYoutubeUrl, calcVideoProgress, getThumbnailUrl } from '../utils/youtube';

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
  borderRadius: '0.75rem',
  boxShadow: 'var(--neu-shadow-inset)',
};

export default function PlanDetail() {
  const { planId } = useParams();
  const { state, dispatch, showToast } = useStudy();
  const navigate = useNavigate();
  const plan = (state.plans || []).find((p) => p.id === planId);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [view, setView] = useState('tree');
  const [editingName, setEditingName] = useState(false);
  const [planName, setPlanName] = useState(plan?.name || '');
  const [showAddMonth, setShowAddMonth] = useState(false);
  const [addMonthName, setAddMonthName] = useState('');
  const [showAddMonthModal, setShowAddMonthModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDayId, setVideoDayId] = useState('');
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [addWeekMonth, setAddWeekMonth] = useState(null);
  const [addDayWeek, setAddDayWeek] = useState(null);
  const [addTaskDay, setAddTaskDay] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingDate, setEditingDate] = useState(null);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [editingTaskUrl, setEditingTaskUrl] = useState('');

  const allDays = useMemo(() => {
    if (!plan) return [];
    const list = [];
    (plan.months || []).forEach((m) => {
      (m.weeks || []).forEach((w) => {
        (w.days || []).forEach((d) => {
          list.push({ id: d.id, name: `${m.name} › ${w.name} › ${d.name}` });
        });
      });
    });
    return list;
  }, [plan]);

  const previewVideoId = useMemo(() => {
    return videoUrl.trim() ? extractVideoId(videoUrl.trim()) : null;
  }, [videoUrl]);

  useEffect(() => {
    if (plan) dispatch({ type: 'SET_UI', payload: { activePlanId: plan.id } });
  }, [plan, dispatch]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
  }, [planId]);

  const stats = useMemo(() => {
    if (!plan) return { total: 0, completed: 0, progress: 0 };
    const tasks = getAllTasksInPlan(plan);
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { total: tasks.length, completed, progress: calculateProgress(completed, tasks.length) };
  }, [plan]);

  if (!plan) {
    return (
      <DashboardLayout>
        <EmptyState title="Plan Not Found" description="The plan you're looking for doesn't exist." actionLabel="Go to Plans" onAction={() => navigate('/plans')} />
      </DashboardLayout>
    );
  }

  const handleRenameSave = () => {
    if (planName.trim()) {
      dispatch({ type: 'UPDATE_PLAN', payload: { id: plan.id, updates: { name: planName.trim() } } });
    }
    setEditingName(false);
  };

  const handleAddMonthSubmit = (e) => {
    e?.preventDefault();
    const name = addMonthName.trim();
    dispatch({ type: 'ADD_MONTH', payload: { planId: plan.id, name: name || undefined } });
    showToast(name ? `Added ${name}` : 'Month added', 'success');
    setAddMonthName('');
    setShowAddMonthModal(false);
    setShowAddMonth(false);
  };

  const handleAddVideoSubmit = (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      showToast('Please enter a YouTube video URL', 'error');
      return;
    }
    const videoId = extractVideoId(videoUrl.trim());
    if (!videoId) {
      showToast('Invalid YouTube video link or ID', 'error');
      return;
    }
    const targetDayId = videoDayId || (allDays.length > 0 ? allDays[0].id : null);
    const finalTitle = videoTitle.trim() || `YouTube Tutorial (${videoId})`;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        planId: plan.id,
        dayId: targetDayId,
        title: finalTitle,
        youtubeUrl: videoUrl.trim(),
        priority: 'high',
      },
    });

    showToast('YouTube Video Tutorial added successfully!', 'success');
    setShowAddVideoModal(false);
    setVideoUrl('');
    setVideoTitle('');
  };

  const handleAddMonth = (e) => {
    handleAddMonthSubmit(e);
  };

  const handleAddWeek = (e, monthId) => {
    e.preventDefault();
    dispatch({ type: 'ADD_WEEK', payload: { planId: plan.id, monthId, name: newItemName.trim() || undefined } });
    showToast('Week added', 'success');
    setNewItemName('');
    setAddWeekMonth(null);
  };

  const handleAddDay = (e, weekId) => {
    e.preventDefault();
    dispatch({ type: 'ADD_DAY', payload: { planId: plan.id, weekId, name: newItemName.trim() || undefined, date: '' } });
    showToast('Day added', 'success');
    setNewItemName('');
    setAddDayWeek(null);
  };

  const handleAddTask = (e, dayId) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const url = newYoutubeUrl.trim();
    if (url && !isValidYoutubeUrl(url)) {
      showToast('Invalid YouTube URL', 'warning');
      return;
    }
    dispatch({
      type: 'ADD_TASK',
      payload: {
        planId: plan.id,
        dayId,
        title: newItemName.trim(),
        youtubeUrl: url
      }
    });
    showToast('Task added', 'success');
    setNewItemName('');
    setNewYoutubeUrl('');
    setAddTaskDay(null);
  };

  const handleEditTaskSave = (e, task) => {
    e.preventDefault();
    if (!editingTaskName.trim()) return;
    const url = editingTaskUrl.trim();
    if (url && !isValidYoutubeUrl(url)) {
      showToast('Invalid YouTube URL', 'warning');
      return;
    }
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        planId: plan.id,
        taskId: task.id,
        updates: { title: editingTaskName.trim(), youtubeUrl: url }
      }
    });
    showToast('Task updated', 'success');
    setEditingTaskId(null);
  };

  const handleDateChange = (dayId, newDate) => {
    dispatch({ type: 'UPDATE_DAY_DATE_SMART', payload: { planId: plan.id, dayId, newDate } });
    showToast('Dates updated', 'info');
    setEditingDate(null);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let data;
      if (file.name.endsWith('.csv')) data = await importFromCSV(file);
      else data = await importFromExcel(file);
      const imported = buildPlanFromImport(data, file.name.replace(/\.\w+$/, ''));
      imported.months.forEach((month) => {
        dispatch({ type: 'ADD_MONTH', payload: { planId: plan.id, name: month.name } });
      });
      showToast('Data imported successfully', 'success');
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
    e.target.value = '';
  };

  const btnStyle = (active) => ({
    padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    background: active ? 'var(--neu-card-bg)' : 'transparent',
    color: active ? 'var(--accent-orange)' : '#718096',
    boxShadow: active ? 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.9)' : 'none',
    border: active ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid transparent',
  });

  return (
    <DashboardLayout>
      <div ref={containerRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/plans')} className="p-2 rounded-xl hover:bg-[var(--neu-hover-bg)] hover:text-main transition-all cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} className="px-3 py-1.5 rounded-lg text-lg font-semibold focus:outline-none" style={{ ...inputStyle, borderColor: 'var(--accent-orange)' }} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()} />
                <button onClick={handleRenameSave} className="cursor-pointer" style={{ color: '#38a169' }}><Check className="w-5 h-5" /></button>
                <button onClick={() => setEditingName(false)} className="cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: plan.color || 'var(--accent-orange)' }} />
                <h1 className="text-xl font-bold text-main">{plan.name}</h1>
                <button onClick={() => { setEditingName(true); setPlanName(plan.name); }} className="cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}><Edit3 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMonthModal(true)}
              className="brass-btn px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Add a new Month to this roadmap"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Add Month
            </button>
            <button
              onClick={() => {
                setShowAddVideoModal(true);
                if (!videoDayId && allDays.length > 0) setVideoDayId(allDays[0].id);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-white shadow-sm hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' }}
              title="Attach a YouTube Video Tutorial to this roadmap"
            >
              <Youtube className="w-3.5 h-3.5" /> Add Video
            </button>
            <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl hover:bg-[var(--neu-hover-bg)] cursor-pointer transition-all" style={{ color: 'var(--neu-text-muted)' }} title="Import"><FileUp className="w-4 h-4" /></button>
            <button onClick={() => exportToPDF(plan)} className="p-2 rounded-xl hover:bg-[var(--neu-hover-bg)] cursor-pointer transition-all" style={{ color: 'var(--neu-text-muted)' }} title="PDF"><FileDown className="w-4 h-4" /></button>
            <button onClick={() => exportToExcel(plan)} className="p-2 rounded-xl hover:bg-[var(--neu-hover-bg)] cursor-pointer transition-all" style={{ color: 'var(--neu-text-muted)' }} title="Excel"><FileDown className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-8 mb-8 flex-wrap">
          <ProgressRing percent={stats.progress} size={56} strokeWidth={4} color={plan.color || 'var(--accent-orange)'} />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-main">{stats.completed}</span>
              <span className="text-sm text-muted">/ {stats.total} tasks</span>
            </div>
            <p className="text-xs text-muted">Total roadmap tasks</p>
          </div>
          <div className="flex items-center gap-1 bg-[var(--neu-card-bg)] p-1 rounded-xl border border-[var(--neu-border-subtle)]">
            <button
              onClick={() => setView('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                view === 'tree' ? 'brass-btn' : 'text-muted hover:text-main'
              }`}
            >
              Tree
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                view === 'list' ? 'brass-btn' : 'text-muted hover:text-main'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                view === 'overview' ? 'brass-btn' : 'text-muted hover:text-main'
              }`}
            >
              Overview & Tracks
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {view === 'overview' ? (
              <div className="space-y-6">
                {/* 12-Month Roadmap Target & Strategy Card */}
                <div className="p-6 space-y-4" style={cardStyle}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ed8936] to-[#dd6b20] flex items-center justify-center shrink-0 text-white font-bold shadow-md">
                      🚀
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-main">AI-Enabled Full-Stack Software Engineer</h2>
                      <p className="text-xs text-muted">12-Month Job-Ready Engineering Roadmap · 3 Hours / Day Target</p>
                    </div>
                  </div>

                  {/* Target Roles */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary mb-2">🎯 Target Job Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Full-Stack Developer', 'Software Engineer / SDE-1', 'Junior Full-Stack Developer', 'Frontend Engineer', 'Backend Engineer', 'Product Engineer', 'AI Application Developer', 'Generative AI Developer'].map((role) => (
                        <span key={role} className="text-xs px-3 py-1 rounded-lg bg-[var(--neu-card-bg)] text-main font-medium border border-[var(--neu-border)] shadow-sm">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Daily Study Structure (3 Hours) */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary mb-2">⏱ Daily 3-Hour Study Structure</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border border-[var(--neu-border)] bg-black/10 text-center">
                        <span className="text-xs font-bold text-main block">60–75 min</span>
                        <span className="text-[10px] text-muted">Main Topic Learning</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--neu-border)] bg-black/10 text-center">
                        <span className="text-xs font-bold text-main block">45 min</span>
                        <span className="text-[10px] text-muted">Coding / Practice</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--neu-border)] bg-black/10 text-center">
                        <span className="text-xs font-bold text-main block">45–60 min</span>
                        <span className="text-[10px] text-muted">Project Implementation</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--neu-border)] bg-black/10 text-center">
                        <span className="text-xs font-bold text-main block">15 min</span>
                        <span className="text-[10px] text-muted">Active Revision & Aloud</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parallel Tracks Grid */}
                <div className="p-6 space-y-4" style={cardStyle}>
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    <span>🛣</span> 4 Parallel Engineering Tracks
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-[#6366f1]/30 bg-[#6366f1]/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#818cf8]">🧮 DSA Track</span>
                        <span className="text-[10px] font-mono font-bold text-[#818cf8]">150–250 Problems</span>
                      </div>
                      <p className="text-xs text-main">Big-O ➔ Arrays/Strings ➔ Pointers ➔ Stack/Queue/Trees ➔ Graphs ➔ DP & Mock Interviews</p>
                    </div>

                    <div className="p-4 rounded-xl border border-[#38a169]/30 bg-[#38a169]/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#48bb78]">🗄 SQL Track</span>
                        <span className="text-[10px] font-mono font-bold text-[#48bb78]">100+ Problems</span>
                      </div>
                      <p className="text-xs text-main">SELECT/WHERE ➔ JOINS ➔ Group By ➔ CTEs ➔ Window Functions ➔ PostgreSQL Indexing</p>
                    </div>

                    <div className="p-4 rounded-xl border border-[#ed8936]/30 bg-[#ed8936]/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#ed8936]">💻 CS Fundamentals Track</span>
                        <span className="text-[10px] font-mono font-bold text-[#ed8936]">Months 3–12</span>
                      </div>
                      <p className="text-xs text-main">Computer Networks ➔ DBMS ➔ Object Oriented Programming ➔ Operating Systems ➔ System Design</p>
                    </div>

                    <div className="p-4 rounded-xl border border-[#ecc94b]/30 bg-[#ecc94b]/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#ecc94b]">🗣 Communication Track</span>
                        <span className="text-[10px] font-mono font-bold text-[#ecc94b]">15 min / day</span>
                      </div>
                      <p className="text-xs text-main">Explain topic aloud daily ➔ Explain bugs solved ➔ Sunday 2-min technical topic video recording</p>
                    </div>
                  </div>
                </div>

                {/* Topic & Project Status System Pipelines */}
                <div className="p-6 space-y-4" style={cardStyle}>
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    <span>📊</span> Engineering Mastery Progression Pipelines
                  </h3>
                  
                  {/* Topic Status Pipeline */}
                  <div>
                    <span className="text-xs font-semibold text-muted block mb-2">Topic Mastery Lifecycle</span>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {['Not Started', 'Learning', 'Practicing', 'Applied', 'Mastered', 'Interview Ready'].map((step, idx) => (
                        <React.Fragment key={step}>
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                            idx === 5 ? 'bg-[#38a169] text-white' : idx >= 3 ? 'bg-[var(--accent-orange)] text-white' : 'bg-[var(--neu-card-bg)] text-main border border-[var(--neu-border)]'
                          }`}>
                            {step}
                          </span>
                          {idx < 5 && <span className="text-muted text-xs shrink-0">➔</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Project Status Pipeline */}
                  <div>
                    <span className="text-xs font-semibold text-muted block mb-2">Project Lifecycle Pipeline</span>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {['Planning', 'Development', 'Testing', 'Deployment', 'Documentation', 'Portfolio Ready'].map((step, idx) => (
                        <React.Fragment key={step}>
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                            idx === 5 ? 'bg-[#3182ce] text-white' : 'bg-[var(--neu-card-bg)] text-main border border-[var(--neu-border)]'
                          }`}>
                            {step}
                          </span>
                          {idx < 5 && <span className="text-muted text-xs shrink-0">➔</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3 Flagship Portfolio Projects */}
                <div className="p-6 space-y-4" style={cardStyle}>
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    <span>🏆</span> 3 Portfolio Flagship Projects
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">Project 1 (Month 8)</span>
                      <h4 className="text-xs font-bold text-main">Production Full-Stack SaaS</h4>
                      <p className="text-[11px] text-muted">Next.js 14, Express, PostgreSQL, Docker, AWS EC2, S3, Nginx, HTTPS & CI/CD</p>
                    </div>
                    <div className="p-4 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">Project 2 (Month 11)</span>
                      <h4 className="text-xs font-bold text-main">AI Document / RAG Assistant</h4>
                      <p className="text-[11px] text-muted">Python, FastAPI, pgvector, OpenAI API, Chunking, Reranking & Citations</p>
                    </div>
                    <div className="p-4 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">Project 3 (Month 12 Flagship)</span>
                      <h4 className="text-xs font-bold text-main">AI STUDY OS</h4>
                      <p className="text-[11px] text-muted">Full Architecture: Next.js, Express, PostgreSQL, Redis, BullMQ, RAG & Autonomous Agents</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : view === 'tree' ? (
              <div className="p-6" style={cardStyle}>
                <TreeView
                  plan={plan}
                  onTaskClick={(task) => {
                    dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: plan.id, taskId: task.id } });
                  }}
                  onAddMonth={() => setShowAddMonthModal(true)}
                />
                {(!plan.months || plan.months.length === 0) && (
                  <EmptyState title="No Months" description="Add your first month to start building your roadmap" actionLabel="Add Month" onAction={() => setShowAddMonthModal(true)} icon={FolderPlus} />
                )}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {(plan.months || []).map((month) => {
                  const mTasks = [];
                  (month.weeks || []).forEach((w) => (w.days || []).forEach((d) => (d.tasks || []).forEach((t) => mTasks.push(t))));
                  const mCompleted = mTasks.filter((t) => t.status === 'completed').length;
                  const mProgress = calculateProgress(mCompleted, mTasks.length);

                  return (
                    <div key={month.id} className="overflow-hidden" style={cardStyle}>
                      <button className="w-full flex items-center gap-3 p-5 hover:bg-[var(--neu-hover-bg)] transition-all cursor-pointer" onClick={() => setExpandedMonth(expandedMonth === month.id ? null : month.id)}>
                        <GripVertical className="w-4 h-4" style={{ color: 'var(--neu-text-muted)' }} />
                        <div className="flex-1 text-left">
                          <h3 className="text-sm font-semibold text-main">{month.name}</h3>
                          <p className="text-[11px]" style={{ color: 'var(--neu-text-muted)' }}>{mTasks.length} tasks · {mProgress}%</p>
                        </div>
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--neu-border-subtle)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${mProgress}%`, background: plan.color || 'var(--accent-orange)' }} />
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_MONTH', payload: { planId: plan.id, monthId: month.id } }); showToast('Month deleted', 'info'); }}
                          className="p-1 cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                      </button>

                      {expandedMonth === month.id && (
                        <div className="px-4 pb-4 space-y-2">
                          {(month.weeks || []).map((week) => {
                            const wTasks = [];
                            (week.days || []).forEach((d) => (d.tasks || []).forEach((t) => wTasks.push(t)));
                            const wCompleted = wTasks.filter((t) => t.status === 'completed').length;

                            return (
                              <div key={week.id} className="ml-4 pl-4" style={{ borderLeft: '1px solid var(--neu-border-subtle)' }}>
                                <button className="w-full flex items-center gap-2 py-2 hover:bg-[var(--neu-hover-bg)] rounded-lg px-2 transition-all cursor-pointer" onClick={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}>
                                  <GripVertical className="w-3.5 h-3.5" style={{ color: 'var(--neu-text-muted)' }} />
                                  <span className="text-sm flex-1 text-left" style={{ color: 'var(--neu-text-main)' }}>{week.name}</span>
                                  <span className="text-[10px]" style={{ color: 'var(--neu-text-muted)' }}>{wCompleted}/{wTasks.length}</span>
                                  <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_WEEK', payload: { planId: plan.id, weekId: week.id } }); }}
                                    className="p-1 cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}><Trash2 className="w-3 h-3" /></button>
                                </button>

                                {expandedWeek === week.id && (
                                  <div className="ml-4 space-y-1 mt-1">
                                    {(week.days || []).map((day) => (
                                      <div key={day.id} className="pl-3" style={{ borderLeft: '1px solid var(--neu-border-subtle)' }}>
                                        <button className="w-full flex items-center gap-2 py-1.5 hover:bg-[var(--neu-hover-bg)] rounded-lg px-2 transition-all cursor-pointer" onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}>
                                          <GripVertical className="w-3 h-3" style={{ color: 'var(--neu-text-muted)' }} />
                                          <span className="text-sm flex-1 text-left" style={{ color: 'var(--neu-text-main)' }}>{day.name}</span>
                                          {editingDate === day.id ? (
                                            <input type="date" defaultValue={day.date} className="rounded px-2 py-0.5 text-xs" style={{ ...inputStyle }} onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => handleDateChange(day.id, e.target.value)} onBlur={() => setEditingDate(null)} autoFocus />
                                          ) : (
                                            <button onClick={(e) => { e.stopPropagation(); setEditingDate(day.id); }} className="text-[10px] cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}>
                                              {day.date || 'Set date'}
                                            </button>
                                          )}
                                          <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_DAY', payload: { planId: plan.id, dayId: day.id } }); }}
                                            className="p-1 cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}><Trash2 className="w-3 h-3" /></button>
                                        </button>

                                        {expandedDay === day.id && (
                                          <div className="ml-4 space-y-1 mt-1 pb-2">
                                            {(day.tasks || []).map((task) => {
                                              const videoId = task.youtubeUrl ? extractVideoId(task.youtubeUrl) : null;
                                              const vp = videoId ? state.videoProgress[videoId] : null;
                                              const isEditing = editingTaskId === task.id;

                                              if (isEditing) {
                                                return (
                                                  <form key={task.id} onSubmit={(e) => handleEditTaskSave(e, task)} className="mt-2 space-y-2 p-3 rounded-lg border border-[var(--neu-border)]" style={{ background: 'var(--neu-card-bg)', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)' }}>
                                                    <div>
                                                      <label className="text-[10px] text-muted block mb-1">Task Title</label>
                                                      <input type="text" value={editingTaskName} onChange={(e) => setEditingTaskName(e.target.value)} className="w-full px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} autoFocus />
                                                    </div>
                                                    <div>
                                                      <label className="text-[10px] text-muted block mb-1">YouTube URL</label>
                                                      <input type="text" value={editingTaskUrl} onChange={(e) => setEditingTaskUrl(e.target.value)} placeholder="Paste YouTube URL here..." className="w-full px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                      <button type="submit" className="brass-btn px-2.5 py-1 text-[10px] cursor-pointer">Save</button>
                                                      <button type="button" onClick={() => setEditingTaskId(null)} className="leather-btn px-2.5 py-1 text-[10px] cursor-pointer">Cancel</button>
                                                    </div>
                                                  </form>
                                                );
                                              }

                                              return (
                                                <div key={task.id} className="py-1.5 px-2 rounded-lg hover:bg-[#ebf0f7] group">
                                                  <div className="flex items-center gap-2">
                                                    <button onClick={() => dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: plan.id, taskId: task.id } })}
                                                      className="w-3.5 h-3.5 rounded-full border-2 shrink-0 cursor-pointer transition-all"
                                                      style={{
                                                        borderColor: task.status === 'completed' ? '#38a169' : task.status === 'in-progress' ? 'var(--accent-orange)' : '#cbd5e0',
                                                        background: task.status === 'completed' ? '#38a169' : task.status === 'in-progress' ? 'rgba(237,137,54,0.15)' : 'transparent',
                                                      }} />
                                                    <span className="text-xs flex-1 truncate" style={{ color: task.status === 'completed' ? '#718096' : '#1a202c', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</span>
                                                    {videoId && (
                                                      <button onClick={() => navigate(`/learn/${plan.id}/${task.id}`)}
                                                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium cursor-pointer transition-all shrink-0"
                                                        style={{ background: 'rgba(237,137,54,0.15)', color: 'var(--accent-orange)' }}>
                                                        <Play className="w-3 h-3" /> Watch
                                                      </button>
                                                    )}
                                                    <button onClick={() => {
                                                      setEditingTaskId(task.id);
                                                      setEditingTaskName(task.title);
                                                      setEditingTaskUrl(task.youtubeUrl || '');
                                                    }} className="p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer text-muted hover:text-main"><Edit3 className="w-3 h-3" /></button>
                                                    <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: { planId: plan.id, taskId: task.id } })}
                                                      className="p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer" style={{ color: '#e53e3e' }}><Trash2 className="w-3 h-3" /></button>
                                                  </div>
                                                  {task.youtubeUrl && (
                                                    <div className="ml-6 mt-1 flex items-center gap-1 text-[9px]" style={{ color: 'var(--neu-text-muted)' }}>
                                                      <Youtube className="w-2.5 h-2.5 shrink-0 text-accent-primary" />
                                                      <span className="truncate">{task.youtubeUrl}</span>
                                                    </div>
                                                  )}
                                                  {vp && vp.progress > 0 && (
                                                    <div className="ml-6 mt-1 flex items-center gap-2">
                                                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#cbd5e0' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, vp.progress)}%`, background: vp.progress >= 95 ? '#38a169' : 'var(--accent-orange)' }} />
                                                      </div>
                                                      <span className="text-[9px]" style={{ color: 'var(--neu-text-muted)' }}>{Math.round(vp.progress)}% watched</span>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}

                                            {addTaskDay === day.id ? (
                                              <form onSubmit={(e) => handleAddTask(e, day.id)} className="mt-1 p-3 rounded-lg space-y-2 border border-[var(--neu-border)]" style={{ background: 'var(--neu-card-bg)', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)' }}>
                                                <div>
                                                  <label className="text-[10px] text-muted block mb-1">Task Title</label>
                                                  <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Learn Python Loops" autoFocus
                                                    className="w-full px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                                                </div>
                                                <div>
                                                  <label className="text-[10px] text-muted block mb-1">YouTube URL (Optional)</label>
                                                  <input type="text" value={newYoutubeUrl} onChange={(e) => setNewYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
                                                    className="w-full px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                  <button type="submit" className="brass-btn px-2.5 py-1 text-[10px] cursor-pointer">Add Task</button>
                                                  <button type="button" onClick={() => { setAddTaskDay(null); setNewItemName(''); setNewYoutubeUrl(''); }} className="leather-btn px-2.5 py-1 text-[10px] cursor-pointer">Cancel</button>
                                                </div>
                                              </form>
                                            ) : (
                                              <button onClick={() => { setAddTaskDay(day.id); setNewItemName(''); setNewYoutubeUrl(''); }} className="flex items-center gap-1 text-[11px] cursor-pointer ml-6" style={{ color: 'var(--neu-text-muted)' }}>
                                                <Plus className="w-3 h-3" /> Add Task
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {addDayWeek === week.id ? (
                                      <form onSubmit={(e) => handleAddDay(e, week.id)} className="flex gap-1 mt-1 ml-4">
                                        <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Day name" autoFocus
                                          className="flex-1 px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                                        <button type="submit" className="cursor-pointer" style={{ color: '#38a169' }}><Check className="w-4 h-4" /></button>
                                        <button type="button" onClick={() => { setAddDayWeek(null); setNewItemName(''); }} className="cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}><X className="w-4 h-4" /></button>
                                      </form>
                                    ) : (
                                      <button onClick={() => { setAddDayWeek(week.id); setNewItemName(''); }} className="flex items-center gap-1 text-[11px] cursor-pointer mt-1 ml-4" style={{ color: 'var(--neu-text-muted)' }}>
                                        <Plus className="w-3 h-3" /> Add Day
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {addWeekMonth === month.id ? (
                            <form onSubmit={(e) => handleAddWeek(e, month.id)} className="flex gap-1 mt-2 ml-4">
                              <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Week name" autoFocus
                                className="flex-1 px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                              <button type="submit" className="cursor-pointer" style={{ color: '#38a169' }}><Check className="w-4 h-4" /></button>
                              <button type="button" onClick={() => { setAddWeekMonth(null); setNewItemName(''); }} className="cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}><X className="w-4 h-4" /></button>
                            </form>
                          ) : (
                            <button onClick={() => { setAddWeekMonth(month.id); setNewItemName(''); }} className="flex items-center gap-1 text-xs cursor-pointer mt-2 ml-4" style={{ color: 'var(--neu-text-muted)' }}>
                              <Plus className="w-3.5 h-3.5" /> Add Week
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Month */}
                {showAddMonth ? (
                  <form onSubmit={handleAddMonth} className="p-4 flex gap-2" style={cardStyle}>
                    <input type="text" value={addMonthName} onChange={(e) => setAddMonthName(e.target.value)} placeholder="Month name" autoFocus
                      className="flex-1 px-3 py-2 text-sm rounded-xl focus:outline-none" style={{ ...inputStyle }} />
                    <button type="submit" className="brass-btn px-4 py-2 text-sm cursor-pointer">Add</button>
                    <button type="button" onClick={() => setShowAddMonth(false)} className="leather-btn px-3 py-2 cursor-pointer" style={{ color: 'var(--neu-text-muted)' }}><X className="w-4 h-4" /></button>
                  </form>
                ) : (
                  <button onClick={() => setShowAddMonth(true)} className="w-full py-3 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-[var(--accent-orange)]" style={{ borderRadius: '1rem', border: '2px dashed #cbd5e0', color: 'var(--neu-text-muted)' }}>
                    <FolderPlus className="w-4 h-4" /> Add Month
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="p-6" style={cardStyle}>
              <h3 className="text-sm font-semibold text-main mb-4">Plan Info</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span style={{ color: 'var(--neu-text-muted)' }}>Created</span><span style={{ color: 'var(--neu-text-main)' }}>{formatDate(plan.createdAt)}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--neu-text-muted)' }}>Months</span><span style={{ color: 'var(--neu-text-main)' }}>{plan.months?.length || 0}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--neu-text-muted)' }}>Tasks</span><span style={{ color: 'var(--neu-text-main)' }}>{stats.total}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--neu-text-muted)' }}>Completed</span><span style={{ color: '#38a169' }}>{stats.completed}</span></div>
              </div>
            </div>

            <div className="p-6" style={cardStyle}>
              <h3 className="text-sm font-semibold text-main mb-4">Activity</h3>
              <ActivityTimeline activities={[...(plan.activities || [])].reverse()} maxItems={8} />
            </div>
          </div>
        </div>

        {/* Global Add Month Modal */}
        {showAddMonthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddMonthModal(false)}>
            <div className="w-full max-w-md p-6 rounded-2xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] flex items-center justify-center">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-main">Add New Month</h3>
                </div>
                <button onClick={() => setShowAddMonthModal(false)} className="p-1 rounded-lg text-muted hover:text-main cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleAddMonthSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Month Name / Topic</label>
                  <input
                    type="text"
                    value={addMonthName}
                    onChange={(e) => setAddMonthName(e.target.value)}
                    placeholder={`e.g. Month ${(plan.months || []).length + 1} — Advanced Systems`}
                    className="w-full px-3 py-2 text-xs rounded-xl focus:outline-none inset-field"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddMonthModal(false)} className="leather-btn px-4 py-2 text-xs cursor-pointer">Cancel</button>
                  <button type="submit" className="brass-btn px-4 py-2 text-xs cursor-pointer">Create Month</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Global Add YouTube Video Modal */}
        {showAddVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddVideoModal(false)}>
            <div className="w-full max-w-lg p-6 rounded-2xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-main">Add YouTube Video Tutorial</h3>
                    <p className="text-[11px] text-muted">Attach video to any module in {plan.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddVideoModal(false)} className="p-1 rounded-lg text-muted hover:text-main cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleAddVideoSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">YouTube Video Link or ID *</label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-accent-primary pointer-events-none" />
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none inset-field"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Live Video Preview */}
                {previewVideoId && (
                  <div className="p-3 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-inset-bg)] flex items-center gap-3 animate-fade-in">
                    <img
                      src={getThumbnailUrl(previewVideoId)}
                      alt="Thumbnail Preview"
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
                  <label className="text-xs font-semibold text-muted block mb-1">Tutorial / Task Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Master JavaScript Scope & Closures"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl focus:outline-none inset-field"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Target Module / Day</label>
                  {allDays.length > 0 ? (
                    <select
                      value={videoDayId}
                      onChange={(e) => setVideoDayId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl focus:outline-none inset-field"
                    >
                      {allDays.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-muted italic">Will create and attach to Month 1 › Week 1 › Day 1</p>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddVideoModal(false)} className="leather-btn px-4 py-2 text-xs cursor-pointer">Cancel</button>
                  <button type="submit" className="brass-btn px-4 py-2 text-xs cursor-pointer">Attach Video</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
