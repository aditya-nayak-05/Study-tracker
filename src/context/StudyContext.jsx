import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import * as storage from '../utils/storage';
import { generateId } from '../utils/helpers';

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

const DEFAULT_SETTINGS = {
  animationsEnabled: true,
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
  sidebarCollapsed: false,
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

function createDefaultState() {
  const loadedPlans = storage.getItem('plans', []);
  const hasDsRoadmap = loadedPlans.some((p) => p.id === 'ds-roadmap-plan-id');
  let plans;
  if (hasDsRoadmap) {
    // If existing plan days lack dates, backfill them
    plans = loadedPlans.map((p) => {
      if (p.id !== 'ds-roadmap-plan-id') return p;
      const hasDates = (p.months || []).some((m) =>
        (m.weeks || []).some((w) => (w.days || []).some((d) => d.date))
      );
      if (hasDates) return p; // Already has dates, don't overwrite user edits
      // Assign weekday dates starting from today
      const start = new Date(); start.setHours(0, 0, 0, 0);
      let dayOffset = 0;
      const updatedMonths = (p.months || []).map((m) => ({
        ...m,
        weeks: (m.weeks || []).map((w) => ({
          ...w,
          days: (w.days || []).map((d) => {
            const dt = new Date(start);
            dt.setDate(dt.getDate() + dayOffset);
            while (dt.getDay() === 0 || dt.getDay() === 6) { dt.setDate(dt.getDate() + 1); dayOffset++; }
            dayOffset++;
            return { ...d, date: d.date || dt.toISOString().split('T')[0] };
          }),
        })),
      }));
      return { ...p, months: updatedMonths };
    });
  } else {
    plans = [...loadedPlans, dsRoadmap];
  }

  const loadedUi = storage.getItem('ui', DEFAULT_UI);
  const ui = !loadedUi.activePlanId ? { ...loadedUi, activePlanId: 'ds-roadmap-plan-id' } : loadedUi;

  return {
    profile: storage.getItem('profile', null),
    settings: storage.getItem('settings', DEFAULT_SETTINGS),
    plans,
    ui,
    globalStudyHours: storage.getItem('globalStudyHours', []),
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

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    // ── Settings ──
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

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
      const plans = state.plans.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload.updates, updatedAt: new Date().toISOString() } : p
      );
      return { ...state, plans };
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

    // ── Months ──
    case 'ADD_MONTH': {
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        const newMonth = { id: generateId(), name: action.payload.name || `Month ${p.months.length + 1}`, weeks: [] };
        return {
          ...p,
          months: [...p.months, newMonth],
          activities: [...p.activities, { id: generateId(), type: 'add', message: `Added ${newMonth.name}`, timestamp: new Date().toISOString() }],
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
      const plans = state.plans.map((p) => {
        if (p.id !== planId) return p;
        let found = false;
        let dayOffset = 0;
        const newDateObj = new Date(newDate);
        const updatedMonths = p.months.map((m) => ({
          ...m,
          weeks: m.weeks.map((w) => ({
            ...w,
            days: w.days.map((d) => {
              if (d.id === dayId) {
                found = true;
                dayOffset = 1;
                return { ...d, date: newDate };
              }
              if (found && d.status !== 'completed') {
                const shifted = new Date(newDateObj);
                shifted.setDate(shifted.getDate() + dayOffset);
                dayOffset++;
                return { ...d, date: shifted.toISOString().split('T')[0] };
              }
              return d;
            }),
          })),
        }));
        return {
          ...p,
          months: updatedMonths,
          activities: [...p.activities, { id: generateId(), type: 'date-change', message: `Updated dates starting from Day`, timestamp: new Date().toISOString() }],
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
        priority: action.payload.priority || 'low',
        status: 'not-started',
        youtubeUrl: action.payload.youtubeUrl || '',
        createdAt: new Date().toISOString(),
      };
      const plans = state.plans.map((p) => {
        if (p.id !== action.payload.planId) return p;
        return {
          ...p,
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => ({
              ...w,
              days: w.days.map((d) => (d.id === action.payload.dayId ? { ...d, tasks: [...d.tasks, newTask] } : d)),
            })),
          })),
          activities: [...p.activities, { id: generateId(), type: 'add', message: `Added task "${newTask.title}"`, timestamp: new Date().toISOString() }],
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
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => ({
              ...w,
              days: w.days.map((d) => ({
                ...d,
                tasks: d.tasks.map((t) => (t.id === action.payload.taskId ? { ...t, ...action.payload.updates } : t)),
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
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => ({
              ...w,
              days: w.days.map((d) => ({
                ...d,
                tasks: d.tasks.map((t) => {
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
          activities: [...p.activities, { id: generateId(), type: 'status', message: `Task "${taskName}" → ${newStatus || 'updated'}`, timestamp: new Date().toISOString() }],
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
          months: p.months.map((m) => ({
            ...m,
            weeks: m.weeks.map((w) => ({
              ...w,
              days: w.days.map((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== action.payload.taskId) })),
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
            updatedAt: new Date().toISOString(),
          };
        });
      }

      return {
        ...state,
        studySessions: [...state.studySessions, newSession],
        activeSessionId: newSession.id,
        globalStudyHours: [...state.globalStudyHours, studyHourEntry],
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
      const mins = (finalDuration % 3600) / 60;
      const finalNotes = updates.notes !== undefined ? `Study session: ${updates.notes || 'Learning session'}` : undefined;

      const updatedGlobalHours = state.globalStudyHours.map((h) => {
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
            updatedAt: new Date().toISOString(),
          };
        });
      }

      return {
        ...state,
        studySessions: updatedSessions,
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

      let newGlobalHours = state.globalStudyHours;
      let newPlans = state.plans;
      let newActivities = state.globalActivities;

      // Guard: If session was extremely short (less than 5 seconds), discard the study hours entry to keep logs clean
      if (finalDuration < 5) {
        newGlobalHours = state.globalStudyHours.filter((h) => h.id !== sid);
        if (session.planId) {
          newPlans = state.plans.map((p) => {
            if (p.id !== session.planId) return p;
            return {
              ...p,
              studyHours: (p.studyHours || []).filter((h) => h.id !== sid),
              updatedAt: new Date().toISOString()
            };
          });
        }
      } else {
        // Finalize the existing entry
        newGlobalHours = state.globalStudyHours.map((h) => {
          if (h.id === sid) {
            return {
              ...h,
              hours,
              minutes,
              notes: finalNotes,
              timestamp: new Date().toISOString()
            };
          }
          return h;
        });

        if (session.planId) {
          newPlans = state.plans.map((p) => {
            if (p.id !== session.planId) return p;
            return {
              ...p,
              studyHours: (p.studyHours || []).map((h) => {
                if (h.id === sid) {
                  return {
                    ...h,
                    hours,
                    minutes,
                    notes: finalNotes,
                    timestamp: new Date().toISOString()
                  };
                }
                return h;
              }),
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

  // Auto-persist on every state change
  useEffect(() => {
    if (state.profile !== null) storage.setItem('profile', state.profile);
    storage.setItem('settings', state.settings);
    storage.setItem('plans', state.plans);
    storage.setItem('ui', { ...state.ui, searchOpen: false });
    storage.setItem('globalStudyHours', state.globalStudyHours);
    storage.setItem('globalActivities', state.globalActivities);
    storage.setItem('videoProgress', state.videoProgress);
    storage.setItem('studySessions', state.studySessions);
    storage.setItem('activeSessionId', state.activeSessionId);
  }, [state.profile, state.settings, state.plans, state.ui, state.globalStudyHours, state.globalActivities, state.videoProgress, state.studySessions, state.activeSessionId]);

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
    return state.plans.find((p) => p.id === state.ui.activePlanId) || null;
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
