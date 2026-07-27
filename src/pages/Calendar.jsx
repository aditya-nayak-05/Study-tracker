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
const cardStyle = { background: '#e6ebf2', border: '1px solid rgba(255,255,255,0.7)', borderRadius: '1rem', boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.6), -6px -6px 14px rgba(255, 255, 255, 0.85)', color: '#1a202c' };

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
          <CalendarDays className="w-5 h-5" style={{ color: '#ed8936' }} />
          <div>
            <p className="text-lg font-bold text-[#1a202c]">{totalDatesWithTasks}</p>
            <p className="text-[11px]" style={{ color: '#718096' }}>Scheduled days</p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={cardStyle}>
          <BookOpen className="w-5 h-5" style={{ color: '#ed8936' }} />
          <div>
            <p className="text-lg font-bold text-[#1a202c]">{(state.plans || []).length}</p>
            <p className="text-[11px]" style={{ color: '#718096' }}>Active plans</p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={cardStyle}>
          <CheckCircle2 className="w-5 h-5" style={{ color: '#38a169' }} />
          <div>
            <p className="text-lg font-bold text-[#1a202c]">{dateStats.totalTasks}</p>
            <p className="text-[11px]" style={{ color: '#718096' }}>Tasks on {selectedDate ? formatDate(selectedDate, 'MMM dd') : 'selected'}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={cardStyle}>
          <Clock className="w-5 h-5" style={{ color: '#ed8936' }} />
          <div>
            <p className="text-lg font-bold text-[#1a202c]">{dateStats.hours > 0 ? `${Math.round(dateStats.hours * 10) / 10}h` : '0h'}</p>
            <p className="text-[11px]" style={{ color: '#718096' }}>Hours studied</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl transition-all cursor-pointer" style={{ color: '#2d3748', background: '#e6ebf2', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.6), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-semibold text-[#1a202c] min-w-[200px] text-center">
            {formatDate(currentDate, view === 'month' ? 'MMMM yyyy' : "'Week of' MMM dd")}
          </h2>
          <button onClick={() => navigate(1)} className="p-2.5 rounded-xl transition-all cursor-pointer" style={{ color: '#2d3748', background: '#e6ebf2', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.6), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); setView('month'); }}
            className="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer font-medium" style={{ color: '#2d3748', background: '#e6ebf2', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.6), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>Today</button>
          <button onClick={() => setView('month')}
            className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
            style={{ background: '#e6ebf2', boxShadow: view === 'month' ? 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.9)' : '3px 3px 6px rgba(163, 177, 198, 0.6), -3px -3px 6px rgba(255, 255, 255, 0.8)', color: view === 'month' ? '#ed8936' : '#718096', border: '1px solid rgba(255,255,255,0.7)' }}>Month</button>
          <button onClick={() => setView('week')}
            className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
            style={{ background: '#e6ebf2', boxShadow: view === 'week' ? 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.9)' : '3px 3px 6px rgba(163, 177, 198, 0.6), -3px -3px 6px rgba(255, 255, 255, 0.8)', color: view === 'week' ? '#ed8936' : '#718096', border: '1px solid rgba(255,255,255,0.7)' }}>Week</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="p-5 overflow-hidden" style={cardStyle}>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold py-2" style={{ color: '#718096' }}>{d}</div>
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
                      ${!isCurrentMonth && view === 'month' ? 'opacity-35' : ''}
                    `}
                    style={{
                      background: '#e6ebf2',
                      boxShadow: isSelected
                        ? 'inset 3px 3px 6px rgba(163, 177, 198, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.9)'
                        : isToday
                        ? 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.7)'
                        : '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.8)',
                      border: isSelected ? '1px solid #ed8936' : isToday ? '1px solid #ed8936' : '1px solid rgba(255,255,255,0.6)',
                    }}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className="text-xs font-medium" style={{
                      color: isToday ? '#ed8936' : isCurrentMonth ? '#1a202c' : '#a0aec0',
                      fontWeight: isToday ? 700 : 500,
                    }}>
                      {day.getDate()}
                    </span>

                    {hasTasks && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {planColors.slice(0, 4).map((c, j) => (
                          <div key={j} className="w-2 h-2 rounded-full shrink-0" style={{
                            background: allDone ? '#38a169' : c || '#ed8936',
                            boxShadow: `0 0 4px ${allDone ? 'rgba(56, 161, 105, 0.4)' : (c || '#ed8936') + '40'}`,
                          }} />
                        ))}
                        {planColors.length > 4 && <span className="text-[8px]" style={{ color: '#718096' }}>+{planColors.length - 4}</span>}
                      </div>
                    )}

                    {realTasks.length > 0 && (
                      <span className="text-[9px] mt-auto font-medium" style={{ color: allDone ? '#38a169' : '#718096' }}>
                        {completedTasks}/{realTasks.length}
                      </span>
                    )}

                    {hours > 0 && (
                      <span className="text-[9px] font-semibold" style={{ color: '#ed8936' }}>{Math.round(hours * 10) / 10}h</span>
                    )}

                    {isOverdue && <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#ed8936', boxShadow: '0 0 6px rgba(237,137,54,0.6)' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Selected Day Detail */}
        <div className="space-y-5">
          <div className="p-6" style={cardStyle}>
            <h3 className="text-sm font-semibold text-[#1a202c] mb-1">
              {selectedDate ? formatDate(selectedDate, 'EEEE') : 'Select a date'}
            </h3>
            <p className="text-xs mb-5" style={{ color: '#718096' }}>
              {selectedDate ? formatDate(selectedDate, 'MMMM dd, yyyy') : ''}
            </p>

            {dateStats.totalTasks > 0 && (
              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(163, 177, 198, 0.3)' }}>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#e6ebf2', boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.9)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${dateStats.totalTasks ? Math.round((dateStats.completedTasks / dateStats.totalTasks) * 100) : 0}%`,
                    background: 'linear-gradient(to right, #ed8936, #38a169)',
                  }} />
                </div>
                <span className="text-[11px] font-mono font-semibold" style={{ color: '#718096' }}>
                  {dateStats.completedTasks}/{dateStats.totalTasks}
                </span>
              </div>
            )}

            {selectedGrouped.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-8 h-8 mx-auto mb-3" style={{ color: '#718096' }} />
                <p className="text-xs" style={{ color: '#718096' }}>No tasks scheduled</p>
                <p className="text-[10px] mt-1" style={{ color: '#718096' }}>Assign dates to days in your plans</p>
              </div>
            ) : (
              <div className="space-y-5 max-h-[450px] overflow-y-auto pr-1">
                {selectedGrouped.map((group, gi) => (
                  <div key={gi}>
                    {/* Plan + Day header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: group.planColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate" style={{ color: '#1a202c' }}>{group.dayName}</p>
                        <p className="text-[9px] truncate" style={{ color: '#718096' }}>{group.planName} · {group.weekName}</p>
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
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(237,137,54,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#38a169' }} />
                            ) : task.status === 'in-progress' ? (
                              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#ed8936' }} />
                            ) : (
                              <Circle className="w-4 h-4 shrink-0" style={{ color: '#a0aec0' }} />
                            )}
                            <span className="text-xs flex-1" style={{
                              color: task.status === 'completed' ? '#718096' : '#1a202c',
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
              <div className="mt-5 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid rgba(163, 177, 198, 0.3)' }}>
                <Clock className="w-4 h-4" style={{ color: '#ed8936' }} />
                <span className="text-xs font-medium" style={{ color: '#718096' }}>{Math.round(dateStats.hours * 10) / 10} hours studied</span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-5" style={cardStyle}>
            <h4 className="text-xs font-semibold text-[#1a202c] mb-3">Plan Colors</h4>
            <div className="space-y-2">
              {(state.plans || []).filter((p) => !p.archived).map((plan) => {
                const allTasks = getAllTasksInPlan(plan);
                const datedTasks = allTasks.filter((t) => t.dayDate);
                return (
                  <div key={plan.id} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: plan.color }} />
                    <span className="text-[11px] flex-1 truncate font-medium" style={{ color: '#1a202c' }}>{plan.name}</span>
                    <span className="text-[10px]" style={{ color: '#718096' }}>{datedTasks.length}/{allTasks.length}</span>
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

