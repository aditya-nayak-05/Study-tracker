import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const BarChart = React.memo(function BarChart({ data = [], maxHeight = 120, barColor = '#6366f1' }) {
  const barsRef = useRef([]);
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  useEffect(() => {
    barsRef.current.forEach((bar, i) => {
      if (bar) {
        const h = (data[i]?.value / maxVal) * maxHeight;
        gsap.fromTo(bar, { height: 0 }, { height: (data[i]?.value / maxVal) * maxHeight, duration: 0.6, delay: i * 0.05, ease: 'power2.out' });
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
            style={{ background: `linear-gradient(to top, ${barColor}, ${barColor}88)`, height: 0 }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-[9px] text-dark-400 whitespace-nowrap">{item.label}</span>
        </div>
      ))}
    </div>
  );
});

export const ProgressRing = React.memo(function ProgressRing({ percent = 0, size = 80, strokeWidth = 6, color = '#6366f1', label = '' }) {
  const circleRef = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        strokeDashoffset: circumference * (1 - percent / 100),
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, [percent, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference}
          style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold text-white">{percent}%</span>
        {label && <span className="text-[9px] text-dark-400">{label}</span>}
      </div>
    </div>
  );
});

export const AnimatedCounter = React.memo(function AnimatedCounter({ value = 0, suffix = '', className = '' }) {
  const ref = useRef(null);
  const prevVal = useRef(0);

  useEffect(() => {
    if (ref.current) {
      const obj = { val: prevVal.current };
      gsap.to(obj, {
        val: value,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) ref.current.textContent = Math.round(obj.val) + suffix;
        },
      });
      prevVal.current = value;
    }
  }, [value, suffix]);

  return <span ref={ref} className={className}>{value}{suffix}</span>;
});

export const MiniLineChart = React.memo(function MiniLineChart({ data = [], width = 200, height = 50, color = '#6366f1' }) {
  const pathRef = useRef(null);
  const maxVal = Math.max(...data, 1);
  const step = width / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => `${i * step},${height - (v / maxVal) * (height - 8)}`).join(' ');

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.fromTo(pathRef.current, { strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1, ease: 'power2.out' });
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
        style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}
      />
    </svg>
  );
});
