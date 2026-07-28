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
      <div ref={contentRef} className="rounded-2xl w-full max-w-xl overflow-hidden leather-card" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)', boxShadow: '10px 10px 24px rgba(163, 177, 198, 0.65), -10px -10px 24px rgba(255, 255, 255, 0.9)' }} onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[var(--neu-border-subtle)] bg-[var(--neu-card-bg)]">
          <Search className="w-4 h-4 text-accent-primary absolute left-7 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans, tasks, days..."
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-full focus:outline-none premium-search-input text-center font-bold tracking-wider"
          />
          <button onClick={onClose} className="absolute right-7 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors cursor-pointer z-10">
            <X className="w-4 h-4 text-accent-primary" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[40vh] overflow-y-auto p-2">
          {results.length === 0 && query.trim() && (
            <p className="text-center text-muted text-sm py-8 font-medium">No results found</p>
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
                <span className="text-sm text-main flex-1 truncate group-hover:text-accent-primary font-semibold">{item.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted bg-[var(--neu-card-bg)] border border-[var(--neu-border-subtle)] px-2 py-0.5 rounded font-semibold">{item.type}</span>
                <ArrowRight className="w-3.5 h-3.5 text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>

        {/* Shortcut hint */}
        <div className="px-5 py-3 border-t border-[var(--neu-border-subtle)] flex items-center gap-4 text-[11px] text-muted font-medium">
          <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--neu-card-bg)] border border-[var(--neu-border-subtle)]">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--neu-card-bg)] border border-[var(--neu-border-subtle)]">↵</kbd> Open</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--neu-card-bg)] border border-[var(--neu-border-subtle)]">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
