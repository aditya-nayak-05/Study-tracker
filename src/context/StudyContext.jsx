import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import * as storage from '../utils/storage';
import { generateId } from '../utils/helpers';
import { getStoredSpeedLevel, setStoredSpeedLevel, getStoredStyle, setStoredStyle, applyMotionScaleToDOM } from '../utils/motion';

const StudyContext = createContext(null);

const DEFAULT_PROFILE = {
  name: '',
  username: '',
  email: '',
  bio: '',
  avatar: '',
  dailyGoal: 6,
  learningGoal: '',
  createdAt: '',
};

import { SIX_HUNDRED_QUOTES, getDailyQuote, getRandomQuote } from '../data/motivationQuotes';

export const DEFAULT_MOTIVATION_QUOTES = SIX_HUNDRED_QUOTES;

const DEFAULT_SETTINGS = {
  animationsEnabled: true,
  animationSpeed: 3, // 0: Off, 1: Very Fast, 2: Fast, 3: Normal, 4: Relaxed, 5: Slow, 6: Very Slow
  animationStyle: 'smooth', // 'smooth', 'elegant', 'minimal', 'dynamic', 'slide', 'depth', 'cinematic', 'fade'
  timerDuration: 25,
  dailyGoal: 6,
  dailyStudyHours: 6,
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
  sidebarCollapsed: false,
  fontFamily: "'Inter', sans-serif",
  dailyQuoteChangeEnabled: true,
  lastDailyQuoteDate: '',
  userCustomQuotes: [],
  motivationalQuotes: DEFAULT_MOTIVATION_QUOTES,
  activeQuoteId: SIX_HUNDRED_QUOTES[0].id,
  activeQuoteText: SIX_HUNDRED_QUOTES[0].text,
  activeQuoteAuthor: SIX_HUNDRED_QUOTES[0].author,
  activeQuoteCategory: SIX_HUNDRED_QUOTES[0].category,
  showUserQuoteBanner: true,
  showCuratedQuoteBanner: true,
};

const DEFAULT_UI = {
  currentPage: 'dashboard',
  activePlanId: null,
  lastOpenedMonth: null,
  lastOpenedWeek: null,
  lastOpenedDay: null,
  scrollPositions: {},
  searchOpen: false,
  sidebarOpen: true,
};

import { dsRoadmap } from '../data/dsRoadmap';
import { aiFullStackRoadmap } from '../data/aiFullStackRoadmap';
import { aiWebDevRoadmap } from '../data/aiWebDevRoadmap';

