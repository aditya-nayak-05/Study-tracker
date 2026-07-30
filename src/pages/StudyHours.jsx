import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import PomodoroTimer from '../components/PomodoroTimer';
import { formatDate } from '../utils/helpers';
import { Clock, Plus, Trash2, BookOpen, Calendar } from 'lucide-react';

export default function StudyHours() {
  const { state, dispatch, showToast } = useStudy();
  const containerRef = useRef(null);

  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    minutes: 0,
    notes: '',
    planId: state.ui.activePlanId || '',
  });

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.sh-card');
      gsap.fromTo(cards, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  const handleLog = useCallback((e) => {
    e.preventDefault();
    if (logForm.hours === 0 && logForm.minutes === 0) {
      showToast('Enter study time', 'warning');
      return;
    }
    dispatch({ type: 'LOG_STUDY_HOURS', payload: logForm });
    dispatch({ type: 'ADD_GLOBAL_ACTIVITY', payload: { type: 'study', message: `Logged ${logForm.hours}h ${logForm.minutes}m` } });
    showToast('Study hours logged! 📚', 'success');
    setLogForm((f) => ({ ...f, hours: 0, minutes: 0, notes: '' }));
  }, [logForm, dispatch, showToast]);

  const history = useMemo(() => {
    return [...state.globalStudyHours].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [state.globalStudyHours]);

  return (
    <DashboardLayout title="Study Hours" subtitle="Log and track your study sessions">
      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="sh-card bg-[var(--neu-card-bg)] border border-[var(--neu-border)] rounded-2xl p-6 flex flex-col items-center" style={{ boxShadow: 'var(--neu-shadow-raised)' }}>
          <h3 className="text-sm font-semibold text-main mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-primary" /> Timer
          </h3>
          <PomodoroTimer />
        </div>

        {/* Manual Logger */}
        <div className="sh-card bg-[var(--neu-card-bg)] border border-[var(--neu-border)] rounded-2xl p-6" style={{ boxShadow: 'var(--neu-shadow-raised)' }}>
          <h3 className="text-sm font-bold text-main mb-5 flex items-center justify-center gap-2 text-center uppercase tracking-wider">
            <Plus className="w-4 h-4 text-accent-primary" /> Log Study Hours
          </h3>
          <form onSubmit={handleLog} className="space-y-4">
            <div className="flex flex-col items-center justify-center text-center">
              <label className="text-[10px] text-muted block mb-1.5 font-bold text-center uppercase tracking-wider">Date</label>
              <div className="relative w-full max-w-sm mx-auto flex items-center justify-center">
                <div
                  className="w-full px-4 py-2.5 rounded-full text-xs font-bold inset-field text-main flex items-center justify-between cursor-pointer transition-all hover:border-[var(--accent-orange)]"
                  style={{
                    background: 'var(--neu-card-bg)',
                    boxShadow: 'var(--neu-shadow-inset)',
                    border: '1.5px solid var(--neu-border)',
                    color: 'var(--neu-text-main)',
                  }}
                >
                  <span className="w-4 h-4 opacity-0"></span>
                  <span className="text-center font-bold tracking-wider text-main text-xs">
                    {logForm.date ? formatDate(logForm.date, 'dd-MM-yyyy') : 'Select Date'}
                  </span>
                  <Calendar className="w-4 h-4 text-accent-primary shrink-0 opacity-90" />
                </div>
                <input
                  type="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 text-center"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted block mb-1.5 font-bold text-center uppercase tracking-wider">Hours</label>
                <input type="number" min={0} max={24} value={logForm.hours} onChange={(e) => setLogForm({ ...logForm, hours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none text-center font-bold inset-field text-main" style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)', border: '1px solid var(--neu-border)', color: 'var(--neu-text-main)' }} />
              </div>
              <div>
                <label className="text-[10px] text-muted block mb-1.5 font-bold text-center uppercase tracking-wider">Minutes</label>
                <input type="number" min={0} max={59} value={logForm.minutes} onChange={(e) => setLogForm({ ...logForm, minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none text-center font-bold inset-field text-main" style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)', border: '1px solid var(--neu-border)', color: 'var(--neu-text-main)' }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted block mb-1.5 font-bold text-center uppercase tracking-wider">Plan (optional)</label>
              <select value={logForm.planId} onChange={(e) => setLogForm({ ...logForm, planId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none text-center font-bold inset-field text-main" style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)', border: '1px solid var(--neu-border)', color: 'var(--neu-text-main)' }}>
                <option value="">No plan</option>
                {state.plans.filter((p) => !p.archived).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted block mb-1.5 font-bold text-center uppercase tracking-wider">Notes</label>
              <input type="text" value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} placeholder="What did you study?"
                className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none text-center font-bold inset-field text-main placeholder-[var(--neu-text-muted)]" style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)', border: '1px solid var(--neu-border)', color: 'var(--neu-text-main)' }} />
            </div>
            <button type="submit" className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer brass-btn active:scale-[0.98] text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_var(--accent-orange)] overflow-hidden relative group" style={{ background: 'var(--accent-btn-bg)', color: 'var(--accent-btn-text)', border: '1px solid var(--neu-border)' }}>
              <Plus className="w-4 h-4 text-current transition-transform duration-300 group-hover:rotate-90" />
              <span>Log Hours</span>
            </button>
          </form>
        </div>

        {/* History */}
        <div className="sh-card bg-[var(--neu-card-bg)] border border-[var(--neu-border)] rounded-2xl p-6" style={{ boxShadow: 'var(--neu-shadow-raised)' }}>
          <h3 className="text-sm font-semibold text-main mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-primary" /> Study History
          </h3>
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
            {history.length === 0 ? (
              <p className="text-muted text-sm text-center py-8">No study sessions yet</p>
            ) : (
              history.map((entry) => {
                const plan = state.plans.find((p) => p.id === entry.planId);
                return (
                  <div key={entry.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all group" style={{ background: 'var(--neu-card-bg)', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--neu-card-bg)', boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.9)' }}>
                      <Clock className="w-4 h-4 text-accent-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-main font-semibold">{entry.hours}h {entry.minutes}m</p>
                      <p className="text-[10px] text-muted truncate">
                        {formatDate(entry.date, 'MMM dd, yyyy')}
                        {plan && ` · ${plan.name}`}
                        {entry.notes && ` · ${entry.notes}`}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
