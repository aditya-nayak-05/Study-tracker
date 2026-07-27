import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { Search, X, BookOpen, Calendar, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ onClose }) {
  const { state, dispatch } = useStudy();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(contentRef.current, { y: -20, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
    inputRef.current?.focus();

    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items = [];

    state.plans.forEach((plan) => {
      if (plan.name.toLowerCase().includes(q)) {
        items.push({ type: 'plan', label: plan.name, planId: plan.id, icon: BookOpen });
      }
      if (plan.months) {
        plan.months.forEach((month) => {
          if (month.name.toLowerCase().includes(q)) {
            items.push({ type: 'month', label: `${month.name} — ${plan.name}`, planId: plan.id, icon: Calendar });
          }
          if (month.weeks) {
            month.weeks.forEach((week) => {
              if (week.name.toLowerCase().includes(q)) {
                items.push({ type: 'week', label: `${week.name} — ${month.name}`, planId: plan.id, icon: Calendar });
              }
              if (week.days) {
                week.days.forEach((day) => {
                  if (day.name.toLowerCase().includes(q)) {
                    items.push({ type: 'day', label: `${day.name} — ${week.name}`, planId: plan.id, icon: Calendar });
                  }
                  if (day.tasks) {
                    day.tasks.forEach((task) => {
                      if (task.title.toLowerCase().includes(q)) {
                        items.push({ type: 'task', label: `${task.title} — ${day.name}`, planId: plan.id, icon: CheckSquare });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return items.slice(0, 20);
  }, [query, state.plans]);

  const handleSelect = (item) => {
    dispatch({ type: 'SET_UI', payload: { activePlanId: item.planId } });
    navigate(`/plans/${item.planId}`);
    onClose();
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh] p-4 backdrop-blur-sm" style={{ background: 'rgba(26, 32, 44, 0.6)' }} onClick={onClose}>
      <div ref={contentRef} className="rounded-2xl w-full max-w-xl overflow-hidden leather-card" style={{ background: '#e6ebf2', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '10px 10px 24px rgba(163, 177, 198, 0.65), -10px -10px 24px rgba(255, 255, 255, 0.9)' }} onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div 
          className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(163,177,198,0.3)] bg-[#e6ebf2] inset-field"
          style={{ boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.9)' }}
        >
          <Search className="w-5 h-5 text-accent-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans, tasks, days..."
            className="flex-1 bg-transparent text-[#1a202c] placeholder-[#718096] focus:outline-none text-sm font-medium"
          />
          <button onClick={onClose} className="text-[#718096] hover:text-[#1a202c] transition-colors cursor-pointer">
            <X className="w-4 h-4 text-accent-primary" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[40vh] overflow-y-auto p-2">
          {results.length === 0 && query.trim() && (
            <p className="text-center text-[#718096] text-sm py-8 font-medium">No results found</p>
          )}
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#ebf0f7] transition-all text-left group cursor-pointer border border-transparent hover:border-[var(--accent-orange)]"
              >
                <Icon className="w-4 h-4 text-accent-primary shrink-0" />
                <span className="text-sm text-[#1a202c] flex-1 truncate group-hover:text-accent-primary font-semibold">{item.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#718096] bg-[#e6ebf2] border border-[rgba(163,177,198,0.3)] px-2 py-0.5 rounded font-semibold">{item.type}</span>
                <ArrowRight className="w-3.5 h-3.5 text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>

        {/* Shortcut hint */}
        <div className="px-5 py-3 border-t border-[rgba(163,177,198,0.3)] flex items-center gap-4 text-[11px] text-[#718096] font-medium">
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#e6ebf2] border border-[rgba(163,177,198,0.3)]">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#e6ebf2] border border-[rgba(163,177,198,0.3)]">↵</kbd> Open</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#e6ebf2] border border-[rgba(163,177,198,0.3)]">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