function createDefaultState() {
  const loadedPlans = storage.getItem('plans', []);
  const hasDsRoadmap = loadedPlans.some((p) => p.id === 'ds-roadmap-plan-id');
  const hasAiRoadmap = loadedPlans.some((p) => p.id === 'ai-fullstack-roadmap-plan-id');
  const hasAiWebDevRoadmap = loadedPlans.some((p) => p.id === 'ai-web-dev-main-id' || p.name === 'ai web dev (main)');

  let plans = [...loadedPlans];
  if (!hasDsRoadmap) {
    plans.push(dsRoadmap);
  }
  if (!hasAiRoadmap) {
    plans.push(aiFullStackRoadmap);
  }
  if (!hasAiWebDevRoadmap) {
    plans.push(aiWebDevRoadmap);
  }

  const loadedUi = storage.getItem('ui', DEFAULT_UI);
  let ui = (!hasAiWebDevRoadmap || !loadedUi.activePlanId) ? { ...loadedUi, activePlanId: 'ai-web-dev-main-id' } : loadedUi;

  // Ensure activePlanId is not an archived plan
  const isActiveArchived = plans.some((p) => p.id === ui.activePlanId && p.archived);
  if (isActiveArchived) {
    const firstUnarchived = plans.find((p) => !p.archived);
    ui = { ...ui, activePlanId: firstUnarchived ? firstUnarchived.id : null };
  }

  const rawSettings = storage.getItem('settings', DEFAULT_SETTINGS);
  const storedSpeed = getStoredSpeedLevel();
  const storedStyle = getStoredStyle();
  const speed = rawSettings?.animationSpeed !== undefined ? rawSettings.animationSpeed : storedSpeed;
  const style = rawSettings?.animationStyle !== undefined ? rawSettings.animationStyle : storedStyle;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyQuoteChangeEnabled = rawSettings?.dailyQuoteChangeEnabled !== undefined
    ? rawSettings.dailyQuoteChangeEnabled
    : true;
  const userCustomQuotes = Array.isArray(rawSettings?.userCustomQuotes)
    ? rawSettings.userCustomQuotes
    : [];
  let lastDailyQuoteDate = rawSettings?.lastDailyQuoteDate || '';

  let activeQuoteId = rawSettings?.activeQuoteId;
  let activeQuoteText = rawSettings?.activeQuoteText;
  let activeQuoteAuthor = rawSettings?.activeQuoteAuthor;
  let activeQuoteCategory = rawSettings?.activeQuoteCategory;

  // When daily change is enabled and it is a new day, update active quote automatically
  if (dailyQuoteChangeEnabled && lastDailyQuoteDate !== todayStr) {
    const todayDaily = getDailyQuote(SIX_HUNDRED_QUOTES);
    if (todayDaily) {
      activeQuoteId = todayDaily.id;
      activeQuoteText = todayDaily.text;
      activeQuoteAuthor = todayDaily.category;
      activeQuoteCategory = todayDaily.category;
      lastDailyQuoteDate = todayStr;
    }
  } else if (!activeQuoteText) {
    activeQuoteId = SIX_HUNDRED_QUOTES[0].id;
    activeQuoteText = SIX_HUNDRED_QUOTES[0].text;
    activeQuoteAuthor = SIX_HUNDRED_QUOTES[0].author;
    activeQuoteCategory = SIX_HUNDRED_QUOTES[0].category;
  }

  const loadedSettings = {
    ...DEFAULT_SETTINGS,
    ...rawSettings,
    dailyQuoteChangeEnabled,
    lastDailyQuoteDate,
    userCustomQuotes,
    motivationalQuotes: SIX_HUNDRED_QUOTES,
    activeQuoteId,
    activeQuoteText,
    activeQuoteAuthor,
    activeQuoteCategory,
    animationSpeed: speed,
    animationStyle: style,
  };
  const defaultDuration = (loadedSettings.timerDuration || loadedSettings.pomodoroWork || 25) * 60;
  const loadedTimer = storage.getItem('mainTimer', null);

  let initialTimer = {
    secondsLeft: defaultDuration,
    running: false,
    targetEndTime: null,
    totalSeconds: defaultDuration,
    sessionCount: 0,
  };

  if (loadedTimer) {
    if (loadedTimer.running && loadedTimer.targetEndTime) {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((loadedTimer.targetEndTime - now) / 1000));
      if (remaining > 0) {
        initialTimer = { ...loadedTimer, secondsLeft: remaining };
      } else {
        // Lap(s) completed while app was closed / reloaded
        const overSecs = Math.floor((now - loadedTimer.targetEndTime) / 1000);
        const extraLaps = 1 + Math.floor(overSecs / defaultDuration);
        const currentLapRemaining = defaultDuration - (overSecs % defaultDuration);
        initialTimer = {
          secondsLeft: currentLapRemaining,
          running: true,
          targetEndTime: now + currentLapRemaining * 1000,
          totalSeconds: defaultDuration,
          sessionCount: (loadedTimer.sessionCount || 0) + extraLaps,
        };
      }
    } else {
      initialTimer = {
        ...loadedTimer,
        running: false,
        targetEndTime: null,
        secondsLeft: loadedTimer.secondsLeft ?? defaultDuration,
        totalSeconds: loadedTimer.totalSeconds ?? defaultDuration,
      };
    }
  }

  return {
    profile: storage.getItem('profile', null),
    settings: loadedSettings,
    plans,
    ui,
    mainTimer: initialTimer,
    globalStudyHours: storage.getItem('globalStudyHours', []),
    videoStudyHours: storage.getItem('videoStudyHours', []),
    globalActivities: storage.getItem('globalActivities', []),
    videoProgress: storage.getItem('videoProgress', {}),
    studySessions: storage.getItem('studySessions', []),
    activeSessionId: storage.getItem('activeSessionId', null),
    toasts: [],
  };
}

