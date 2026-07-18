/**
 * Offline test for StudyHoursChart data logic.
 * Run: node scratch/test_chart_logic.mjs
 */
import {
  startOfWeek, endOfWeek, eachDayOfInterval,
  startOfMonth, endOfMonth, eachWeekOfInterval,
  startOfYear, endOfYear, eachMonthOfInterval,
  addWeeks, subWeeks, addMonths, subMonths,
  addYears, subYears, format, isAfter, parseISO,
  isSameDay, isSameWeek, isSameMonth
} from 'date-fns';

// ── 1. formatStudyHours ──
function formatStudyHours(hoursDec) {
  const totalSec = Math.round(hoursDec * 3600);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

console.log('=== TEST formatStudyHours ===');
console.log('0      =>', formatStudyHours(0));         // expect "0m"
console.log('0.5    =>', formatStudyHours(0.5));       // expect "30m"
console.log('1.5    =>', formatStudyHours(1.5));       // expect "1h 30m"
console.log('2.75   =>', formatStudyHours(2.75));      // expect "2h 45m"
console.log('-1     =>', formatStudyHours(-1));        // negative edge
console.log('NaN    =>', formatStudyHours(NaN));       // NaN edge
console.log('undef  =>', formatStudyHours(undefined)); // undef edge

// ── 2. Data transformation — daily ──
console.log('\n=== TEST chartData — daily ===');
const mockRecords = [
  { date: '2026-07-14', hours: 1, minutes: 30 },
  { date: '2026-07-14', hours: 0, minutes: 45 },
  { date: '2026-07-15', hours: 2, minutes: 0 },
  { date: '2026-07-17', hours: 0, minutes: 20 },
];

function buildRecordsMap(records) {
  const map = {};
  records.forEach((r) => {
    const hrs = (r.hours || 0) + (r.minutes || 0) / 60;
    map[r.date] = (map[r.date] || 0) + hrs;
  });
  return map;
}

function getDailyData(currentDate, recordsMap) {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd');
    return { date: key, label: format(day, 'EEE'), studyHours: recordsMap[key] || 0 };
  });
}

const recordsMap = buildRecordsMap(mockRecords);
console.log('Records map:', recordsMap);
const dailyData = getDailyData(new Date('2026-07-15'), recordsMap);
console.log('Daily data:', JSON.stringify(dailyData, null, 2));
console.log('Days count:', dailyData.length); // expect 7

// ── 3. Data transformation — weekly ──
console.log('\n=== TEST chartData — weekly ===');
function getWeeklyData(currentDate, recordsMap) {
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
    return { date: format(wStart, 'yyyy-MM-dd'), label: `Week ${idx + 1}`, studyHours: totalHrs };
  });
}

const weeklyData = getWeeklyData(new Date('2026-07-15'), recordsMap);
console.log('Weekly data:', JSON.stringify(weeklyData, null, 2));
console.log('Weeks count:', weeklyData.length);

// ── 4. Data transformation — monthly ──
console.log('\n=== TEST chartData — monthly ===');
function getMonthlyData(currentDate, recordsMap) {
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
    return { date: format(mStart, 'yyyy-MM'), label: format(mStart, 'MMM'), studyHours: totalHrs };
  });
}

const monthlyData = getMonthlyData(new Date('2026-07-15'), recordsMap);
console.log('Monthly data:', JSON.stringify(monthlyData, null, 2));
console.log('Months count:', monthlyData.length); // expect 12

// ── 5. Metrics ──
console.log('\n=== TEST metrics ===');
function computeMetrics(chartData) {
  const total = chartData.reduce((sum, d) => sum + d.studyHours, 0);
  const count = chartData.filter((d) => d.studyHours > 0).length || 1;
  const avg = total / chartData.length;
  return {
    total: formatStudyHours(total),
    avg: formatStudyHours(avg),
    rawTotal: total
  };
}

console.log('Daily metrics:', computeMetrics(dailyData));
console.log('Weekly metrics:', computeMetrics(weeklyData));
console.log('Monthly metrics:', computeMetrics(monthlyData));

// Empty data metrics
const emptyData = getDailyData(new Date('2020-01-01'), {});
console.log('Empty metrics:', computeMetrics(emptyData));

// ── 6. handleNext future guard ──
console.log('\n=== TEST handleNext future guard ===');
const now = new Date();

// Test daily - going to far future
const farFuture = addWeeks(now, 5);
const futureWeekStart = startOfWeek(farFuture, { weekStartsOn: 1 });
console.log('Far future week start after now?', isAfter(futureWeekStart, now)); // should be true → block

// Test weekly - going to future month  
const nextMonth = addMonths(now, 1);
console.log('Next month after now?', isAfter(nextMonth, now)); // true
console.log('Same month?', isSameMonth(nextMonth, now)); // false
console.log('Should block?', isAfter(nextMonth, now) && !isSameMonth(nextMonth, now)); // true → block

// Current month should NOT be blocked
console.log('Current month - same month?', isSameMonth(now, now)); // true

// ── 7. Tooltip parseISO tests ──
console.log('\n=== TEST CustomTooltip parseISO ===');
// Daily tooltip: data.date = "2026-07-14"
try {
  const dailyParsed = parseISO('2026-07-14');
  console.log('Daily tooltip date:', format(dailyParsed, 'MMMM dd, yyyy')); // "July 14, 2026"
} catch (e) {
  console.error('ERROR in daily tooltip parseISO:', e.message);
}

// Weekly tooltip: data.date = "2026-06-29" (a Monday)
try {
  const weeklyParsed = parseISO('2026-06-29');
  console.log('Weekly tooltip date:', `Week of ${format(weeklyParsed, 'MMM d, yyyy')}`);
} catch (e) {
  console.error('ERROR in weekly tooltip parseISO:', e.message);
}

// Monthly tooltip: data.date = "2026-07" + "-01"
try {
  const monthlyParsed = parseISO('2026-07' + '-01');
  console.log('Monthly tooltip date:', format(monthlyParsed, 'MMMM yyyy')); // "July 2026"
} catch (e) {
  console.error('ERROR in monthly tooltip parseISO:', e.message);
}

// ── 8. Edge case: eachWeekOfInterval starting before month start ──
console.log('\n=== TEST eachWeekOfInterval edge case ===');
const julStart = startOfMonth(new Date('2026-07-01'));
const julEnd = endOfMonth(new Date('2026-07-01'));
const julWeeks = eachWeekOfInterval({ start: julStart, end: julEnd }, { weekStartsOn: 1 });
console.log('July 2026 week starts:');
julWeeks.forEach((ws, i) => {
  console.log(`  Week ${i + 1}: ${format(ws, 'yyyy-MM-dd EEE')} (< month start? ${ws < julStart})`);
});

// ── 9. Import validation — unused imports ──
console.log('\n=== IMPORT VALIDATION ===');
console.log('isSameDay imported but unused in component?', typeof isSameDay);   // used?
console.log('isSameWeek imported but unused in component?', typeof isSameWeek); // used?
console.log('BookOpen imported from lucide but unused?'); // check manually

console.log('\n=== ALL TESTS COMPLETE ===');
