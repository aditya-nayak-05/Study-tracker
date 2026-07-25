import React, { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { getAllTasksInPlan, getCompletedCount } from '../utils/helpers';

const ProgressBar = React.memo(function ProgressBar() {
  const { activePlan } = useStudy();
  const barRef = useRef(null);
  const fillRef = useRef(null);
  const countRef = useRef(null);

  const { completed, total, percent } = useMemo(() => {
    if (!activePlan) return { completed: 0, total: 0, percent: 0 };
    const tasks = getAllTasksInPlan(activePlan);
    const c = tasks.filter((t) => t.status === 'completed').length;
    return { completed: c, total: tasks.length, percent: tasks.length ? Math.round((c / tasks.length) * 100) : 0 };
  }, [activePlan]);

  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(barRef.current, { y: 60 }, { y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, []);

  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, { width: `${percent}%`, duration: 0.8, ease: 'power2.out' });
    }
  }, [percent]);

  if (!activePlan) return null;

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 left-0 right-0 h-12 border-t border-[rgba(255,255,255,0.08)] flex items-center px-8 gap-5 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
      style={{background: '#18181f'}}
    >
      <span className="text-xs text-[#f5f5f7] font-medium truncate max-w-[200px]" style={{textShadow: 'none'}}>{activePlan.name}</span>
      <div className="flex-1 h-2 bg-[#191922] rounded-full overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-inner relative">
        <div
          ref={fillRef}
          className="h-full rounded-full"
          style={{ width: 0, background: '#d8a442' }}
        />
      </div>
      <span ref={countRef} className="text-xs text-[#d8a442] font-mono whitespace-nowrap" style={{textShadow: 'none'}}>
        {completed}/{total} ({percent}%)
      </span>
    </div>
  );
});

export default ProgressBar;
