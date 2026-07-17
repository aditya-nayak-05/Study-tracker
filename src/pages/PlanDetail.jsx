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
  FileUp, FileDown, FolderPlus, GripVertical,
} from 'lucide-react';

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
    dispatch({ type: 'ADD_TASK', payload: { planId: plan.id, dayId, title: newItemName.trim() } });
    showToast('Task added', 'success');
    setNewItemName('');
    setAddTaskDay(null);
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
                                            {(day.tasks || []).map((task) => (
                                              <div key={task.id} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-white/5 group">
                                                <button onClick={() => dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: plan.id, taskId: task.id } })}
                                                  className="w-3.5 h-3.5 rounded-full border-2 shrink-0 cursor-pointer transition-all"
                                                  style={{
                                                    borderColor: task.status === 'completed' ? '#34d399' : task.status === 'in-progress' ? '#fbbf24' : '#5a5a88',
                                                    background: task.status === 'completed' ? '#34d399' : task.status === 'in-progress' ? 'rgba(251,191,36,0.2)' : 'transparent',
                                                  }} />
                                                <span className="text-xs flex-1" style={{ color: task.status === 'completed' ? '#5a5a88' : '#d0d0e0', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</span>
                                                <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: { planId: plan.id, taskId: task.id } })}
                                                  className="p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer" style={{ color: '#fb7185' }}><Trash2 className="w-3 h-3" /></button>
                                              </div>
                                            ))}
                                            {addTaskDay === day.id ? (
                                              <form onSubmit={(e) => handleAddTask(e, day.id)} className="flex gap-1 mt-1">
                                                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Task name" autoFocus
                                                  className="flex-1 px-2 py-1 text-xs rounded focus:outline-none" style={{ ...inputStyle }} />
                                                <button type="submit" className="cursor-pointer" style={{ color: '#34d399' }}><Check className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => { setAddTaskDay(null); setNewItemName(''); }} className="cursor-pointer" style={{ color: '#5a5a88' }}><X className="w-4 h-4" /></button>
                                              </form>
                                            ) : (
                                              <button onClick={() => { setAddTaskDay(day.id); setNewItemName(''); }} className="flex items-center gap-1 text-[11px] cursor-pointer ml-6" style={{ color: '#5a5a88' }}>
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
