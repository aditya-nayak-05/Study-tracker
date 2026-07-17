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
  FileUp, FileDown, FolderPlus, GripVertical, Youtube, Play,
} from 'lucide-react';
import { extractVideoId, isValidYoutubeUrl, calcVideoProgress } from '../utils/youtube';

const cardStyle = { background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' };
const inputStyle = { background: '#161625', border: '1px solid rgba(255,255,255,0.12)', color: '#d0d0e0' };

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

  const handleAddMonth = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_MONTH', payload: { planId: plan.id, name: addMonthName.trim() || undefined } });
    showToast('Month added', 'success');
    setAddMonthName('');
    setShowAddMonth(false);
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
    padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
    background: active ? 'rgba(99,102,241,0.2)' : 'transparent', color: active ? '#818cf8' : '#8888aa',
  });

  return (
    <DashboardLayout>
      <div ref={containerRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/plans')} className="p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer" style={{ color: '#8888aa' }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} className="px-3 py-1.5 rounded-lg text-lg font-semibold focus:outline-none" style={{ ...inputStyle, borderColor: 'rgba(99,102,241,0.4)' }} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()} />
                <button onClick={handleRenameSave} className="cursor-pointer" style={{ color: '#34d399' }}><Check className="w-5 h-5" /></button>
                <button onClick={() => setEditingName(false)} className="cursor-pointer" style={{ color: '#5a5a88' }}><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
                <h1 className="text-xl font-bold text-white">{plan.name}</h1>
                <button onClick={() => { setEditingName(true); setPlanName(plan.name); }} className="cursor-pointer" style={{ color: '#5a5a88' }}><Edit3 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl hover:bg-white/5 cursor-pointer" style={{ color: '#8888aa' }} title="Import"><FileUp className="w-4 h-4" /></button>
            <button onClick={() => exportToPDF(plan)} className="p-2 rounded-xl hover:bg-white/5 cursor-pointer" style={{ color: '#8888aa' }} title="PDF"><FileDown className="w-4 h-4" /></button>
            <button onClick={() => exportToExcel(plan)} className="p-2 rounded-xl hover:bg-white/5 cursor-pointer" style={{ color: '#8888aa' }} title="Excel"><FileDown className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-8 mb-8 flex-wrap">
          <ProgressRing percent={stats.progress} size={56} strokeWidth={4} color={plan.color} />
          <div>
            <p className="text-xs" style={{ color: '#5a5a88' }}>Completed</p>
            <p className="text-lg font-bold text-white">{stats.completed} / {stats.total}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('tree')} style={btnStyle(view === 'tree')}>Tree</button>
            <button onClick={() => setView('list')} style={btnStyle(view === 'list')}>List</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {view === 'tree' ? (
              <div className="p-6" style={cardStyle}>
                <TreeView plan={plan} onTaskClick={(task) => {
                  dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: plan.id, taskId: task.id } });
                }} />
                {(!plan.months || plan.months.length === 0) && (
                  <EmptyState title="No Months" description="Add your first month to start building your roadmap" actionLabel="Add Month" onAction={() => setShowAddMonth(true)} icon={FolderPlus} />
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
                      <button className="w-full flex items-center gap-3 p-5 hover:bg-white/5 transition-all cursor-pointer" onClick={() => setExpandedMonth(expandedMonth === month.id ? null : month.id)}>
                        <GripVertical className="w-4 h-4" style={{ color: '#3d3d65' }} />
                        <div className="flex-1 text-left">
                          <h3 className="text-sm font-semibold text-white">{month.name}</h3>
                          <p className="text-[11px]" style={{ color: '#5a5a88' }}>{mTasks.length} tasks · {mProgress}%</p>
                        </div>
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e35' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${mProgress}%`, background: '#6366f1' }} />
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_MONTH', payload: { planId: plan.id, monthId: month.id } }); showToast('Month deleted', 'info'); }}
                          className="p-1 cursor-pointer" style={{ color: '#5a5a88' }}><Trash2 className="w-3.5 h-3.5" /></button>
                      </button>

                      {expandedMonth === month.id && (
                        <div className="px-4 pb-4 space-y-2">
                          {(month.weeks || []).map((week) => {
                            const wTasks = [];
                            (week.days || []).forEach((d) => (d.tasks || []).forEach((t) => wTasks.push(t)));
                            const wCompleted = wTasks.filter((t) => t.status === 'completed').length;

                            return (
                              <div key={week.id} className="ml-4 pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                                <button className="w-full flex items-center gap-2 py-2 hover:bg-white/5 rounded-lg px-2 transition-all cursor-pointer" onClick={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}>
                                  <GripVertical className="w-3.5 h-3.5" style={{ color: '#3d3d65' }} />
                                  <span className="text-sm flex-1 text-left" style={{ color: '#d0d0e0' }}>{week.name}</span>
                                  <span className="text-[10px]" style={{ color: '#5a5a88' }}>{wCompleted}/{wTasks.length}</span>
                                  <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_WEEK', payload: { planId: plan.id, weekId: week.id } }); }}
                                    className="p-1 cursor-pointer" style={{ color: '#3d3d65' }}><Trash2 className="w-3 h-3" /></button>
                                </button>

                                {expandedWeek === week.id && (
                                  <div className="ml-4 space-y-1 mt-1">
                                    {(week.days || []).map((day) => (
                                      <div key={day.id} className="pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                                        <button className="w-full flex items-center gap-2 py-1.5 hover:bg-white/5 rounded-lg px-2 transition-all cursor-pointer" onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}>
                                          <GripVertical className="w-3 h-3" style={{ color: '#3d3d65' }} />
                                          <span className="text-sm flex-1 text-left" style={{ color: '#d0d0e0' }}>{day.name}</span>
                                          {editingDate === day.id ? (
                                            <input type="date" defaultValue={day.date} className="rounded px-2 py-0.5 text-xs" style={{ ...inputStyle }} onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => handleDateChange(day.id, e.target.value)} onBlur={() => setEditingDate(null)} autoFocus />
                                          ) : (
                                            <button onClick={(e) => { e.stopPropagation(); setEditingDate(day.id); }} className="text-[10px] cursor-pointer" style={{ color: '#5a5a88' }}>
                                              {day.date || 'Set date'}
                                            </button>
                                          )}
                                          <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_DAY', payload: { planId: plan.id, dayId: day.id } }); }}
                                            className="p-1 cursor-pointer" style={{ color: '#3d3d65' }}><Trash2 className="w-3 h-3" /></button>
                                        </button>

                                        {expandedDay === day.id && (
                                          <div className="ml-4 space-y-1 mt-1 pb-2">
                                            {(day.tasks || []).map((task) => {
                                              const videoId = task.youtubeUrl ? extractVideoId(task.youtubeUrl) : null;
                                              const vp = videoId ? state.videoProgress[videoId] : null;
                                              const isEditing = editingTaskId === task.id;

                                              if (isEditing) {
                                                return (
                                                  <form key={task.id} onSubmit={(e) => handleEditTaskSave(e, task)} className="mt-2 space-y-2 p-3 rounded-lg border border-white/5" style={{ background: '#0c0c18' }}>
                                                    <div>
                                                      <label className="text-[10px] text-[#8888aa] block mb-1">Task Title</label>
                                                      <input type="text" value={editingTaskName} onChange={(e) => setEditingTaskName(e.target.value)} className="w-full px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} autoFocus />
                                                    </div>
                                                    <div>
                                                      <label className="text-[10px] text-[#8888aa] block mb-1">YouTube URL</label>
                                                      <input type="text" value={editingTaskUrl} onChange={(e) => setEditingTaskUrl(e.target.value)} placeholder="Paste YouTube URL here..." className="w-full px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                      <button type="submit" className="px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer" style={{ background: '#34d399', color: '#12122a' }}>Save</button>
                                                      <button type="button" onClick={() => setEditingTaskId(null)} className="px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer" style={{ background: '#1e1e35', color: '#8888aa' }}>Cancel</button>
                                                    </div>
                                                  </form>
                                                );
                                              }

                                              return (
                                                <div key={task.id} className="py-1.5 px-2 rounded-lg hover:bg-white/5 group">
                                                  <div className="flex items-center gap-2">
                                                    <button onClick={() => dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: plan.id, taskId: task.id } })}
                                                      className="w-3.5 h-3.5 rounded-full border-2 shrink-0 cursor-pointer transition-all"
                                                      style={{
                                                        borderColor: task.status === 'completed' ? '#34d399' : task.status === 'in-progress' ? '#fbbf24' : '#5a5a88',
                                                        background: task.status === 'completed' ? '#34d399' : task.status === 'in-progress' ? 'rgba(251,191,36,0.2)' : 'transparent',
                                                      }} />
                                                    <span className="text-xs flex-1 truncate" style={{ color: task.status === 'completed' ? '#5a5a88' : '#d0d0e0', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</span>
                                                    {videoId && (
                                                      <button onClick={() => navigate(`/learn/${plan.id}/${task.id}`)}
                                                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium cursor-pointer transition-all shrink-0"
                                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                                                        <Play className="w-3 h-3" /> Watch
                                                      </button>
                                                    )}
                                                    <button onClick={() => {
                                                      setEditingTaskId(task.id);
                                                      setEditingTaskName(task.title);
                                                      setEditingTaskUrl(task.youtubeUrl || '');
                                                    }} className="p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer text-[#8888aa] hover:text-white"><Edit3 className="w-3 h-3" /></button>
                                                    <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: { planId: plan.id, taskId: task.id } })}
                                                      className="p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer" style={{ color: '#fb7185' }}><Trash2 className="w-3 h-3" /></button>
                                                  </div>
                                                  {task.youtubeUrl && (
                                                    <div className="ml-6 mt-1 flex items-center gap-1 text-[9px]" style={{ color: '#5a5a88' }}>
                                                      <Youtube className="w-2.5 h-2.5 shrink-0" />
                                                      <span className="truncate">{task.youtubeUrl}</span>
                                                    </div>
                                                  )}
                                                  {vp && vp.progress > 0 && (
                                                    <div className="ml-6 mt-1 flex items-center gap-2">
                                                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#1e1e35' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, vp.progress)}%`, background: vp.progress >= 95 ? '#34d399' : '#6366f1' }} />
                                                      </div>
                                                      <span className="text-[9px]" style={{ color: '#5a5a88' }}>{Math.round(vp.progress)}% watched</span>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}

                                            {addTaskDay === day.id ? (
                                              <form onSubmit={(e) => handleAddTask(e, day.id)} className="mt-1 p-3 rounded-lg space-y-2 border border-white/5" style={{ background: '#161625' }}>
                                                <div>
                                                  <label className="text-[10px] text-[#8888aa] block mb-1">Task Title</label>
                                                  <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Learn Python Loops" autoFocus
                                                    className="w-full px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                                                </div>
                                                <div>
                                                  <label className="text-[10px] text-[#8888aa] block mb-1">YouTube URL (Optional)</label>
                                                  <input type="text" value={newYoutubeUrl} onChange={(e) => setNewYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
                                                    className="w-full px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                  <button type="submit" className="px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer" style={{ background: '#34d399', color: '#12122a' }}>Add Task</button>
                                                  <button type="button" onClick={() => { setAddTaskDay(null); setNewItemName(''); setNewYoutubeUrl(''); }} className="px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer" style={{ background: '#1e1e35', color: '#8888aa' }}>Cancel</button>
                                                </div>
                                              </form>
                                            ) : (
                                              <button onClick={() => { setAddTaskDay(day.id); setNewItemName(''); setNewYoutubeUrl(''); }} className="flex items-center gap-1 text-[11px] cursor-pointer ml-6" style={{ color: '#5a5a88' }}>
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
                                        <button type="submit" className="cursor-pointer" style={{ color: '#34d399' }}><Check className="w-4 h-4" /></button>
                                        <button type="button" onClick={() => { setAddDayWeek(null); setNewItemName(''); }} className="cursor-pointer" style={{ color: '#5a5a88' }}><X className="w-4 h-4" /></button>
                                      </form>
                                    ) : (
                                      <button onClick={() => { setAddDayWeek(week.id); setNewItemName(''); }} className="flex items-center gap-1 text-[11px] cursor-pointer mt-1 ml-4" style={{ color: '#5a5a88' }}>
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
                              <button type="submit" className="cursor-pointer" style={{ color: '#34d399' }}><Check className="w-4 h-4" /></button>
                              <button type="button" onClick={() => { setAddWeekMonth(null); setNewItemName(''); }} className="cursor-pointer" style={{ color: '#5a5a88' }}><X className="w-4 h-4" /></button>
                            </form>
                          ) : (
                            <button onClick={() => { setAddWeekMonth(month.id); setNewItemName(''); }} className="flex items-center gap-1 text-xs cursor-pointer mt-2 ml-4" style={{ color: '#5a5a88' }}>
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
                    <button type="submit" className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>Add</button>
                    <button type="button" onClick={() => setShowAddMonth(false)} className="px-3 py-2 rounded-xl cursor-pointer" style={{ color: '#5a5a88' }}><X className="w-4 h-4" /></button>
                  </form>
                ) : (
                  <button onClick={() => setShowAddMonth(true)} className="w-full py-3 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer" style={{ borderRadius: '1rem', border: '2px dashed #2a2a4a', color: '#5a5a88' }}>
                    <FolderPlus className="w-4 h-4" /> Add Month
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="p-6" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Plan Info</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span style={{ color: '#5a5a88' }}>Created</span><span style={{ color: '#aaaac8' }}>{formatDate(plan.createdAt)}</span></div>
                <div className="flex justify-between"><span style={{ color: '#5a5a88' }}>Months</span><span style={{ color: '#aaaac8' }}>{plan.months?.length || 0}</span></div>
                <div className="flex justify-between"><span style={{ color: '#5a5a88' }}>Tasks</span><span style={{ color: '#aaaac8' }}>{stats.total}</span></div>
                <div className="flex justify-between"><span style={{ color: '#5a5a88' }}>Completed</span><span style={{ color: '#34d399' }}>{stats.completed}</span></div>
              </div>
            </div>

            <div className="p-6" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Activity</h3>
              <ActivityTimeline activities={[...(plan.activities || [])].reverse()} maxItems={8} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
