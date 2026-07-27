import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Play, Pause, RotateCcw, Square, Timer } from 'lucide-react';
import { formatDuration } from '../utils/youtube';

const RING_STROKE = 6;
const FULL_SIZE = 160;
const COMPACT_SIZE = 80;

function StudyTimer({
  sessionId,
  initialDuration = 0,
  onTick,
  onFinish,
  compact = false,
  videoPlaying = false,
}) {
  /* ── state ─────────────────────────────────────────────── */
  const [elapsedSeconds, setElapsedSeconds] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const elapsedRef = useRef(elapsedSeconds);
  const lastTickTimeRef = useRef(null);

  // keep ref in sync
  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  /* ── interval logic ────────────────────────────────────── */
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    clearTimer();
    lastTickTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickTimeRef.current) / 1000);
      if (delta >= 1) {
        setElapsedSeconds((prev) => {
          const next = prev + delta;
          onTick?.(next);
          return next;
        });
        lastTickTimeRef.current = now;
      }
    }, 1000);
  }, [clearTimer, onTick]);

  /* ── controls ──────────────────────────────────────────── */
  const handleStart = useCallback(() => {
    setHasStarted(true);
    setIsRunning(true);
    lastTickTimeRef.current = Date.now();
    startInterval();
  }, [startInterval]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const handleResume = useCallback(() => {
    setIsRunning(true);
    lastTickTimeRef.current = Date.now();
    startInterval();
  }, [startInterval]);

  useEffect(() => {
    if (videoPlaying) {
      if (!hasStarted) {
        handleStart();
      } else if (!isRunning) {
        handleResume();
      }
    } else {
      if (isRunning) {
        handlePause();
      }
    }
  }, [videoPlaying, hasStarted, isRunning, handleStart, handleResume, handlePause]);

  const handleReset = useCallback(() => {
    if (elapsedRef.current > 0) {
      // eslint-disable-next-line no-restricted-globals
      if (!window.confirm('Reset the timer? All un-finished progress will be lost.')) {
        return;
      }
    }
    clearTimer();
    setElapsedSeconds(0);
    setIsRunning(false);
    setHasStarted(false);
  }, [clearTimer]);

  const handleFinish = useCallback(() => {
    clearTimer();
    onFinish?.(elapsedRef.current);
    setElapsedSeconds(0);
    setIsRunning(false);
    setHasStarted(false);
  }, [clearTimer, onFinish]);

  /* ── unmount cleanup ────────────────────────────── */
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  /* ── visibility change sync ──────────────────────── */
  useEffect(() => {
    const onVisChange = () => {
      if (!document.hidden && isRunning && lastTickTimeRef.current) {
        const now = Date.now();
        const delta = Math.floor((now - lastTickTimeRef.current) / 1000);
        if (delta >= 1) {
          setElapsedSeconds((prev) => {
            const next = prev + delta;
            onTick?.(next);
            return next;
          });
          lastTickTimeRef.current = now;
        }
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [isRunning, onTick]);

  /* ── cleanup on unmount ────────────────────────────────── */
  useEffect(() => () => clearTimer(), [clearTimer]);

  /* ── GSAP entrance animation ───────────────────────────── */
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
      );
    }
  }, []);

  /* ── circular progress ring ────────────────────────────── */
  const size = compact ? COMPACT_SIZE : FULL_SIZE;
  const radius = (size - RING_STROKE * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (elapsedSeconds % 60) / 60;
  const dashOffset = circumference * (1 - progress);

  /* ── status indicator ──────────────────────────────────── */
  let statusColor, statusLabel;
  if (isRunning) {
    statusColor = '#38a169';
    statusLabel = 'Active';
  } else if (hasStarted) {
    statusColor = '#ed8936';
    statusLabel = 'Paused';
  } else {
    statusColor = '#718096';
    statusLabel = 'Idle';
  }

  /* ── render ────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      style={{
        background: '#e6ebf2',
        border: '1px solid rgba(255,255,255,0.7)',
        borderRadius: '1.25rem',
        padding: compact ? '1rem' : '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: compact ? '0.75rem' : '1.25rem',
        fontFamily: "'Inter', sans-serif",
        color: '#1a202c',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.6), -6px -6px 14px rgba(255, 255, 255, 0.85)',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Timer size={compact ? 16 : 20} color="#ed8936" />
          <span
            style={{
              fontWeight: 600,
              fontSize: compact ? '0.85rem' : '1rem',
              letterSpacing: '0.02em',
              textShadow: 'none',
              color: '#1a202c',
            }}
          >
            Study Timer
          </span>
        </div>

        {/* status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColor,
              display: 'inline-block',
              boxShadow: `0 0 6px ${statusColor}`,
            }}
          />
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* circular ring */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(163, 177, 198, 0.3)"
            strokeWidth={RING_STROKE}
            style={{ filter: 'none' }}
          />
          {/* progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ed8936"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.35s ease' }}
          />
        </svg>

        {/* centred time */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 700,
              fontSize: compact ? '0.95rem' : '1.5rem',
              letterSpacing: '0.04em',
              color: '#ed8936',
              textShadow: 'none',
            }}
          >
            {formatDuration(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {!hasStarted && (
          <ControlButton
            icon={<Play size={16} />}
            label="Start"
            bg="linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)"
            onClick={handleStart}
            compact={compact}
          />
        )}

        {hasStarted && isRunning && (
          <>
            <ControlButton
              icon={<Pause size={16} />}
              label="Pause"
              bg="linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)"
              onClick={handlePause}
              compact={compact}
            />
            <ControlButton
              icon={<Square size={16} />}
              label="Finish"
              bg="linear-gradient(135deg, #38a169 0%, #2f855a 100%)"
              onClick={handleFinish}
              compact={compact}
            />
          </>
        )}

        {hasStarted && !isRunning && (
          <>
            <ControlButton
              icon={<Play size={16} />}
              label="Resume"
              bg="linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)"
              onClick={handleResume}
              compact={compact}
            />
            <ControlButton
              icon={<RotateCcw size={16} />}
              label="Reset"
              bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
              onClick={handleReset}
              compact={compact}
            />
            <ControlButton
              icon={<Square size={16} />}
              label="Finish"
              bg="linear-gradient(135deg, #38a169 0%, #2f855a 100%)"
              onClick={handleFinish}
              compact={compact}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ── small button helper ───────────────────────────────────── */
function ControlButton({ icon, label, bg, onClick, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="brass-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: bg,
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '0.75rem',
        padding: compact ? '0.3rem 0.6rem' : '0.45rem 0.85rem',
        fontSize: compact ? '0.7rem' : '0.8rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.15s',
        letterSpacing: '0.02em',
        boxShadow: '4px 4px 10px rgba(163, 177, 198, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.85)',
        textShadow: 'none',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default React.memo(StudyTimer);
