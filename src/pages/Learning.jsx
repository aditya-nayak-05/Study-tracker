import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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

const cardStyle = {
  background: 'var(--neu-card-bg)',
  border: '1px solid var(--neu-border)',
  borderRadius: '1.25rem',
  boxShadow: 'var(--neu-shadow-raised)',
  color: 'var(--neu-text-main)',
};

const buttonStyle = {
  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '0.85rem',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '5px 5px 12px rgba(163, 177, 198, 0.6), -5px -5px 12px rgba(255, 255, 255, 0.8)',
};

const secondaryButtonStyle = {
  background: 'var(--neu-card-bg)',
  color: 'var(--neu-text-main)',
  border: '1px solid var(--neu-border)',
  borderRadius: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: 'var(--neu-shadow-raised)',
};

export default function Learning() {
  const { planId, taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch, showToast } = useStudy();
  
  const autoResume = location.state?.autoResume;
  const containerRef = useRef(null);
  const videoPlaceholderRef = useRef(null);
  const [startAt, setStartAt] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [activeTimerTab, setActiveTimerTab] = useState('session'); // 'session' | 'pomodoro'
  const [showCinemaControls, setShowCinemaControls] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [placeholderRect, setPlaceholderRect] = useState(null);
  const notesTimeoutRef = useRef(null);
  const cinemaControlsTimeoutRef = useRef(null);

  // Track the placeholder position for the portal-based video player
  useLayoutEffect(() => {
    const el = videoPlaceholderRef.current;
    if (!el) return;
    const update = () => {
      if (videoPlaceholderRef.current) {
        setPlaceholderRect(videoPlaceholderRef.current.getBoundingClientRect());
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [showCinemaControls, startAt]);

  const handleCinemaMouseMove = useCallback(() => {
    setShowCinemaControls(true);
    if (cinemaControlsTimeoutRef.current) {
      clearTimeout(cinemaControlsTimeoutRef.current);
    }
    cinemaControlsTimeoutRef.current = setTimeout(() => {
      setShowCinemaControls(false);
    }, 2500); // 2.5 seconds
  }, []);

  useEffect(() => {
    const handleGlobalMove = () => {
      setShowCinemaControls(true);
      if (cinemaControlsTimeoutRef.current) {
        clearTimeout(cinemaControlsTimeoutRef.current);
      }
      cinemaControlsTimeoutRef.current = setTimeout(() => {
        setShowCinemaControls(false);
      }, 2500);
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('touchstart', handleGlobalMove);
    window.addEventListener('keydown', handleGlobalMove);

    cinemaControlsTimeoutRef.current = setTimeout(() => {
      setShowCinemaControls(false);
    }, 2500);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('touchstart', handleGlobalMove);
      window.removeEventListener('keydown', handleGlobalMove);
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

  // ── Check Saved Progress on Load & Auto-Resume ──
  useEffect(() => {
    if (savedProgress && savedProgress.currentTime > 2 && startAt === null) {
      const resumeTime = Math.floor(savedProgress.currentTime);
      setStartAt(resumeTime);
      showToast(`Auto-resumed tutorial from ${formatDuration(resumeTime)}`, 'info');
    } else if (startAt === null) {
      setStartAt(0);
    }
  }, [savedProgress, startAt, showToast]);

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
          <AlertTriangle className="w-12 h-12 text-[#e53e3e] mb-3" />
          <h2 className="text-lg font-semibold text-main mb-2">Task or Plan Not Found</h2>
          <p className="text-sm text-muted mb-6">The requested study task does not exist or has been deleted.</p>
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
          <Video className="w-12 h-12 text-[#3182ce] mb-3" />
          <h2 className="text-lg font-semibold text-main mb-2">No Tutorial Link Added</h2>
          <p className="text-sm text-muted mb-6">This task does not have a YouTube tutorial link assigned yet.</p>
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
        <div className="p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--accent-orange)]/40" style={{ background: 'rgba(237,137,54,0.08)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-main">Unfinished Session Active</h4>
              <p className="text-xs text-muted">You currently have another study session running for a different task.</p>
            </div>
          </div>
          <button onClick={handleEndDifferentSession} className="px-4 py-2 rounded-lg text-xs font-semibold shrink-0 cursor-pointer text-accent-primary border border-[var(--accent-orange)]/40 hover:bg-[var(--accent-orange)]/10 transition-all">
            End & Log Active Session
          </button>
        </div>
      )}

      {showResumePrompt ? (
        <div 
          className="max-w-2xl mx-auto p-12 text-center my-24 rounded-3xl border border-[var(--neu-border)] transition-all duration-300" 
          style={{ 
            background: 'var(--neu-card-bg)', 
            boxShadow: '10px 10px 30px rgba(163, 177, 198, 0.7), -10px -10px 30px rgba(255, 255, 255, 0.9)'
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-orange)]/10 flex items-center justify-center mx-auto mb-8 border border-[var(--accent-orange)]/20 shadow-sm animate-pulse">
            <Video className="w-8 h-8 text-accent-primary" />
          </div>
          <h3 className="text-xl font-extrabold text-main mb-4 tracking-wide">Resume Tutorial?</h3>
          <p className="text-sm text-muted mb-10 leading-relaxed">
            You previously watched this video up to <strong className="text-accent-primary font-extrabold text-base bg-[var(--accent-orange)]/10 px-2 py-0.5 rounded-lg ml-1">{formatDuration(savedProgress.currentTime)}</strong>.<br />
            Would you like to pick up where you left off or start fresh?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button 
              onClick={() => { setStartAt(Math.floor(savedProgress.currentTime)); setShowResumePrompt(false); }} 
              className="px-6 py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300" 
              style={buttonStyle}
            >
              Resume Video
            </button>
            <button 
              onClick={() => { setStartAt(0); setShowResumePrompt(false); }} 
              className="px-6 py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300" 
              style={secondaryButtonStyle}
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
            onPointerMove={handleCinemaMouseMove}
            onTouchStart={handleCinemaMouseMove}
            onMouseLeave={() => setShowCinemaControls(false)}
            className="relative -mx-[2.5rem] -mt-[2rem] mb-10 w-[calc(100%+5rem)] flex flex-col lg:flex-row gap-6 p-6 overflow-hidden"
            style={{ minHeight: 'calc(100vh - 4.5rem)', background: 'var(--neu-card-bg)', borderBottom: '1px solid rgba(163,177,198,0.3)' }}
          >
            {/* Left Column: Title Bar + Video Player + Scroll Indicator */}
            <div className="flex-1 flex flex-col justify-between h-full min-h-[50vh] lg:min-h-0">
              {/* Title Overlay */}
              <div 
                className="flex items-center justify-between w-full transition-all duration-500 mb-4"
                style={{
                  opacity: showCinemaControls ? 1 : 0,
                  pointerEvents: showCinemaControls ? 'auto' : 'none',
                  transform: showCinemaControls ? 'translateY(0)' : 'translateY(-10px)',
                }}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl cursor-pointer transition-all text-muted border border-[var(--neu-border)]" style={{ background: 'var(--neu-card-bg)', boxShadow: '3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.8)' }}>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: plan.color || 'var(--accent-orange)' }}>{plan.name}</span>
                    <h2 className="text-base font-bold text-main leading-tight">{task.title}</h2>
                  </div>
                </div>
              </div>

              {/* Placeholder: reserves space in the layout for the portal-rendered video */}
              <div 
                ref={videoPlaceholderRef}
                className="flex-1 w-full"
                style={{ aspectRatio: '16 / 9', maxWidth: '1280px', maxHeight: 'calc(100vh - 12rem)' }}
              />

              {/* Video Player - rendered via portal on document.body so position:fixed always works */}
              {ReactDOM.createPortal(
                <div
                  onMouseMove={handleCinemaMouseMove}
                  onPointerMove={handleCinemaMouseMove}
                  onTouchStart={handleCinemaMouseMove}
                  style={(() => {
                    const isInline = showCinemaControls && placeholderRect;
                    if (isInline) {
                      // Calculate transform to visually position the fullscreen-sized element at the placeholder's location
                      const vw = window.innerWidth;
                      const vh = window.innerHeight;
                      const sx = placeholderRect.width / vw;
                      const sy = placeholderRect.height / vh;
                      // Transform origin is top-left, so translate to placeholder's top-left after scaling
                      const tx = placeholderRect.left / sx;
                      const ty = placeholderRect.top / sy;
                      return {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 99999,
                        overflow: 'hidden',
                        transformOrigin: '0 0',
                        transform: `scale(${sx}, ${sy}) translate(${tx}px, ${ty}px)`,
                        borderRadius: `${1.25 / sx}rem / ${1.25 / sy}rem`,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        willChange: 'transform, border-radius',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      };
                    }
                    return {
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      zIndex: 99999,
                      overflow: 'hidden',
                      transformOrigin: '0 0',
                      transform: 'scale(1, 1) translate(0px, 0px)',
                      borderRadius: '0px',
                      background: '#000000',
                      willChange: 'transform, border-radius',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    };
                  })()}
                >
                  <YouTubePlayer
                    videoId={videoId}
                    startAt={startAt}
                    autoPlay={true}
                    onProgressUpdate={handleProgressUpdate}
                    onStateChange={(stateCode) => {
                      if (stateCode === 1) {
                        setVideoPlaying(true);
                        if (!state.activeSessionId) {
                          handleStartSession();
                        }
                      } else if (stateCode === 2 || stateCode === 0) {
                        setVideoPlaying(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: '#000000',
                    }}
                  />
                </div>,
                document.body
              )}

              {/* Scroll Indicator */}
              <div 
                className="flex flex-col items-center justify-center mt-4 transition-all duration-500"
                style={{
                  opacity: showCinemaControls ? 0.7 : 0.0,
                  pointerEvents: showCinemaControls ? 'auto' : 'none',
                  transform: showCinemaControls ? 'translateY(0)' : 'translateY(10px)',
                }}
              >
                <div className="flex flex-col items-center gap-1 animate-bounce">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-muted">Scroll Down for Notes & Actions</span>
                  <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column: Stack of Timer 1 (Session Timer) and Timer 2 (Pomodoro) */}
            <div 
              className="w-full lg:w-[320px] flex flex-col justify-center gap-4 transition-all duration-500 z-20 shrink-0"
              style={{
                opacity: showCinemaControls ? 1 : 0,
                transform: showCinemaControls ? 'translateX(0)' : 'translateX(20px)',
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
                  videoPlaying={videoPlaying}
                />
              </div>

              {/* Timer 2: Pomodoro Timer */}
              <div style={{ ...cardStyle, padding: '1.25rem 1rem' }} className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-2 w-full justify-start text-xs font-semibold text-main">
                  <Clock className="w-4 h-4 text-accent-primary" /> Pomodoro Timer
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
                <h3 className="text-base font-semibold text-main mb-1">{task.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {plan.name}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Estimated: {task.estimatedTime || 1}h</span>
                  <span className="capitalize" style={{ color: task.status === 'completed' ? '#38a169' : task.status === 'in-progress' ? 'var(--accent-orange)' : '#718096' }}>Status: {task.status.replace('-', ' ')}</span>
                </div>
              </div>

              {/* Notes System */}
              <div className="p-6 flex flex-col" style={cardStyle}>
                <h3 className="text-sm font-semibold text-main mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent-primary" /> Study Notes
                </h3>
                {state.activeSessionId && currentSession?.taskId === taskId ? (
                  <textarea
                    value={notesText}
                    onChange={handleNotesChange}
                    placeholder="Take detailed notes here while watching the tutorial..."
                    className="w-full h-40 p-4 rounded-xl text-sm focus:outline-none resize-none leading-relaxed inset-field text-main"
                  />
                ) : (
                  <div className="text-center py-8 rounded-xl" style={{ background: 'var(--neu-card-bg)', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)' }}>
                    <p className="text-xs text-muted mb-3">You must start a study session to take notes</p>
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
                <h3 className="text-sm font-semibold text-main mb-4">Video Progress</h3>
                {savedProgress ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted">Completed</span>
                      <span className="font-semibold text-main">{Math.round(savedProgress.progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden w-full bg-[var(--neu-card-bg)]" style={{ boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.8)' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${savedProgress.progress}%`, background: savedProgress.progress >= 95 ? '#38a169' : 'var(--accent-orange)' }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted">
                      <span>{formatDuration(savedProgress.currentTime)}</span>
                      <span>{formatDuration(savedProgress.duration)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted text-center py-2">Start watching to track video progress</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-6" style={cardStyle}>
                <h3 className="text-sm font-semibold text-main mb-4">Quick Actions</h3>
                <div className="space-y-2.5">
                  {!state.activeSessionId && (
                    <button onClick={handleStartSession} className="w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2" style={buttonStyle}>
                      <Play className="w-4 h-4" /> Start Study Session
                    </button>
                  )}
                  <button onClick={() => dispatch({ type: 'CYCLE_TASK_STATUS', payload: { planId: plan.id, taskId: task.id } })}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2" style={secondaryButtonStyle}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: task.status === 'completed' ? '#38a169' : '#718096' }} /> 
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