function reducer(state, action) {
  switch (action.type) {
    // ── Profile ──
    case 'SET_PROFILE':
      return { ...state, profile: { ...action.payload, createdAt: action.payload.createdAt || new Date().toISOString() } };

    case 'UPDATE_PROFILE': {
      const newProfile = { ...state.profile, ...action.payload };
      let newSettings = state.settings;
      if (action.payload.dailyGoal !== undefined) {
        newSettings = { ...state.settings, dailyGoal: action.payload.dailyGoal, dailyStudyHours: action.payload.dailyGoal };
      }
      return { ...state, profile: newProfile, settings: newSettings };
    }

    // ── Settings ──
    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.payload };
      let newTimer = state.mainTimer;
      if (action.payload.timerDuration || action.payload.pomodoroWork) {
        const newDur = (action.payload.timerDuration || action.payload.pomodoroWork) * 60;
        if (!state.mainTimer.running && state.mainTimer.secondsLeft === state.mainTimer.totalSeconds) {
          newTimer = { ...state.mainTimer, secondsLeft: newDur, totalSeconds: newDur };
        }
      }
      let newProfile = state.profile;
      const targetDailyHours = action.payload.dailyStudyHours ?? action.payload.dailyGoal;
      if (targetDailyHours !== undefined && newProfile) {
        newProfile = { ...newProfile, dailyGoal: targetDailyHours };
      }
      return { ...state, settings: newSettings, profile: newProfile, mainTimer: newTimer };
    }

    // ── Main Timer ──
    case 'START_MAIN_TIMER': {
      const defaultDuration = (state.settings.timerDuration || state.settings.pomodoroWork || 25) * 60;
      const currentSecs = state.mainTimer.secondsLeft > 0 ? state.mainTimer.secondsLeft : defaultDuration;
      const targetEndTime = Date.now() + currentSecs * 1000;
      return {
        ...state,
        mainTimer: {
          ...state.mainTimer,
          secondsLeft: currentSecs,
          running: true,
          targetEndTime,
        },
      };
    }

    case 'PAUSE_MAIN_TIMER': {
      let secondsLeft = state.mainTimer.secondsLeft;
      if (state.mainTimer.targetEndTime) {
        secondsLeft = Math.max(0, Math.ceil((state.mainTimer.targetEndTime - Date.now()) / 1000));
      }
      return {
        ...state,
        mainTimer: {
          ...state.mainTimer,
          secondsLeft,
          running: false,
          targetEndTime: null,
        },
      };
    }

    case 'RESET_MAIN_TIMER': {
      const defaultDuration = (state.settings.timerDuration || state.settings.pomodoroWork || 25) * 60;
      return {
        ...state,
        mainTimer: {
          ...state.mainTimer,
          secondsLeft: defaultDuration,
          running: false,
          targetEndTime: null,
          totalSeconds: defaultDuration,
        },
      };
    }

    case 'FINISH_MAIN_TIMER_EARLY': {
      const defaultDuration = (state.settings.timerDuration || state.settings.pomodoroWork || 25) * 60;
      const totalSeconds = state.mainTimer.totalSeconds || defaultDuration;
      let currentSecs = state.mainTimer.secondsLeft;
      if (state.mainTimer.running && state.mainTimer.targetEndTime) {
        currentSecs = Math.max(0, Math.ceil((state.mainTimer.targetEndTime - Date.now()) / 1000));
      }
      const elapsedSecs = totalSeconds - currentSecs;
      const elapsedMins = Math.round(elapsedSecs / 60);

      let newGlobalHours = state.globalStudyHours;
      let newPlans = state.plans;
      let newActivities = state.globalActivities;
      let toasts = state.toasts;

      if (elapsedMins > 0) {
        const entry = {
          id: generateId(),
          date: new Date().toISOString().split('T')[0],
          hours: 0,
          minutes: elapsedMins,
          notes: 'Timer session',
          planId: state.ui.activePlanId,
          timestamp: new Date().toISOString(),
        };
        newGlobalHours = [...state.globalStudyHours, entry];
        if (state.ui.activePlanId) {
          newPlans = state.plans.map((p) => {
            if (p.id !== state.ui.activePlanId) return p;
            return {
              ...p,
              studyHours: [...(p.studyHours || []), entry],
              activities: [...(p.activities || []), { id: generateId(), type: 'study', message: `Logged ${elapsedMins}m Timer session`, timestamp: new Date().toISOString() }],
              updatedAt: new Date().toISOString(),
            };
          });
        }
        newActivities = [
          { id: generateId(), type: 'study', message: `Logged ${elapsedMins}m Timer session`, timestamp: new Date().toISOString() },
          ...state.globalActivities,
        ].slice(0, 200);
        toasts = [...state.toasts, { id: generateId(), message: `Logged ${elapsedMins}m study session! 🎉`, toastType: 'success' }];
      }

      return {
        ...state,
        globalStudyHours: newGlobalHours,
        plans: newPlans,
        globalActivities: newActivities,
        toasts,
        mainTimer: {
          ...state.mainTimer,
          secondsLeft: defaultDuration,
          running: false,
          targetEndTime: null,
          totalSeconds: defaultDuration,
          sessionCount: elapsedMins > 0 ? (state.mainTimer.sessionCount || 0) + 1 : (state.mainTimer.sessionCount || 0),
        },
      };
    }

    case 'TICK_MAIN_TIMER': {
      if (!state.mainTimer.running || !state.mainTimer.targetEndTime) return state;

      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((state.mainTimer.targetEndTime - now) / 1000));

      if (remaining <= 0) {
        const defaultDuration = (state.settings.timerDuration || state.settings.pomodoroWork || 25) * 60;
        const durationMins = Math.round((state.mainTimer.totalSeconds || defaultDuration) / 60);
        const entry = {
          id: generateId(),
          date: new Date().toISOString().split('T')[0],
          hours: 0,
          minutes: durationMins,
          notes: 'Timer session',
          planId: state.ui.activePlanId,
          timestamp: new Date().toISOString(),
        };

        const newGlobalHours = [...state.globalStudyHours, entry];
        let newPlans = state.plans;
        if (state.ui.activePlanId) {
          newPlans = state.plans.map((p) => {
            if (p.id !== state.ui.activePlanId) return p;
            return {
              ...p,
              studyHours: [...(p.studyHours || []), entry],
              activities: [...(p.activities || []), { id: generateId(), type: 'study', message: `Completed ${durationMins}m Timer session`, timestamp: new Date().toISOString() }],
              updatedAt: new Date().toISOString(),
            };
          });
        }

        const newActivities = [
          { id: generateId(), type: 'study', message: `Completed ${durationMins}m Timer session`, timestamp: new Date().toISOString() },
          ...state.globalActivities,
        ].slice(0, 200);

        return {
          ...state,
          globalStudyHours: newGlobalHours,
          plans: newPlans,
          globalActivities: newActivities,
          mainTimer: {
            secondsLeft: defaultDuration,
            running: true,
            targetEndTime: Date.now() + defaultDuration * 1000,
            totalSeconds: defaultDuration,
            sessionCount: (state.mainTimer.sessionCount || 0) + 1,
          },
          toasts: [...state.toasts, { id: generateId(), message: 'Lap complete! Auto-starting next timer lap 🔄 🎉', toastType: 'success' }],
        };
      }

      return {
        ...state,
        mainTimer: {
          ...state.mainTimer,
          secondsLeft: remaining,
        },
      };
    }

    // ── UI ──
    case 'SET_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } };

    // ── Plans ──
    case 'ADD_PLAN': {
      const newPlan = {
        id: generateId(),
        name: action.payload.name || 'Untitled Plan',
        description: action.payload.description || '',
        category: action.payload.category || 'general',
        color: action.payload.color || '#6366f1',
        icon: action.payload.icon || 'BookOpen',
        startDate: action.payload.startDate || new Date().toISOString(),
        targetEndDate: action.payload.targetEndDate || '',
        pinned: false,
        archived: false,
        months: [],
        studyHours: [],
        activities: [{ id: generateId(), type: 'create', message: `Plan "${action.payload.name}" created`, timestamp: new Date().toISOString() }],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { ...state, plans: [...state.plans, newPlan] };
    }

    case 'IMPORT_PLAN':
      return { ...state, plans: [...state.plans, action.payload] };

    case 'UPDATE_PLAN': {
      const isArchivingActive = action.payload.updates?.archived === true && state.ui.activePlanId === action.payload.id;
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.id) return p;
        const updates = { ...action.payload.updates };
        if (updates.archived === true) {
          updates.pinned = false;
        }
        return { ...p, ...updates, updatedAt: new Date().toISOString() };
      });

      let newActivePlanId = state.ui.activePlanId;
      if (isArchivingActive) {
        const nextActive = plans.find((p) => !p.archived && p.id !== action.payload.id);
        newActivePlanId = nextActive ? nextActive.id : null;
      }

      return {
        ...state,
        plans,
        ui: isArchivingActive ? { ...state.ui, activePlanId: newActivePlanId } : state.ui,
      };
    }

    case 'DELETE_PLAN':
      return {
        ...state,
        plans: state.plans.filter((p) => p.id !== action.payload),
        ui: state.ui.activePlanId === action.payload ? { ...state.ui, activePlanId: null } : state.ui,
      };

    case 'DUPLICATE_PLAN': {
      const source = state.plans.find((p) => p.id === action.payload);
      if (!source) return state;
      const deepCopy = JSON.parse(JSON.stringify(source));
      const reassignIds = (obj) => {
        if (obj && typeof obj === 'object') {
          if (obj.id) obj.id = generateId();
          Object.values(obj).forEach((v) => {
            if (Array.isArray(v)) v.forEach(reassignIds);
            else reassignIds(v);
          });
        }
      };
      reassignIds(deepCopy);
      deepCopy.id = generateId();
      deepCopy.name = source.name + ' (Copy)';
      deepCopy.pinned = false;
      deepCopy.createdAt = new Date().toISOString();
      deepCopy.updatedAt = new Date().toISOString();
      deepCopy.activities = [{ id: generateId(), type: 'duplicate', message: `Duplicated from "${source.name}"`, timestamp: new Date().toISOString() }];
      return { ...state, plans: [...state.plans, deepCopy] };
    }

    case 'REORDER_PLANS':
      return { ...state, plans: action.payload };

    case 'ADD_MONTH': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        const currentMonths = p.months || [];
        const newMonth = {
          id: generateId(),
          name: action.payload.name || `Month ${currentMonths.length + 1}`,
          weeks: (action.payload.weeks && action.payload.weeks.length > 0) ? action.payload.weeks : [
            {
              id: generateId(),
              name: 'Week 1',
              days: [
                { id: generateId(), name: 'Day 1', date: '', tasks: [] }
              ]
            }
          ]
        };
        return {
          ...p,
          months: [...currentMonths, newMonth],
          activities: [...(p.activities || []), { id: generateId(), type: 'add', message: `Added ${newMonth.name}`, timestamp: new Date().toISOString() }],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'UPDATE_MONTH': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => (m.id === action.payload.monthId ? { ...m, ...action.payload.updates } : m)),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'DELETE_MONTH': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return { ...p, months: p.months.filter((m) => m.id !== action.payload.monthId), updatedAt: new Date().toISOString() };
      });
      return { ...state, plans };
    }

    case 'REORDER_MONTHS': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return { ...p, months: action.payload.months, updatedAt: new Date().toISOString() };
      });
      return { ...state, plans };
    }

    // ── Weeks ──
    case 'ADD_WEEK': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => {
            if (m.id !== action.payload.monthId) return m;
            const newWeek = { id: generateId(), name: action.payload.name || `Week ${m.weeks.length + 1}`, days: [] };
            return { ...m, weeks: [...m.weeks, newWeek] };
          }),
          activities: [...p.activities, { id: generateId(), type: 'add', message: `Added ${action.payload.name || 'Week'}`, timestamp: new Date().toISOString() }],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'UPDATE_WEEK': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => (w.id === action.payload.weekId ? { ...w, ...action.payload.updates } : w)),
          })),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'DELETE_WEEK': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => ({ ...m, weeks: m.weeks.filter((w) => w.id !== action.payload.weekId) })),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'REORDER_WEEKS': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => (m.id === action.payload.monthId ? { ...m, weeks: action.payload.weeks } : m)),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    // ── Days ──
    case 'ADD_DAY': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => {
              if (w.id !== action.payload.weekId) return w;
              const newDay = { id: generateId(), name: action.payload.name || `Day ${w.days.length + 1}`, date: action.payload.date || '', tasks: [] };
              return { ...w, days: [...w.days, newDay] };
            }),
          })),
          activities: [...p.activities, { id: generateId(), type: 'add', message: `Added ${action.payload.name || 'Day'}`, timestamp: new Date().toISOString() }],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'UPDATE_DAY': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => ({
              ...w,
              days: w.days.map((d) => (d.id === action.payload.dayId ? { ...d, ...action.payload.updates } : d)),
            })),
          })),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'DELETE_DAY': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => ({ ...w, days: w.days.filter((d) => d.id !== action.payload.dayId) })),
          })),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'REORDER_DAYS': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => (w.id === action.payload.weekId ? { ...w, days: action.payload.days } : w)),
          })),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    // ── Smart Date System ──
    case 'UPDATE_DAY_DATE_SMART': {
      const { planId, dayId, newDate } = action.payload;
      if (!newDate || typeof newDate !== 'string') return state;

      // Validate date before using it
      const parsed = new Date(newDate);
      if (isNaN(parsed.getTime())) return state;

      const validDateStr = parsed.toISOString().split('T')[0];

      const plans = state.plans.map((p) => {
        if (p.id !== planId) return p;
        let found = false;
        let dayOffset = 0;
        const updatedMonths = (p.months || []).map((m) => ({
          ...m,
          weeks: (m.weeks || []).map((w) => ({
            ...w,
            days: (w.days || []).map((d) => {
              if (d.id === dayId) {
                found = true;
                dayOffset = 1;
                return { ...d, date: validDateStr };
              }
              if (found && d.status !== 'completed') {
                const shifted = new Date(parsed);
                shifted.setDate(shifted.getDate() + dayOffset);
                dayOffset++;
                const shiftedStr = !isNaN(shifted.getTime()) ? shifted.toISOString().split('T')[0] : d.date;
                return { ...d, date: shiftedStr };
              }
              return d;
            }),
          })),
        }));
        return {
          ...p,
          months: updatedMonths,
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    // ── Tasks ──
    case 'ADD_TASK': {
      const newTask = {
        id: generateId(),
        title: action.payload.title || 'Untitled Task',
        description: action.payload.description || '',
        notes: action.payload.notes || '',
        estimatedTime: action.payload.estimatedTime || '',
        priority: action.payload.priority || 'medium',
        status: 'not-started',
        youtubeUrl: action.payload.youtubeUrl || '',
        createdAt: new Date().toISOString(),
      };
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        let taskAdded = false;
        let updatedMonths = (p.months || []).map((m) => ({
          ...m,
          weeks: (m.weeks || []).map((w) => ({
            ...w,
            days: (w.days || []).map((d) => {
              if (d.id === action.payload.dayId) {
                taskAdded = true;
                return { ...d, tasks: [...(d.tasks || []), newTask] };
              }
              return d;
            }),
          })),
        }));

        // Fallback: If dayId was not found or omitted, append to first day or create one
        if (!taskAdded) {
          if (updatedMonths.length === 0) {
            updatedMonths = [{
              id: generateId(),
              name: 'Month 1',
              weeks: [{
                id: generateId(),
                name: 'Week 1',
                days: [{ id: generateId(), name: 'Day 1', date: '', tasks: [newTask] }]
              }]
            }];
          } else if ((updatedMonths[0].weeks || []).length === 0) {
            updatedMonths[0].weeks = [{
              id: generateId(),
              name: 'Week 1',
              days: [{ id: generateId(), name: 'Day 1', date: '', tasks: [newTask] }]
            }];
          } else if ((updatedMonths[0].weeks[0].days || []).length === 0) {
            updatedMonths[0].weeks[0].days = [{ id: generateId(), name: 'Day 1', date: '', tasks: [newTask] }];
          } else {
            updatedMonths[0].weeks[0].days[0].tasks = [
              ...(updatedMonths[0].weeks[0].days[0].tasks || []),
              newTask
            ];
          }
        }

        return {
          ...p,
          months: updatedMonths,
          activities: [...(p.activities || []), { id: generateId(), type: 'add', message: `Added task "${newTask.title}"`, timestamp: new Date().toISOString() }],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'UPDATE_TASK': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: (p.months || []).map((m) => ({
            ...m,
            weeks: (m.weeks || []).map((w) => ({
              ...w,
              days: (w.days || []).map((d) => ({
                ...d,
                tasks: (d.tasks || []).map((t) => (t.id === action.payload.taskId ? { ...t, ...action.payload.updates } : t)),
              })),
            })),
          })),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'CYCLE_TASK_STATUS': {
      const cycle = { 'not-started': 'in-progress', 'in-progress': 'completed', completed: 'not-started' };
      let taskName = '';
      let newStatus = '';
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: (p.months || []).map((m) => ({
            ...m,
            weeks: (m.weeks || []).map((w) => ({
              ...w,
              days: (w.days || []).map((d) => ({
                ...d,
                tasks: (d.tasks || []).map((t) => {
                  if (t.id === action.payload.taskId) {
                    taskName = t.title;
                    newStatus = cycle[t.status] || 'in-progress';
                    return { ...t, status: newStatus };
                  }
                  return t;
                }),
              })),
            })),
          })),
          activities: [...(p.activities || []), { id: generateId(), type: 'status', message: `Task "${taskName}" → ${newStatus || 'updated'}`, timestamp: new Date().toISOString() }],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'BULK_SET_TASKS_STATUS': {
      // payload: { planId, scope: 'month'|'week'|'day', scopeId, status: 'completed'|'not-started' }
      const { planId, scope, scopeId, status: bulkStatus } = action.payload;
      let count = 0;
      const setAllTasks = (tasks) =>
        (tasks || []).map((t) => {
          if (t.status !== bulkStatus) count++;
          return { ...t, status: bulkStatus };
        });

      const plans = state.plans.map((p) => {
        if (p.id !== planId) return p;
        const newMonths = (p.months || []).map((m) => {
          if (scope === 'month' && m.id === scopeId) {
            return {
              ...m,
              weeks: (m.weeks || []).map((w) => ({
                ...w,
                days: (w.days || []).map((d) => ({ ...d, tasks: setAllTasks(d.tasks) })),
              })),
            };
          }
          return {
            ...m,
            weeks: (m.weeks || []).map((w) => {
              if (scope === 'week' && w.id === scopeId) {
                return {
                  ...w,
                  days: (w.days || []).map((d) => ({ ...d, tasks: setAllTasks(d.tasks) })),
                };
              }
              return {
                ...w,
                days: (w.days || []).map((d) => {
                  if (scope === 'day' && d.id === scopeId) {
                    return { ...d, tasks: setAllTasks(d.tasks) };
                  }
                  return d;
                }),
              };
            }),
          };
        });
        const label = scope.charAt(0).toUpperCase() + scope.slice(1);
        return {
          ...p,
          months: newMonths,
          activities: [...(p.activities || []), { id: generateId(), type: 'bulk', message: `${label} marked ${bulkStatus} (${count} tasks)`, timestamp: new Date().toISOString() }],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'DELETE_TASK': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: (p.months || []).map((m) => ({
            ...m,
            weeks: (m.weeks || []).map((w) => ({
              ...w,
              days: (w.days || []).map((d) => ({ ...d, tasks: (d.tasks || []).filter((t) => t.id !== action.payload.taskId) })),
            })),
          })),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    case 'REORDER_TASKS': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => ({
              ...w,
              days: w.days.map((d) => (d.id === action.payload.dayId ? { ...d, tasks: action.payload.tasks } : d)),
            })),
          })),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, plans };
    }

    // ── Study Hours ──
    case 'LOG_STUDY_HOURS': {
      const entry = {
        id: generateId(),
        date: action.payload.date || new Date().toISOString().split('T')[0],
        hours: action.payload.hours || 0,
        minutes: action.payload.minutes || 0,
        notes: action.payload.notes || '',
        planId: action.payload.planId || null,
        timestamp: new Date().toISOString(),
      };
      let plans = state.plans;
      if (action.payload.planId) {
        plans = state.plans.map((p) => {
          if (p.id !== action.payload.planId) return p;
          return {
            ...p,
            studyHours: [...p.studyHours, entry],
            activities: [...p.activities, { id: generateId(), type: 'study', message: `Logged ${entry.hours}h ${entry.minutes}m`, timestamp: new Date().toISOString() }],
            updatedAt: new Date().toISOString(),
          };
        });
      }
      return { ...state, plans, globalStudyHours: [...state.globalStudyHours, entry] };
    }

    // ── Activities ──
    case 'ADD_GLOBAL_ACTIVITY':
      return {
        ...state,
        globalActivities: [
          { id: generateId(), ...action.payload, timestamp: new Date().toISOString() },
          ...state.globalActivities,
        ].slice(0, 200),
      };

    // ── Toasts ──
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: generateId(), ...action.payload }] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };

    // ── Video Progress ──
    case 'SAVE_VIDEO_PROGRESS': {
      const { videoId, currentTime, duration, progress } = action.payload;
      return {
        ...state,
        videoProgress: {
          ...state.videoProgress,
          [videoId]: { videoId, currentTime, duration, progress, lastWatchedAt: new Date().toISOString() },
        },
      };
    }

    // ── Study Sessions ──
    case 'START_STUDY_SESSION': {
      const newSession = {
        id: generateId(),
        planId: action.payload.planId,
        taskId: action.payload.taskId,
        videoId: action.payload.videoId || null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        duration: 0,
        videoPosition: 0,
        notes: '',
        isCompleted: false,
        status: 'active',
      };

      const studyHourEntry = {
        id: newSession.id,
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        minutes: 0,
        notes: 'Study session started',
        planId: action.payload.planId || null,
        timestamp: new Date().toISOString(),
      };

      let plans = state.plans;
      if (action.payload.planId) {
        plans = state.plans.map((p) => {
          if (p.id !== action.payload.planId) return p;
          return {
            ...p,
            studyHours: [...(p.studyHours || []), studyHourEntry],
            videoStudyHours: [...(p.videoStudyHours || []), studyHourEntry],
            updatedAt: new Date().toISOString(),
          };
        });
      }

      return {
        ...state,
        studySessions: [...state.studySessions, newSession],
        activeSessionId: newSession.id,
        videoStudyHours: [...(state.videoStudyHours || []), studyHourEntry],
        globalStudyHours: [studyHourEntry, ...(state.globalStudyHours || [])],
        plans
      };
    }

    case 'UPDATE_STUDY_SESSION': {
      const { sessionId, updates } = action.payload;
      const session = state.studySessions.find((s) => s.id === sessionId);
      if (!session) return state;

      const updatedSessions = state.studySessions.map((s) =>
        s.id === sessionId ? { ...s, ...updates } : s
      );

      // Compute precise hours and minutes
      const finalDuration = updates.duration !== undefined ? updates.duration : session.duration;
      const hrs = Math.floor(finalDuration / 3600);
      const mins = Math.round(((finalDuration % 3600) / 60) * 10) / 10;
      const finalNotes = updates.notes !== undefined ? `Study session: ${updates.notes || 'Learning session'}` : undefined;

      const updatedVideoHours = (state.videoStudyHours || []).map((h) => {
        if (h.id === sessionId) {
          return {
            ...h,
            hours: hrs,
            minutes: mins,
            ...(finalNotes !== undefined ? { notes: finalNotes } : {})
          };
        }
        return h;
      });

      const updatedGlobalHours = (state.globalStudyHours || []).map((h) => {
        if (h.id === sessionId) {
          return {
            ...h,
            hours: hrs,
            minutes: mins,
            ...(finalNotes !== undefined ? { notes: finalNotes } : {})
          };
        }
        return h;
      });

      let updatedPlans = state.plans;
      if (session.planId) {
        updatedPlans = state.plans.map((p) => {
          if (p.id !== session.planId) return p;
          return {
            ...p,
            studyHours: (p.studyHours || []).map((h) => {
              if (h.id === sessionId) {
                return {
                  ...h,
                  hours: hrs,
                  minutes: mins,
                  ...(finalNotes !== undefined ? { notes: finalNotes } : {})
                };
              }
              return h;
            }),
            videoStudyHours: (p.videoStudyHours || []).map((h) => {
              if (h.id === sessionId) {
                return {
                  ...h,
                  hours: hrs,
                  minutes: mins,
                  ...(finalNotes !== undefined ? { notes: finalNotes } : {})
                };
              }
              return h;
            }),
            updatedAt: new Date().toISOString(),
          };
        });
      }

      return {
        ...state,
        studySessions: updatedSessions,
        videoStudyHours: updatedVideoHours,
        globalStudyHours: updatedGlobalHours,
        plans: updatedPlans
      };
    }

    case 'END_STUDY_SESSION': {
      const sid = action.payload.sessionId;
      const session = state.studySessions.find((s) => s.id === sid);
      if (!session || session.isCompleted) return state;

      const finalDuration = action.payload.duration !== undefined ? action.payload.duration : session.duration;
      const hours = Math.floor(finalDuration / 3600);
      const minutes = (finalDuration % 3600) / 60;
      const finalNotes = `Study session: ${action.payload.notes || session.notes || 'Learning session'}`;

      const updatedSessions = state.studySessions.map((s) =>
        s.id === sid
          ? { 
              ...s, 
              isCompleted: true, 
              status: 'completed', 
              endedAt: new Date().toISOString(), 
              duration: finalDuration, 
              videoPosition: action.payload.videoPosition || s.videoPosition, 
              notes: action.payload.notes || s.notes 
            }
          : s
      );

      let newVideoHours = state.videoStudyHours || [];
      let newGlobalHours = state.globalStudyHours || [];
      let newPlans = state.plans;
      let newActivities = state.globalActivities;

      // Guard: If session was extremely short (less than 5 seconds), discard the study hours entry to keep logs clean
      if (finalDuration < 5) {
        newVideoHours = (state.videoStudyHours || []).filter((h) => h.id !== sid);
        newGlobalHours = (state.globalStudyHours || []).filter((h) => h.id !== sid);
        if (session.planId) {
          newPlans = state.plans.map((p) => {
            if (p.id !== session.planId) return p;
            return {
              ...p,
              studyHours: (p.studyHours || []).filter((h) => h.id !== sid),
              videoStudyHours: (p.videoStudyHours || []).filter((h) => h.id !== sid),
              updatedAt: new Date().toISOString()
            };
          });
        }
      } else {
        const roundedMins = Math.round(minutes * 10) / 10;
        const entryObj = {
          id: sid,
          date: new Date().toISOString().split('T')[0],
          hours,
          minutes: roundedMins,
          notes: finalNotes,
          planId: session.planId || null,
          timestamp: new Date().toISOString()
        };

        // Finalize videoStudyHours
        newVideoHours = (state.videoStudyHours || []).map((h) => (h.id === sid ? entryObj : h));
        if (!newVideoHours.some((h) => h.id === sid)) {
          newVideoHours = [entryObj, ...newVideoHours];
        }

        // Finalize globalStudyHours
        const existingGlobalIndex = (state.globalStudyHours || []).findIndex((h) => h.id === sid);
        if (existingGlobalIndex >= 0) {
          newGlobalHours = (state.globalStudyHours || []).map((h) => (h.id === sid ? entryObj : h));
        } else {
          newGlobalHours = [entryObj, ...(state.globalStudyHours || [])];
        }

        if (session.planId) {
          newPlans = state.plans.map((p) => {
            if (p.id !== session.planId) return p;
            const existingPlanIdx = (p.studyHours || []).findIndex((h) => h.id === sid);
            let updatedPlanStudyHours;
            if (existingPlanIdx >= 0) {
              updatedPlanStudyHours = (p.studyHours || []).map((h) => (h.id === sid ? entryObj : h));
            } else {
              updatedPlanStudyHours = [entryObj, ...(p.studyHours || [])];
            }
            return {
              ...p,
              studyHours: updatedPlanStudyHours,
              videoStudyHours: (p.videoStudyHours || []).map((h) => (h.id === sid ? entryObj : h)),
              updatedAt: new Date().toISOString()
            };
          });
        }

        newActivities = [
          { id: generateId(), type: 'study', message: `Completed study session (${hours}h ${Math.round(minutes)}m)`, timestamp: new Date().toISOString() },
          ...state.globalActivities,
        ].slice(0, 200);
      }

      return {
        ...state,
        studySessions: updatedSessions,
        activeSessionId: state.activeSessionId === sid ? null : state.activeSessionId,
        videoStudyHours: newVideoHours,
        globalStudyHours: newGlobalHours,
        plans: newPlans,
        globalActivities: newActivities,
      };
    }

    case 'DELETE_STUDY_SESSION': {
      const delId = action.payload.sessionId;
      return {
        ...state,
        studySessions: state.studySessions.filter((s) => s.id !== delId),
        activeSessionId: state.activeSessionId === delId ? null : state.activeSessionId,
        videoStudyHours: (state.videoStudyHours || []).filter((h) => h.id !== delId),
        globalStudyHours: (state.globalStudyHours || []).filter((h) => h.id !== delId),
        plans: state.plans.map((p) => ({
          ...p,
          studyHours: (p.studyHours || []).filter((h) => h.id !== delId),
          videoStudyHours: (p.videoStudyHours || []).filter((h) => h.id !== delId),
        }))
      };
    }

    // ── Reset ──
    case 'RESET_ALL':
      storage.clearAll();
      return { profile: null, settings: DEFAULT_SETTINGS, plans: [], ui: DEFAULT_UI, globalStudyHours: [], globalActivities: [], videoProgress: {}, studySessions: [], activeSessionId: null, toasts: [] };

    default:
      return state;
  }
}

