import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Play, Pause, RotateCcw, Flame, Square } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

const PomodoroTimer = React.memo(function PomodoroTimer({ compact = false }) {
  const { state, dispatch } = useStudy();
  const mainTimer = state.mainTimer || {};
  const { secondsLeft = 1500, running = false, totalSeconds = 1500, sessionCount = 0 } = mainTimer;

  const circleRef = useRef(null);
  const timerRef = useRef(null);

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
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

  const toggle = useCallback(() => {
    if (running) {
      dispatch({ type: 'PAUSE_MAIN_TIMER' });
    } else {
      dispatch({ type: 'START_MAIN_TIMER' });
    }
  }, [running, dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET_MAIN_TIMER' });
  }, [dispatch]);

  const finishEarly = useCallback(() => {
    dispatch({ type: 'FINISH_MAIN_TIMER_EARLY' });
  }, [dispatch]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const svgSize = compact ? 100 : 170;
  const hasElapsed = secondsLeft < totalSeconds;

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
            stroke="var(--accent-orange)"
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
          <span className={`text-muted capitalize font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {running ? 'Focusing' : 'Timer'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggle}
          title={running ? 'Pause' : 'Start'}
          className={`p-3 rounded-xl cursor-pointer transition-all leather-btn flex items-center justify-center ${
            running
              ? 'border-2 border-[var(--accent-orange)] text-accent-primary'
              : 'text-accent-primary'
          }`}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {hasElapsed && (
          <button
            onClick={finishEarly}
            title="Finish & Log Session"
            className="p-3 rounded-xl text-[#38a169] hover:text-[#2f855a] transition-all cursor-pointer leather-btn flex items-center justify-center"
          >
            <Square className="w-4 h-4" fill="currentColor" fillOpacity="0.2" />
          </button>
        )}

        <button
          onClick={reset}
          title="Reset Timer"
          className="p-3 rounded-xl text-muted hover:text-main transition-all cursor-pointer leather-btn flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {!compact && sessionCount > 0 && (
        <p className="text-[11px] text-muted flex items-center gap-1 font-medium">
          <Flame className="w-3 h-3 text-accent-primary" /> {sessionCount} lap{sessionCount !== 1 ? 's' : ''} completed today
        </p>
      )}
    </div>
  );
});

export default PomodoroTimer;


