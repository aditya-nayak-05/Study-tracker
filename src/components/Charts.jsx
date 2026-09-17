import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { getMotionDuration, getSpeedMultiplier, isReducedMotion } from '../utils/motion';

export const BarChart = React.memo(function BarChart({ data = [], maxHeight = 120, barColor = 'var(--accent-orange)' }) {
  const barsRef = useRef([]);
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  useEffect(() => {
    const isOff = getSpeedMultiplier() === 0 || isReducedMotion();
    barsRef.current.forEach((bar, i) => {
      if (!bar) return;
      const targetHeight = (data[i]?.value / maxVal) * maxHeight;
      if (isOff) {
        bar.style.height = `${targetHeight}px`;
      } else {
        const dur = getMotionDuration(0.5);
        const mult = getSpeedMultiplier();
        gsap.fromTo(
          bar,
          { height: 0 },
          { height: targetHeight, duration: dur, delay: i * 0.04 * mult, ease: 'power2.out' }
        );
      }
    });
  }, [data, maxVal, maxHeight]);

  return (
    <div className="flex items-end gap-1.5 justify-center" style={{ height: maxHeight + 30 }}>
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            ref={(el) => (barsRef.current[i] = el)}
            className="rounded-t-md w-6 sm:w-8 transition-all"
            style={{ background: `linear-gradient(to top, ${barColor}, ${barColor}88)`, height: 0, boxShadow: '2px 2px 5px rgba(163, 177, 198, 0.4)' }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-[9px] text-muted whitespace-nowrap">{item.label}</span>
        </div>
      ))}
    </div>
  );
});

export const ProgressRing = React.memo(function ProgressRing({ percent = 0, size = 80, strokeWidth = 6, color = 'var(--accent-orange)', label = '' }) {
  const circleRef = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!circleRef.current) return;
    const targetOffset = circumference * (1 - percent / 100);
    if (getSpeedMultiplier() === 0 || isReducedMotion()) {
      circleRef.current.style.strokeDashoffset = `${targetOffset}px`;
    } else {
      const dur = getMotionDuration(0.65);
      gsap.to(circleRef.current, {
        strokeDashoffset: targetOffset,
        duration: dur,
        ease: 'power2.out',
      });
    }
  }, [percent, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(163, 177, 198, 0.3)" strokeWidth={strokeWidth} />
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference}
          style={{ filter: `drop-shadow(2px 2px 4px rgba(163, 177, 198, 0.5))` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold text-main">{percent}%</span>
        {label && <span className="text-[9px] text-muted">{label}</span>}
      </div>
    </div>
  );
});

export const AnimatedCounter = React.memo(function AnimatedCounter({ value = 0, suffix = '', className = '' }) {
  const ref = useRef(null);
  const prevVal = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    if (getSpeedMultiplier() === 0 || isReducedMotion()) {
      ref.current.textContent = Math.round(value) + suffix;
      prevVal.current = value;
      return;
    }
    const obj = { val: prevVal.current };
    const dur = getMotionDuration(0.6);
    gsap.to(obj, {
      val: value,
      duration: dur,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val) + suffix;
      },
    });
    prevVal.current = value;
  }, [value, suffix]);

  return <span ref={ref} className={className}>{value}{suffix}</span>;
});

export const MiniLineChart = React.memo(function MiniLineChart({ data = [], width = 200, height = 50, color = 'var(--accent-orange)' }) {
  const pathRef = useRef(null);
  const maxVal = Math.max(...data, 1);
  const step = width / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => `${i * step},${height - (v / maxVal) * (height - 8)}`).join(' ');

  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    if (getSpeedMultiplier() === 0 || isReducedMotion()) {
      gsap.set(pathRef.current, { strokeDashoffset: 0 });
    } else {
      const dur = getMotionDuration(0.7);
      gsap.fromTo(pathRef.current, { strokeDashoffset: length }, { strokeDashoffset: 0, duration: dur, ease: 'power2.out' });
    }
  }, [data]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`line-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        ref={pathRef}
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={width * 3}
        style={{ filter: `drop-shadow(2px 2px 4px rgba(163, 177, 198, 0.4))` }}
      />
    </svg>
  );
});
