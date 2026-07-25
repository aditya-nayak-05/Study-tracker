import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import PomodoroTimer from '../components/PomodoroTimer';
import { formatDate } from '../utils/helpers';
import { Clock, Plus, Trash2, BookOpen } from 'lucide-react';

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
        {/* Pomodoro */}
        <div className="sh-card bg-[#191922] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 flex flex-col items-center" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <h3 className="text-sm font-semibold text-[#f2d894] mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d8a442]" /> Pomodoro Timer
          </h3>
          <PomodoroTimer />
        </div>

        {/* Manual Logger */}
        <div className="sh-card bg-[#191922] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <h3 className="text-sm font-semibold text-[#f2d894] mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#d8a442]" /> Log Study Hours
          </h3>
          <form onSubmit={handleLog} className="space-y-4">
            <div>
              <label className="text-xs text-[#94a3b8] block mb-1.5">Date</label>
              <input type="date" value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none" style={{ background: '#191922', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f7' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#94a3b8] block mb-1.5">Hours</label>
                <input type="number" min={0} max={24} value={logForm.hours} onChange={(e) => setLogForm({ ...logForm, hours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none" style={{ background: '#191922', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f7' }} />
              </div>
              <div>
                <label className="text-xs text-[#94a3b8] block mb-1.5">Minutes</label>
                <input type="number" min={0} max={59} value={logForm.minutes} onChange={(e) => setLogForm({ ...logForm, minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none" style={{ background: '#191922', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f7' }} />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#94a3b8] block mb-1.5">Plan (optional)</label>
              <select value={logForm.planId} onChange={(e) => setLogForm({ ...logForm, planId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none" style={{ background: '#191922', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f7' }}>
                <option value="">No plan</option>
                {state.plans.filter((p) => !p.archived).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#94a3b8] block mb-1.5">Notes</label>
              <input type="text" value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} placeholder="What did you study?"
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none placeholder-[#94a3b8]" style={{ background: '#191922', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f7' }} />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl text-[#f2d894] text-sm font-semibold transition-all cursor-pointer" style={{ background: 'linear-gradient(180deg, #d8a442, #d8a442)', border: '1px solid #d8a442', boxShadow: '0 2px 4px rgba(216,164,66,0.2)' }}>
              Log Hours
            </button>
          </form>
        </div>

        {/* History */}
        <div className="sh-card bg-[#191922] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <h3 className="text-sm font-semibold text-[#f2d894] mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#d8a442]" /> Study History
          </h3>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {history.length === 0 ? (
              <p className="text-[#94a3b8] text-sm text-center py-8">No study sessions yet</p>
            ) : (
              history.map((entry) => {
                const plan = state.plans.find((p) => p.id === entry.planId);
                return (
                  <div key={entry.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[rgba(212,168,67,0.15)] transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(216,164,66,0.1)] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#d8a442]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f5f5f7]">{entry.hours}h {entry.minutes}m</p>
                      <p className="text-[10px] text-[#94a3b8] truncate">
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
