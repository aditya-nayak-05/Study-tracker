import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  format,
  isAfter,
  parseISO,
  isSameDay,
  isSameWeek,
  isSameMonth
} from 'date-fns';
import { useStudy } from '../context/StudyContext';
import { formatDuration } from '../utils/youtube';
import { Clock, Calendar, ChevronLeft, ChevronRight, Play, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Custom Card Components ──
export const Card = ({ children, className = '', style = {} }) => (
  <div className={`rounded-2xl p-6 ${className}`} style={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', ...style }}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', style = {} }) => (
  <div className={`mb-6 ${className}`} style={style}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', style = {} }) => (
  <div className={className} style={style}>
    {children}
  </div>
);

// ── Format helpers ──
const formatStudyHours = (hoursDec) => {
  const totalSec = Math.round(hoursDec * 3600);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// ── Main Component ──
export default function StudyHoursChart() {
  const { state, activePlan } = useStudy();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [activeRange, setActiveRange] = useState('daily'); // daily, weekly, monthly
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter study records based on the active plan if one is selected
  const allRecords = useMemo(() => {
    const list = state.globalStudyHours || [];
    if (activePlan) {
      return list.filter((r) => r.planId === activePlan.id);
    }
    return list;
  }, [state.globalStudyHours, activePlan]);

  // ── Date Navigation Handlers ──
  const handlePrev = () => {
    if (activeRange === 'daily') setCurrentDate(subWeeks(currentDate, 1));
    else if (activeRange === 'weekly') setCurrentDate(subMonths(currentDate, 1));
    else if (activeRange === 'monthly') setCurrentDate(subYears(currentDate, 1));
  };

  const handleNext = () => {
    const now = new Date();
    let nextDate;
    if (activeRange === 'daily') nextDate = addWeeks(currentDate, 1);
    else if (activeRange === 'weekly') nextDate = addMonths(currentDate, 1);
    else if (activeRange === 'monthly') nextDate = addYears(currentDate, 1);

    // Prevent navigating into future weeks/months/years
    if (isAfter(nextDate, now) && !isSameMonth(nextDate, now) && activeRange !== 'daily') return;
    if (activeRange === 'daily' && isAfter(startOfWeek(nextDate, { weekStartsOn: 1 }), now)) return;

    setCurrentDate(nextDate);
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // ── GSAP Entrance Animation ──
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [activeRange]);

  // ── Data Transformation ──
  const chartData = useMemo(() => {
    const recordsMap = {};
    allRecords.forEach((r) => {
      const hrs = (r.hours || 0) + (r.minutes || 0) / 60;
      recordsMap[r.date] = (recordsMap[r.date] || 0) + hrs;
    });

    if (activeRange === 'daily') {
      // 7 Days of the selected week (Mon - Sun)
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });

      return days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        return {
          date: key,
          label: format(day, 'EEE'), // Mon, Tue, etc.
          studyHours: recordsMap[key] || 0
        };
      });
    }

    if (activeRange === 'weekly') {
      // Group days by week of the selected month
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

      return weeks.map((wStart, idx) => {
        const wEnd = endOfWeek(wStart, { weekStartsOn: 1 });
        const days = eachDayOfInterval({
          start: wStart < start ? start : wStart,
          end: wEnd > end ? end : wEnd
        });

        let totalHrs = 0;
        days.forEach((day) => {
          const key = format(day, 'yyyy-MM-dd');
          totalHrs += recordsMap[key] || 0;
        });

        return {
          date: format(wStart, 'yyyy-MM-dd'),
          label: `Week ${idx + 1}`,
          studyHours: totalHrs
        };
      });
    }

    if (activeRange === 'monthly') {
      // 12 Months of the selected year
      const start = startOfYear(currentDate);
      const end = endOfYear(currentDate);
      const months = eachMonthOfInterval({ start, end });

      return months.map((mStart) => {
        const mEnd = endOfMonth(mStart);
        const days = eachDayOfInterval({ start: mStart, end: mEnd });

        let totalHrs = 0;
        days.forEach((day) => {
          const key = format(day, 'yyyy-MM-dd');
          totalHrs += recordsMap[key] || 0;
        });

        return {
          date: format(mStart, 'yyyy-MM'),
          label: format(mStart, 'MMM'), // Jan, Feb, etc.
          studyHours: totalHrs
        };
      });
    }

    return [];
  }, [allRecords, activeRange, currentDate]);

  // ── Metrics Computations ──
  const metrics = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + d.studyHours, 0);
    const count = chartData.filter((d) => d.studyHours > 0).length || 1;
    const avg = total / chartData.length; // Average over the whole interval
    return {
      total: formatStudyHours(total),
      avg: formatStudyHours(avg),
      rawTotal: total
    };
  }, [chartData]);

  // ── Dynamic Range Label ──
  const dateRangeLabel = useMemo(() => {
    if (activeRange === 'daily') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    if (activeRange === 'weekly') {
      return format(currentDate, 'MMMM yyyy');
    }
    return format(currentDate, 'yyyy');
  }, [activeRange, currentDate]);

  // Custom tooltips showing human readable hours (e.g. 2h 30m)
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let labelDetail = data.label;
      if (activeRange === 'daily') {
        labelDetail = format(parseISO(data.date), 'MMMM dd, yyyy');
      } else if (activeRange === 'weekly') {
        const wStart = parseISO(data.date);
        labelDetail = `Week of ${format(wStart, 'MMM d, yyyy')}`;
      } else if (activeRange === 'monthly') {
        const mStart = parseISO(data.date + '-01');
        labelDetail = format(mStart, 'MMMM yyyy');
      }

      return (
        <div className="p-3 rounded-xl border border-white/10 shadow-xl" style={{ background: '#161625', minWidth: '120px' }}>
          <p className="text-[10px] text-[#8888aa] mb-1 font-medium">{labelDetail}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: activePlan?.color || '#6366f1' }} />
            <span className="text-xs font-bold text-white">{formatStudyHours(payload[0].value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <Card>
        {/* Header */}
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: activePlan?.color || '#6366f1' }} /> Study Hours
            </h2>
            <p className="text-xs text-[#8888aa]">Your study activity over time</p>
          </div>

          {/* Daily / Weekly / Monthly Picker */}
          <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: '#0c0c18' }}>
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveRange(tab.id); handleGoToToday(); }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border border-transparent"
                style={{
                  background: activeRange === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: activeRange === tab.id ? '#ffffff' : '#8888aa'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        {/* Date Navigation & Summary Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-6">
          {/* Navigation */}
          <div className="flex items-center gap-2.5">
            <button onClick={handlePrev} className="p-2 rounded-xl border border-white/8 hover:bg-white/5 text-[#8888aa] hover:text-white cursor-pointer transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white tracking-wide min-w-[140px] text-center">
              {dateRangeLabel}
            </span>
            <button onClick={handleNext} className="p-2 rounded-xl border border-white/8 hover:bg-white/5 text-[#8888aa] hover:text-white cursor-pointer transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Metrics block */}
          <div className="flex gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8888aa] block mb-0.5">Total Study Time</span>
              <span className="text-base font-extrabold text-white">{metrics.total}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8888aa] block mb-0.5">
                {activeRange === 'daily' ? 'Daily Average' : activeRange === 'weekly' ? 'Weekly Average' : 'Monthly Average'}
              </span>
              <span className="text-base font-extrabold text-white">{metrics.avg}</span>
            </div>
          </div>
        </div>

        {/* Content area: Chart or Empty State */}
        <CardContent className="h-64 w-full">
          {metrics.rawTotal === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <Clock className="w-10 h-10 text-[#5a5a88] mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">No study data yet</h4>
              <p className="text-xs text-[#8888aa] mb-4 max-w-sm">Complete a study session or log hours manually to see your study activity here.</p>
              <button
                onClick={() => navigate('/learn')}
                className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all text-white hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(to right, #6366f1, #818cf8)' }}
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Studying
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activePlan?.color || '#6366f1'} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={activePlan?.color || '#6366f1'} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: '#5a5a88', fontSize: 10, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: '#5a5a88', fontSize: 10, fontWeight: 500 }}
                  tickFormatter={(val) => val > 0 ? `${val}h` : '0'}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="studyHours"
                  stroke={activePlan?.color || '#6366f1'}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    stroke: '#12122a',
                    strokeWidth: 2,
                    fill: activePlan?.color || '#6366f1'
                  }}
                  style={{ filter: `drop-shadow(0 0 6px ${(activePlan?.color || '#6366f1')}88)` }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
