import {
  format as fnsFormat,
  formatDistanceToNow as fnsDistanceToNow,
  addDays as fnsAddDays,
  isToday as fnsIsToday,
  parseISO as fnsParseISO,
  startOfWeek as fnsStartOfWeek,
  endOfWeek as fnsEndOfWeek,
  startOfMonth as fnsStartOfMonth,
  endOfMonth as fnsEndOfMonth,
  eachDayOfInterval as fnsEachDayOfInterval,
  isSameDay as fnsIsSameDay,
  differenceInDays as fnsDifferenceInDays,
} from 'date-fns';

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  try {
    const d = typeof date === 'string' ? fnsParseISO(date) : date;
    return fnsFormat(d, formatStr);
  } catch {
    return '';
  }
}

export function formatDistanceToNow(date) {
  try {
    const d = typeof date === 'string' ? fnsParseISO(date) : date;
    return fnsDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
}

export function calculateProgress(completed, total) {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getStatusColor(status) {
  switch (status) {
    case 'completed': return 'text-neon-green';
    case 'in-progress': return 'text-neon-amber';
    default: return 'text-dark-300';
  }
}

export function getStatusBg(status) {
  switch (status) {
    case 'completed': return 'bg-neon-green/10';
    case 'in-progress': return 'bg-neon-amber/10';
    default: return 'bg-dark-700';
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in-progress': return 'In Progress';
    default: return 'Not Started';
  }
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return 'text-neon-rose';
    case 'medium': return 'text-neon-amber';
    case 'low': return 'text-neon-blue';
    default: return 'text-dark-300';
  }
}

export function getPriorityBg(priority) {
  switch (priority) {
    case 'high': return 'bg-neon-rose/10';
    case 'medium': return 'bg-neon-amber/10';
    case 'low': return 'bg-neon-blue/10';
    default: return 'bg-dark-700';
  }
}

export const addDays = fnsAddDays;
export const isToday = fnsIsToday;
export const parseISO = fnsParseISO;
export const startOfWeek = fnsStartOfWeek;
export const endOfWeek = fnsEndOfWeek;
export const startOfMonth = fnsStartOfMonth;
export const endOfMonth = fnsEndOfMonth;
export const eachDayOfInterval = fnsEachDayOfInterval;
export const isSameDay = fnsIsSameDay;
export const differenceInDays = fnsDifferenceInDays;

export function cycleStatus(status) {
  switch (status) {
    case 'not-started': return 'in-progress';
    case 'in-progress': return 'completed';
    case 'completed': return 'not-started';
    default: return 'in-progress';
  }
}

export function getCompletedCount(tasks) {
  if (!tasks) return 0;
  return tasks.filter((t) => t.status === 'completed').length;
}

export function getDaysInPlan(plan) {
  if (!plan || !plan.months) return [];
  const days = [];
  plan.months.forEach((month) => {
    if (month.weeks) {
      month.weeks.forEach((week) => {
        if (week.days) {
          week.days.forEach((day) => days.push(day));
        }
      });
    }
  });
  return days;
}

export function getAllTasksInPlan(plan) {
  const days = getDaysInPlan(plan);
  const tasks = [];
  days.forEach((day) => {
    if (day.tasks) {
      day.tasks.forEach((task) => tasks.push({ ...task, dayId: day.id, dayDate: day.date }));
    }
  });
  return tasks;
}
