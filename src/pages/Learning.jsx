import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import YouTubePlayer from '../components/YouTubePlayer';
import StudyTimer from '../components/StudyTimer';
import PomodoroTimer from '../components/PomodoroTimer';
import { extractVideoId, formatDuration, calcVideoProgress } from '../utils/youtube';
import {
  ArrowLeft, Play, Pause, CheckSquare, Clock, BookOpen,
  MessageSquare, FileText, Settings, Video, CheckCircle2, RotateCcw, AlertTriangle
} from 'lucide-react';

const cardStyle = { background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' };
const buttonStyle = { background: 'linear-gradient(to right, #6366f1, #818cf8)', color: '#ffffff' };
const secondaryButtonStyle = { background: '#1e1e35', color: '#8888aa', border: '1px solid rgba(255,255,255,0.08)' };

export default function Learning() {
  const { planId, taskId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, showToast } = useStudy();
  
  const containerRef = useRef(null);
  const [startAt, setStartAt] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [activeTimerTab, setActiveTimerTab] = useState('session'); // 'session' | 'pomodoro'
  const [showCinemaControls, setShowCinemaControls] = useState(true);
  const notesTimeoutRef = useRef(null);
  const cinemaControlsTimeoutRef = useRef(null);

  const handleCinemaMouseMove = () => {
    setShowCinemaControls(true);
    if (cinemaControlsTimeoutRef.current) {
      clearTimeout(cinemaControlsTimeoutRef.current);
    }
    cinemaControlsTimeoutRef.current = setTimeout(() => {
      setShowCinemaControls(false);
    }, 500); // 0.5 seconds
  };

  useEffect(() => {
    return () => {
      if (cinemaControlsTimeoutRef.current) {
        clearTimeout(cinemaControlsTimeoutRef.current);
      }
    };
  }, []);

  // ── Find Plan and Task ──
  const { plan, task } = useMemo(() => {
    const p = state.plans.find((x) => x.id === planId);
    if (!p) return { plan: null, task: null };
    
    let foundTask = null;
    p.months?.forEach((m) => {
      m.weeks?.forEach((w) => {
        w.days?.forEach((d) => {
          d.tasks?.forEach((t) => {
            if (t.id === taskId) foundTask = t;
          });
        });
      });
    });
    return { plan: p, task: foundTask };
  }, [state.plans, planId, taskId]);

  const videoId = useMemo(() => {
    return task?.youtubeUrl ? extractVideoId(task.youtubeUrl) : null;
  }, [task?.youtubeUrl]);

  const savedProgress = useMemo(() => {
    return videoId ? state.videoProgress[videoId] : null;
  }, [videoId, state.videoProgress]);

  const currentSession = useMemo(() => {
    if (!state.activeSessionId) return null;
    return state.studySessions.find((s) => s.id === state.activeSessionId);
  }, [state.activeSessionId, state.studySessions]);

  // Handle wrong session warning
  const isSessionForDifferentTask = useMemo(() => {
    return currentSession && currentSession.taskId !== taskId;
  }, [currentSession, taskId]);

  // ── Initial Animation ──
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [planId, taskId]);

  // Set initial notes when session is restored
  useEffect(() => {
    if (currentSession && currentSession.notes !== undefined) {
      setNotesText(currentSession.notes);
    }
  }, [currentSession?.id]);

  // ── Check Saved Progress on Load ──
  useEffect(() => {
    if (savedProgress && savedProgress.currentTime > 5 && startAt === null) {
      setShowResumePrompt(true);
    } else if (startAt === null) {
      setStartAt(0);
    }
  }, [savedProgress, startAt]);

  // ── Handle Progress from Player ──
  const handleProgressUpdate = useCallback((progressData) => {
    if (!videoId) return;
    dispatch({
      type: 'SAVE_VIDEO_PROGRESS',
      payload: {
        videoId,
        currentTime: progressData.currentTime,
        duration: progressData.duration,
        progress: calcVideoProgress(progressData.currentTime, progressData.duration)
      }
    });

    // Also update position in active study session
    if (state.activeSessionId && currentSession && currentSession.taskId === taskId) {
      dispatch({
        type: 'UPDATE_STUDY_SESSION',
        payload: {
          sessionId: state.activeSessionId,
          updates: { videoPosition: Math.floor(progressData.currentTime) }
        }
      });
    }
  }, [videoId, dispatch, state.activeSessionId, currentSession, taskId]);

  // ── Handle Session Timer Ticks ──
  const handleTimerTick = useCallback((seconds) => {
    if (state.activeSessionId && currentSession && currentSession.taskId === taskId) {
      dispatch({
        type: 'UPDATE_STUDY_SESSION',
        payload: {
          sessionId: state.activeSessionId,
          updates: { duration: seconds }
        }
      });
    }
  }, [state.activeSessionId, currentSession, taskId, dispatch]);

  // ── Handle Study Notes Auto-Save ──
  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotesText(val);

    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);

    if (state.activeSessionId) {
      notesTimeoutRef.current = setTimeout(() => {
        dispatch({
          type: 'UPDATE_STUDY_SESSION',
          payload: {
            sessionId: state.activeSessionId,
            updates: { notes: val }
          }
        });
      }, 800);
    }
  };

  // ── Actions ──
  const handleStartSession = () => {
    if (isSessionForDifferentTask) {
      showToast('Please end your other active study session first.', 'warning');
      return;
    }
    if (state.activeSessionId) return;

    dispatch({
      type: 'START_STUDY_SESSION',
      payload: {
        planId,
        taskId,
        videoId
      }
    });
    showToast('Study session started!', 'success');
  };

  const handleFinishSession = (finalDuration) => {
    if (!state.activeSessionId) return;

    dispatch({
      type: 'END_STUDY_SESSION',
      payload: {
        sessionId: state.activeSessionId,
        duration: finalDuration,
        notes: notesText
      }
    });
    showToast('Study session completed and logged!', 'success');
  };

  const handleEndDifferentSession = () => {
    if (!currentSession) return;
    dispatch({
      type: 'END_STUDY_SESSION',
      payload: {
        sessionId: currentSession.id,
        duration: currentSession.duration,
        notes: currentSession.notes
      }
    });
    showToast('Previous active session ended and logged.', 'info');
  };

  if (!plan || !task) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" ref={containerRef}>
          <AlertTriangle className="w-12 h-12 text-rose-400 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-2">Task or Plan Not Found</h2>
          <p className="text-sm text-[#8888aa] mb-6">The requested study task does not exist or has been deleted.</p>
          <button onClick={() => navigate('/plans')} className="px-5 py-2.5 rounded-xl text-xs cursor-pointer font-medium" style={buttonStyle}>
            Back to Plans
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!task.youtubeUrl) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" ref={containerRef}>
          <Video className="w-12 h-12 text-indigo-400 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-2">No Tutorial Link Added</h2>
          <p className="text-sm text-[#8888aa] mb-6">This task does not have a YouTube tutorial link assigned yet.</p>
          <button onClick={() => navigate(`/plans/${planId}`)} className="px-5 py-2.5 rounded-xl text-xs cursor-pointer font-medium" style={buttonStyle}>
            Edit Task to Add URL
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {isSessionForDifferentTask && (
        <div className="p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.06)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">Unfinished Session Active</h4>
              <p className="text-xs text-[#8888aa]">You currently have another study session running for a different task.</p>
            </div>
          </div>
          <button onClick={handleEndDifferentSession} className="px-4 py-2 rounded-lg text-xs font-semibold shrink-0 cursor-pointer text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-all">
            End & Log Active Session
          </button>
        </div>
      )}

      {showResumePrompt ? (
        <div 
          className="max-w-2xl mx-auto p-12 text-center my-24 rounded-3xl border border-white/10 transition-all duration-300 hover:border-indigo-500/25" 
          style={{ 
            background: '#12122a', 
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), 0 0 35px rgba(99, 102, 241, 0.05)'
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse">
            <Video className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-4 tracking-wide">Resume Tutorial?</h3>
          <p className="text-sm text-[#8888aa] mb-10 leading-relaxed">
            You previously watched this video up to <strong className="text-indigo-400 font-extrabold text-base bg-indigo-500/10 px-2 py-0.5 rounded-lg ml-1 shadow-[0_0_10px_rgba(99,102,241,0.1)]">{formatDuration(savedProgress.currentTime)}</strong>.<br />
            Would you like to pick up where you left off or start fresh?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button 
              onClick={() => { setStartAt(Math.floor(savedProgress.currentTime)); setShowResumePrompt(false); }} 
              className="px-6 py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 text-white" 
              style={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35), 0 0 20px rgba(99, 102, 241, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5), 0 0 30px rgba(99, 102, 241, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.35), 0 0 20px rgba(99, 102, 241, 0.2)';
              }}
            >
              Resume Video
            </button>
            <button 
              onClick={() => { setStartAt(0); setShowResumePrompt(false); }} 
              className="px-6 py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 text-[#8888aa] hover:text-white border border-white/5 hover:border-indigo-500/40" 
              style={{ 
                background: '#1e1e35',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Start From Beginning
            </button>
          </div>
        </div>
      ) : startAt !== null && (
        <div className="flex flex-col">
          {/* Cinematic Viewport Player & Timers Side-by-Side */}
          <div 
            onMouseMove={handleCinemaMouseMove}
            onMouseLeave={() => setShowCinemaControls(false)}
            className="relative -mx-[2.5rem] -mt-[2rem] mb-10 w-[calc(100%+5rem)] flex flex-col lg:flex-row gap-6 p-6 overflow-hidden"
            style={{ minHeight: 'calc(100vh - 4.5rem)', background: '#070712', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Left Column: Title Bar + Video Player + Scroll Indicator */}
            <div className="flex-1 flex flex-col justify-between h-full min-h-[50vh] lg:min-h-0">
              {/* Title Overlay */}
              <div 
                className="flex items-center justify-between w-full transition-all duration-300 mb-4"
                style={{
                  opacity: showCinemaControls ? 1 : 0.2,
                  transform: showCinemaControls ? 'translateY(0)' : 'translateY(-2px)',
                }}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all text-[#8888aa] border border-white/5" style={{ background: '#12122a' }}>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: plan.color || '#6366f1' }}>{plan.name}</span>
                    <h2 className="text-base font-bold text-white leading-tight">{task.title}</h2>
                  </div>
                </div>
              </div>

              {/* Video Player Box */}
              <div className="flex-1 flex items-center justify-center w-full">
                <YouTubePlayer
                  videoId={videoId}
                  startAt={startAt}
                  onProgressUpdate={handleProgressUpdate}
                  style={{
                    aspectRatio: '16 / 9',
                    width: '100%',
                    height: '100%',
                    maxWidth: '1280px',
                    maxHeight: 'calc(100vh - 12rem)',
                    borderRadius: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                    background: '#000000',
                  }}
                />
              </div>

              {/* Scroll Indicator */}
              <div 
                className="flex flex-col items-center justify-center mt-4 transition-all duration-300"
                style={{
                  opacity: showCinemaControls ? 0.7 : 0.1,
                  transform: showCinemaControls ? 'translateY(0)' : 'translateY(2px)',
                }}
              >
                <div className="flex flex-col items-center gap-1 animate-bounce">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#8888aa]">Scroll Down for Notes & Actions</span>
                  <svg className="w-3.5 h-3.5 text-[#8888aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column: Stack of Timer 1 (Session Timer) and Timer 2 (Pomodoro) */}
            <div 
              className="w-full lg:w-[320px] flex flex-col justify-center gap-4 transition-all duration-300 z-20 shrink-0"
              style={{
                opacity: showCinemaControls ? 1 : 0.15,
                transform: showCinemaControls ? 'translateX(0)' : 'translateX(5px)',
                pointerEvents: showCinemaControls ? 'auto' : 'none'
              }}
            >
              {/* Timer 1: Study Session Timer */}
              <div style={{ ...cardStyle, padding: '1rem' }} className="flex flex-col items-center">
                <StudyTimer
                  sessionId={state.activeSessionId && currentSession?.taskId === taskId ? state.activeSessionId : null}
                  initialDuration={currentSession?.taskId === taskId ? currentSession.duration : 0}
                  onTick={handleTimerTick}
                  onFinish={handleFinishSession}
                  compact={true}
                />
              </div>

              {/* Timer 2: Pomodoro Timer */}
              <div style={{ ...cardStyle, padding: '1.25rem 1rem' }} className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-2 w-full justify-start text-xs font-semibold text-white">
                  <Clock className="w-4 h-4 text-indigo-400" /> Pomodoro Timer
                </div>
                <PomodoroTimer compact={true} />
              </div>
            </div>
          </div>

          {/* Lower Page Grid containing Notes, Actions */}
          <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-10">
            {/* Left Column: Title Info & Notes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Info Card */}
              <div className="p-6" style={cardStyle}>
                <h3 className="text-base font-semibold text-white mb-1">{task.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#8888aa]">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {plan.name}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Estimated: {task.estimatedTime || 1}h</span>
                  <span className="capitalize" style={{ color: task.status === 'completed' ? '#34d399' : task.status === 'in-progress' ? '#fbbf24' : '#8888aa' }}>Status: {task.status.replace('-', ' ')}</span>
                </div>
              </div>

              {/* Notes System */}
              <div className="p-6 flex flex-col" style={cardStyle}>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" /> Study Notes
                </h3>
                {state.activeSessionId && currentSession?.taskId === taskId ? (
                  <textarea
                    value={notesText}
                    onChange={handleNotesChange}
                    placeholder="Take detailed notes here while watching the tutorial..."
                    className="w-full h-40 p-4 rounded-xl text-sm focus:outline-none resize-none leading-relaxed"
                    style={{ background: '#0c0c18', border: '1px solid rgba(255,255,255,0.06)', color: '#d0d0e0' }}
                  />
                ) : (
                  <div className="text-center py-8 rounded-xl" style={{ background: '#0c0c18' }}>
                    <p className="text-xs text-[#5a5a88] mb-3">You must start a study session to take notes</p>
                    <button onClick={handleStartSession} className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer" style={buttonStyle}>
                      Start Study Session
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Progress & Sidebar Actions */}
            <div className="space-y-6">
              {/* Video Progress Card */}
              <div className="p-6" style={cardStyle}>
                <h3 className="text-sm font-semibold text-white mb-4">Video Progress</h3>
                {savedProgress ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#8888aa]">Completed</span>
                      <span className="font-semibold text-white">{Math.round(savedProgress.progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden w-full" style={{ background: '#1e1e35' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${savedProgress.progress}%`, background: savedProgress.progress >= 95 ? '#34d399' : '#6366f1' }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#5a5a88]">
                      <span>{formatDuration(savedProgress.currentTime)}</span>
                      <span>{formatDuration(savedProgress.duration)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5a5a88] text-center py-2">Start watching to track video progress</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-6" style={cardStyle}>
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2.5">
                  {!state.activeSessionId && (
                    <button onClick={handleStartSession} className="w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2" style={buttonStyle}>
                      <Play className="w-4 h-4" /> Start Study Session
                    </button>
                  )}
                  <button onClick={() => dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: plan.id, taskId: task.id } })}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2" style={secondaryButtonStyle}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: task.status === 'completed' ? '#34d399' : '#8888aa' }} /> 
                    Mark Task: {task.status === 'completed' ? 'In Progress' : 'Completed'}
                  </button>
                  <button onClick={() => navigate(-1)} className="w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer" style={secondaryButtonStyle}>
                    Exit Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
