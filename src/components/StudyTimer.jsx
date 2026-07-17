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
}) {
  /* ── state ─────────────────────────────────────────────── */
  const [elapsedSeconds, setElapsedSeconds] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [awayNotice, setAwayNotice] = useState(false);

  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const elapsedRef = useRef(elapsedSeconds);

  // keep ref in sync for visibility handler
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
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        onTick?.(next);
        return next;
      });
    }, 1000);
  }, [clearTimer, onTick]);

  /* ── controls ──────────────────────────────────────────── */
  const handleStart = useCallback(() => {
    setHasStarted(true);
    setIsRunning(true);
    setAwayNotice(false);
    startInterval();
  }, [startInterval]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const handleResume = useCallback(() => {
    setIsRunning(true);
    setAwayNotice(false);
    startInterval();
  }, [startInterval]);

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
    setAwayNotice(false);
  }, [clearTimer]);

  const handleFinish = useCallback(() => {
    clearTimer();
    onFinish?.(elapsedRef.current);
    setElapsedSeconds(0);
    setIsRunning(false);
    setHasStarted(false);
    setAwayNotice(false);
  }, [clearTimer, onFinish]);

  /* ── visibility change auto-pause ──────────────────────── */
  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden && intervalRef.current) {
        clearTimer();
        setIsRunning(false);
        setAwayNotice(true);
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [clearTimer]);

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
    statusColor = '#22c55e';
    statusLabel = 'Active';
  } else if (hasStarted) {
    statusColor = '#f59e0b';
    statusLabel = 'Paused';
  } else {
    statusColor = '#6b7280';
    statusLabel = 'Idle';
  }

  /* ── render ────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      style={{
        background: '#12122a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem',
        padding: compact ? '1rem' : '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: compact ? '0.75rem' : '1.25rem',
        fontFamily: "'Inter', sans-serif",
        color: '#e2e8f0',
        width: '100%',
        boxSizing: 'border-box',
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
          <Timer size={compact ? 16 : 20} color="#6366f1" />
          <span
            style={{
              fontWeight: 600,
              fontSize: compact ? '0.85rem' : '1rem',
              letterSpacing: '0.02em',
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
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
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
            stroke="#1e1e35"
            strokeWidth={RING_STROKE}
          />
          {/* progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#6366f1"
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
              color: '#f1f5f9',
            }}
          >
            {formatDuration(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* away notice */}
      {awayNotice && (
        <span
          style={{
            fontSize: '0.75rem',
            color: '#f59e0b',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Timer was paused while you were away
        </span>
      )}

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
            bg="#6366f1"
            onClick={handleStart}
            compact={compact}
          />
        )}

        {hasStarted && isRunning && (
          <>
            <ControlButton
              icon={<Pause size={16} />}
              label="Pause"
              bg="#f59e0b"
              onClick={handlePause}
              compact={compact}
            />
            <ControlButton
              icon={<Square size={16} />}
              label="Finish"
              bg="#22c55e"
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
              bg="#6366f1"
              onClick={handleResume}
              compact={compact}
            />
            <ControlButton
              icon={<RotateCcw size={16} />}
              label="Reset"
              bg="#ef4444"
              onClick={handleReset}
              compact={compact}
            />
            <ControlButton
              icon={<Square size={16} />}
              label="Finish"
              bg="#22c55e"
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: bg,
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        padding: compact ? '0.3rem 0.6rem' : '0.45rem 0.85rem',
        fontSize: compact ? '0.7rem' : '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'filter 0.15s',
        letterSpacing: '0.02em',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
    >
      {icon}
      {label}
    </button>
  );
}

export default React.memo(StudyTimer);
