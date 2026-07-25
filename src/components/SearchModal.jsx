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
    <div ref={modalRef} className="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh] p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div ref={contentRef} className="rounded-2xl w-full max-w-xl overflow-hidden" style={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#18181f] shadow-sm inset-field">
          <Search className="w-5 h-5 text-[#d8a442] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans, tasks, days..."
            className="flex-1 bg-transparent text-[#f5f5f7] placeholder-[#94a3b8] focus:outline-none text-sm"
          />
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#f5f5f7] transition-colors cursor-pointer">
            <X className="w-4 h-4 text-[#d8a442]" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[40vh] overflow-y-auto p-2">
          {results.length === 0 && query.trim() && (
            <p className="text-center text-[#94a3b8] text-sm py-8">No results found</p>
          )}
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#191922] transition-all text-left group cursor-pointer border border-transparent hover:border-[#d8a442] shadow-sm"
              >
                <Icon className="w-4 h-4 text-[#d8a442] shrink-0" />
                <span className="text-sm text-[#f5f5f7] flex-1 truncate group-hover:text-[#d8a442]">{item.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#94a3b8] bg-[#191922] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded">{item.type}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#d8a442] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>

        {/* Shortcut hint */}
        <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.08)] flex items-center gap-4 text-[11px] text-[#94a3b8]">
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#191922] border border-[rgba(255,255,255,0.08)]">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#191922] border border-[rgba(255,255,255,0.08)]">↵</kbd> Open</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#191922] border border-[rgba(255,255,255,0.08)]">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
