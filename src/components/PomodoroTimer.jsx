import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

const PomodoroTimer = React.memo(function PomodoroTimer({ compact = false }) {
  const { state, dispatch, showToast } = useStudy();
  const { pomodoroWork = 25, pomodoroBreak = 5 } = state.settings;

  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [seconds, setSeconds] = useState(pomodoroWork * 60);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const circleRef = useRef(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const totalSeconds = mode === 'work' ? pomodoroWork * 60 : pomodoroBreak * 60;
  const progress = 1 - seconds / totalSeconds;
  const radius = compact ? 40 : 70;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (timerRef.current) {
      gsap.fromTo(timerRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' });
    }
  }, []);

  useEffect(() => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        strokeDashoffset: circumference * (1 - progress),
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [progress, circumference]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'work') {
              setSessionCount((c) => c + 1);
              dispatch({
                type: 'LOG_STUDY_HOURS',
                payload: { hours: 0, minutes: pomodoroWork, notes: 'Pomodoro session', planId: state.ui.activePlanId },
              });
              showToast('Pomodoro complete! Take a break 🎉', 'success');
              setMode('break');
              return pomodoroBreak * 60;
            } else {
              showToast('Break over! Time to focus 💪', 'info');
              setMode('work');
              return pomodoroWork * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, pomodoroWork, pomodoroBreak, dispatch, showToast, state.ui.activePlanId]);

  const toggle = useCallback(() => setRunning((r) => !r), []);
  const reset = useCallback(() => {
    setRunning(false);
    setMode('work');
    setSeconds(pomodoroWork * 60);
  }, [pomodoroWork]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const svgSize = compact ? 100 : 170;

  return (
    <div ref={timerRef} className="flex flex-col items-center gap-3">
      {/* Circle */}
      <div className="relative">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" stroke="rgba(163, 177, 198, 0.3)" strokeWidth={compact ? 4 : 6}
          />
          <circle
            ref={circleRef}
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none"
            stroke={mode === 'work' ? 'var(--accent-orange)' : '#38a169'}
            strokeWidth={compact ? 4 : 6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ filter: 'none' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-bold text-accent-primary ${compact ? 'text-lg' : 'text-3xl'}`} style={{textShadow: 'none'}}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className={`text-[#718096] capitalize font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {mode === 'work' ? 'Focus' : 'Break'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`p-3 rounded-xl cursor-pointer transition-all leather-btn flex items-center justify-center ${
            running
              ? 'border-2 border-[var(--accent-orange)] text-accent-primary'
              : 'text-accent-primary'
          }`}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={reset}
          className="p-3 rounded-xl text-muted hover:text-main transition-all cursor-pointer leather-btn flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {!compact && sessionCount > 0 && (
        <p className="text-[11px] text-[#718096] flex items-center gap-1 font-medium">
          <Coffee className="w-3 h-3 text-accent-primary" /> {sessionCount} session{sessionCount !== 1 ? 's' : ''} today
        </p>
      )}
    </div>
  );
});

export default PomodoroTimer;