export function StudyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, createDefaultState);

  // High-performance granular persistence (avoids serializing 2,369 tasks on every timer tick)
  useEffect(() => {
    if (state.plans) storage.setItem('plans', state.plans);
  }, [state.plans]);

  useEffect(() => {
    if (state.settings) {
      storage.setItem('settings', state.settings);
      if (state.settings.animationSpeed !== undefined) {
        setStoredSpeedLevel(state.settings.animationSpeed);
      }
      if (state.settings.animationStyle !== undefined) {
        setStoredStyle(state.settings.animationStyle);
      }
    }
  }, [state.settings]);

  useEffect(() => {
    if (state.profile !== null) storage.setItem('profile', state.profile);
  }, [state.profile]);

  useEffect(() => {
    storage.setItem('ui', { ...state.ui, searchOpen: false });
  }, [state.ui]);

  useEffect(() => {
    if (state.globalStudyHours) storage.setItem('globalStudyHours', state.globalStudyHours);
  }, [state.globalStudyHours]);

  useEffect(() => {
    if (state.globalActivities) storage.setItem('globalActivities', state.globalActivities);
  }, [state.globalActivities]);

  useEffect(() => {
    if (state.videoProgress) storage.setItem('videoProgress', state.videoProgress);
  }, [state.videoProgress]);

  useEffect(() => {
    if (state.studySessions) storage.setItem('studySessions', state.studySessions);
  }, [state.studySessions]);

  useEffect(() => {
    if (state.activeSessionId !== undefined) storage.setItem('activeSessionId', state.activeSessionId);
  }, [state.activeSessionId]);

  // Persist timer state only when not running or on session change (not every 1s)
  useEffect(() => {
    if (!state.mainTimer?.running && state.mainTimer) {
      storage.setItem('mainTimer', state.mainTimer);
    }
  }, [state.mainTimer?.running, state.mainTimer?.sessionCount]);

  // Main timer auto tick
  useEffect(() => {
    if (!state.mainTimer?.running) return;
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_MAIN_TIMER' });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.mainTimer?.running]);

  // Toast auto-dismiss
  useEffect(() => {
    if (state.toasts.length === 0) return;
    const latest = state.toasts[state.toasts.length - 1];
    const timer = setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: latest.id }), 4000);
    return () => clearTimeout(timer);
  }, [state.toasts]);

  const showToast = useCallback((message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, toastType: type } });
  }, []);

  const activePlan = useMemo(() => {
    if (!state.ui.activePlanId) return null;
    return state.plans.find((p) => p.id === state.ui.activePlanId && !p.archived) || null;
  }, [state.ui.activePlanId, state.plans]);

  const value = useMemo(
    () => ({ state, dispatch, activePlan, showToast }),
    [state, activePlan, showToast]
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}

export default StudyContext;
