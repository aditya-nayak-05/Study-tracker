import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, BookOpen, CalendarDays, AlertCircle } from 'lucide-react';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
  isSameDay, formatDate, getAllTasksInPlan, getDaysInPlan,
} from '../utils/helpers';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const cardStyle = { background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' };

export default function CalendarPage() {
  const { state, dispatch, showToast } = useStudy();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const gridRef = useRef(null);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (gridRef.current) {
      const cells = gridRef.current.querySelectorAll('.cal-cell');
      gsap.fromTo(cells, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.25, stagger: 0.01, ease: 'power2.out' });
    }
  }, [currentDate, view]);

  // ─── Build tasks-by-date map from ALL plans ───
  const tasksByDate = useMemo(() => {
    const map = {};
    (state.plans || []).forEach((plan) => {
      (plan.months || []).forEach((month) => {
        (month.weeks || []).forEach((week) => {
          (week.days || []).forEach((day) => {
            if (day.date) {
              const dateKey = day.date;
              if (!map[dateKey]) map[dateKey] = [];
              // Push each task with context info
              (day.tasks || []).forEach((task) => {
                map[dateKey].push({
                  ...task,
                  dayId: day.id,
                  dayName: day.name,
                  dayDate: day.date,
                  planId: plan.id,
                  planName: plan.name,
                  planColor: plan.color,
                  monthName: month.name,
                  weekName: week.name,
                });
              });
              // If no tasks but day has date, still register the day
              if ((day.tasks || []).length === 0) {
                map[dateKey].push({
                  id: day.id + '-empty',
                  title: day.name,
                  status: 'not-started',
                  dayId: day.id,
                  dayName: day.name,
                  dayDate: day.date,
                  planId: plan.id,
                  planName: plan.name,
                  planColor: plan.color,
                  monthName: month.name,
                  weekName: week.name,
                  isDayLabel: true,
                });
              }
            }
          });
        });
      });
    });
    return map;
  }, [state.plans]);

  // ─── Study hours by date ───
  const hoursByDate = useMemo(() => {
    const map = {};
    (state.globalStudyHours || []).forEach((h) => {
      if (!map[h.date]) map[h.date] = 0;
      map[h.date] += (h.hours || 0) + (h.minutes || 0) / 60;
    });
    return map;
  }, [state.globalStudyHours]);

  // ─── Calendar days grid ───
  const calendarDays = useMemo(() => {
    if (view === 'month') {
      const mStart = startOfMonth(currentDate);
      const mEnd = endOfMonth(currentDate);
      const calStart = startOfWeek(mStart, { weekStartsOn: 1 });
      const calEnd = endOfWeek(mEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calStart, end: calEnd });
    } else {
      const wStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const wEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: wStart, end: wEnd });
    }
  }, [currentDate, view]);

  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + 7 * dir);
    setCurrentDate(d);
  };

  // Helper to format Date objects as 'YYYY-MM-DD' local date strings (timezone-safe)
  const toLocalDateStr = useCallback((date) => {
    if (!date) return '';
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // ─── Selected date tasks ───
  const selectedDateKey = selectedDate ? toLocalDateStr(selectedDate) : '';
  const selectedTasks = useMemo(() => {
    if (!selectedDateKey) return [];
    return tasksByDate[selectedDateKey] || [];
  }, [selectedDateKey, tasksByDate]);

  // Group selected tasks by plan
  const selectedGrouped = useMemo(() => {
    const groups = {};
    selectedTasks.forEach((t) => {
      const key = t.planId + '|' + t.dayName;
      if (!groups[key]) {
        groups[key] = { planName: t.planName, planColor: t.planColor, dayName: t.dayName, weekName: t.weekName, monthName: t.monthName, planId: t.planId, tasks: [] };
      }
      groups[key].tasks.push(t);
    });
    return Object.values(groups);
  }, [selectedTasks]);

  // ─── Toggle task status from calendar ───
  const handleToggleTask = useCallback((task) => {
    if (task.isDayLabel) return;
    dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: task.planId, taskId: task.id } });
  }, [dispatch]);

  // ─── Stats summary ───
  const dateStats = useMemo(() => {
    const totalTasks = selectedTasks.filter((t) => !t.isDayLabel).length;
    const completedTasks = selectedTasks.filter((t) => !t.isDayLabel && t.status === 'completed').length;
    const hours = hoursByDate[selectedDateKey] || 0;
    return { totalTasks, completedTasks, hours };
  }, [selectedTasks, hoursByDate, selectedDateKey]);

  // Count of dates with tasks (for stats)
  const totalDatesWithTasks = useMemo(() => Object.keys(tasksByDate).length, [tasksByDate]);

  return (
    <DashboardLayout title="Calendar" subtitle="Your study schedule synced with your plans">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl flex items-center gap-3" style={cardStyle}>
          <CalendarDays className="w-5 h-5" style={{ color: '#818cf8' }} />
          <div>
            <p className="text-lg font-bold text-white">{totalDatesWithTasks}</p>
            <p className="text-[11px]" style={{ color: '#5a5a88' }}>Scheduled days</p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={cardStyle}>
          <BookOpen className="w-5 h-5" style={{ color: '#34d399' }} />
          <div>
            <p className="text-lg font-bold text-white">{(state.plans || []).length}</p>
            <p className="text-[11px]" style={{ color: '#5a5a88' }}>Active plans</p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={cardStyle}>
          <CheckCircle2 className="w-5 h-5" style={{ color: '#60a5fa' }} />
          <div>
            <p className="text-lg font-bold text-white">{dateStats.totalTasks}</p>
            <p className="text-[11px]" style={{ color: '#5a5a88' }}>Tasks on {selectedDate ? formatDate(selectedDate, 'MMM dd') : 'selected'}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={cardStyle}>
          <Clock className="w-5 h-5" style={{ color: '#fbbf24' }} />
          <div>
            <p className="text-lg font-bold text-white">{dateStats.hours > 0 ? `${Math.round(dateStats.hours * 10) / 10}h` : '0h'}</p>
            <p className="text-[11px]" style={{ color: '#5a5a88' }}>Hours studied</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl transition-all cursor-pointer" style={{ color: '#8888aa', background: '#161625' }}><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-semibold text-white min-w-[200px] text-center">
            {formatDate(currentDate, view === 'month' ? 'MMMM yyyy' : "'Week of' MMM dd")}
          </h2>
          <button onClick={() => navigate(1)} className="p-2.5 rounded-xl transition-all cursor-pointer" style={{ color: '#8888aa', background: '#161625' }}><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); setView('month'); }}
            className="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer" style={{ color: '#8888aa', background: '#161625' }}>Today</button>
          <button onClick={() => setView('month')}
            className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
            style={{ background: view === 'month' ? 'rgba(99,102,241,0.2)' : '#161625', color: view === 'month' ? '#818cf8' : '#8888aa' }}>Month</button>
          <button onClick={() => setView('week')}
            className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
            style={{ background: view === 'week' ? 'rgba(99,102,241,0.2)' : '#161625', color: view === 'week' ? '#818cf8' : '#8888aa' }}>Week</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="p-5 overflow-hidden" style={cardStyle}>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold py-2" style={{ color: '#5a5a88' }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div ref={gridRef} className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, i) => {
                const dateKey = toLocalDateStr(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = isSameDay(day, today);
                const tasks = tasksByDate[dateKey] || [];
                const realTasks = tasks.filter((t) => !t.isDayLabel);
                const hours = hoursByDate[dateKey] || 0;
                const completedTasks = realTasks.filter((t) => t.status === 'completed').length;
                const hasTasks = tasks.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isOverdue = realTasks.some((t) => t.status !== 'completed' && new Date(dateKey) < today && !isSameDay(day, today));
                const allDone = realTasks.length > 0 && completedTasks === realTasks.length;

                // Unique plan colors for dots
                const planColors = [...new Set(tasks.map((t) => t.planColor))];

                return (
                  <button
                    key={i}
                    className={`cal-cell relative p-2.5 rounded-xl flex flex-col items-start transition-all cursor-pointer
                      ${view === 'week' ? 'min-h-[120px]' : 'min-h-[80px] sm:min-h-[90px]'}
                      ${!isCurrentMonth && view === 'month' ? 'opacity-25' : ''}
                    `}
                    style={{
                      background: isSelected ? 'rgba(99,102,241,0.12)' : isToday ? 'rgba(99,102,241,0.06)' : 'transparent',
                      border: isSelected ? '1px solid rgba(99,102,241,0.35)' : isToday ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                    }}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className="text-xs font-medium" style={{
                      color: isToday ? '#818cf8' : isCurrentMonth ? '#d0d0e0' : '#3d3d65',
                      fontWeight: isToday ? 700 : 500,
                    }}>
                      {day.getDate()}
                    </span>

                    {hasTasks && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {planColors.slice(0, 4).map((c, j) => (
                          <div key={j} className="w-2 h-2 rounded-full shrink-0" style={{
                            background: allDone ? '#34d399' : c || '#6366f1',
                            boxShadow: `0 0 4px ${allDone ? '#34d39950' : (c || '#6366f1') + '40'}`,
                          }} />
                        ))}
                        {planColors.length > 4 && <span className="text-[8px]" style={{ color: '#5a5a88' }}>+{planColors.length - 4}</span>}
                      </div>
                    )}

                    {realTasks.length > 0 && (
                      <span className="text-[9px] mt-auto" style={{ color: allDone ? '#34d399' : '#5a5a88' }}>
                        {completedTasks}/{realTasks.length}
                      </span>
                    )}

                    {hours > 0 && (
                      <span className="text-[9px]" style={{ color: '#60a5fa' }}>{Math.round(hours * 10) / 10}h</span>
                    )}

                    {isOverdue && <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#fb7185', boxShadow: '0 0 6px #fb718560' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Selected Day Detail */}
        <div className="space-y-5">
          <div className="p-6" style={cardStyle}>
            <h3 className="text-sm font-semibold text-white mb-1">
              {selectedDate ? formatDate(selectedDate, 'EEEE') : 'Select a date'}
            </h3>
            <p className="text-xs mb-5" style={{ color: '#5a5a88' }}>
              {selectedDate ? formatDate(selectedDate, 'MMMM dd, yyyy') : ''}
            </p>

            {dateStats.totalTasks > 0 && (
              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e35' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${dateStats.totalTasks ? Math.round((dateStats.completedTasks / dateStats.totalTasks) * 100) : 0}%`,
                    background: 'linear-gradient(to right, #6366f1, #34d399)',
                  }} />
                </div>
                <span className="text-[11px] font-mono" style={{ color: '#8888aa' }}>
                  {dateStats.completedTasks}/{dateStats.totalTasks}
                </span>
              </div>
            )}

            {selectedGrouped.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-8 h-8 mx-auto mb-3" style={{ color: '#2a2a4a' }} />
                <p className="text-xs" style={{ color: '#5a5a88' }}>No tasks scheduled</p>
                <p className="text-[10px] mt-1" style={{ color: '#3d3d65' }}>Assign dates to days in your plans</p>
              </div>
            ) : (
              <div className="space-y-5 max-h-[450px] overflow-y-auto pr-1">
                {selectedGrouped.map((group, gi) => (
                  <div key={gi}>
                    {/* Plan + Day header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: group.planColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate" style={{ color: '#d0d0e0' }}>{group.dayName}</p>
                        <p className="text-[9px] truncate" style={{ color: '#5a5a88' }}>{group.planName} · {group.weekName}</p>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-1 ml-5">
                      {group.tasks.map((task) => {
                        if (task.isDayLabel) return null;
                        return (
                          <button
                            key={task.id}
                            onClick={() => handleToggleTask(task)}
                            className="w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg transition-all cursor-pointer text-left group"
                            style={{ background: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#34d399' }} />
                            ) : task.status === 'in-progress' ? (
                              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#fbbf24' }} />
                            ) : (
                              <Circle className="w-4 h-4 shrink-0" style={{ color: '#3d3d65' }} />
                            )}
                            <span className="text-xs flex-1" style={{
                              color: task.status === 'completed' ? '#5a5a88' : '#d0d0e0',
                              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            }}>{task.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dateStats.hours > 0 && (
              <div className="mt-5 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Clock className="w-4 h-4" style={{ color: '#60a5fa' }} />
                <span className="text-xs" style={{ color: '#8888aa' }}>{Math.round(dateStats.hours * 10) / 10} hours studied</span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-5" style={cardStyle}>
            <h4 className="text-xs font-semibold text-white mb-3">Plan Colors</h4>
            <div className="space-y-2">
              {(state.plans || []).filter((p) => !p.archived).map((plan) => {
                const allTasks = getAllTasksInPlan(plan);
                const datedTasks = allTasks.filter((t) => t.dayDate);
                return (
                  <div key={plan.id} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: plan.color }} />
                    <span className="text-[11px] flex-1 truncate" style={{ color: '#aaaac8' }}>{plan.name}</span>
                    <span className="text-[10px]" style={{ color: '#5a5a88' }}>{datedTasks.length}/{allTasks.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
