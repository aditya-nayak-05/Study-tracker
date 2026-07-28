import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../components/EmptyState';
import {
  Plus, Search, Pin, PinOff, Copy, Trash2, Archive, MoreHorizontal,
  BookOpen, X,
} from 'lucide-react';
import { calculateProgress, getAllTasksInPlan, formatDate } from '../utils/helpers';

const PLAN_COLORS = ['#38a169', '#319795', '#3182ce', '#6366f1', '#8b5cf6', '#d69e2e', 'var(--accent-orange)', '#e53e3e', '#d53f8c'];

const cardStyle = {
  background: '#e6ebf2',
  border: '1px solid rgba(255, 255, 255, 0.7)',
  borderRadius: '1.25rem',
  boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.6), -6px -6px 14px rgba(255, 255, 255, 0.85)',
  color: '#1a202c',
};

const inputStyle = {
  background: '#e6ebf2',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  color: '#1a202c',
  borderRadius: '0.75rem',
  boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.9)',
};

export default function Plans() {
  const { state, dispatch, showToast } = useStudy();
  const navigate = useNavigate();
  const cardsRef = useRef(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [newPlan, setNewPlan] = useState({ name: '', description: '', category: 'general', color: 'var(--accent-orange)' });

  const filteredPlans = (state.plans || [])
    .filter((p) => !p.archived)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.plan-card');
      if (cards.length > 0) {
        gsap.fromTo(cards, { y: 25, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' });
      }
    }
  }, [filteredPlans.length]);

  const handleCreate = useCallback((e) => {
    e.preventDefault();
    if (!newPlan.name.trim()) return;
    dispatch({ type: 'ADD_PLAN', payload: newPlan });
    dispatch({ type: 'ADD_GLOBAL_ACTIVITY', payload: { type: 'create', message: `Created plan "${newPlan.name}"` } });
    showToast(`Plan "${newPlan.name}" created`, 'success');
    setNewPlan({ name: '', description: '', category: 'general', color: 'var(--accent-orange)' });
    setShowCreate(false);
  }, [newPlan, dispatch, showToast]);

  const handleAction = useCallback((action, plan) => {
    setMenuOpen(null);
    switch (action) {
      case 'pin':
        dispatch({ type: 'UPDATE_PLAN', payload: { id: plan.id, updates: { pinned: !plan.pinned } } });
        showToast(plan.pinned ? 'Unpinned' : 'Pinned', 'info');
        break;
      case 'duplicate':
        dispatch({ type: 'DUPLICATE_PLAN', payload: plan.id });
        showToast(`"${plan.name}" duplicated`, 'success');
        break;
      case 'archive':
        dispatch({ type: 'UPDATE_PLAN', payload: { id: plan.id, updates: { archived: true } } });
        showToast(`"${plan.name}" archived`, 'info');
        break;
      case 'delete':
        dispatch({ type: 'DELETE_PLAN', payload: plan.id });
        dispatch({ type: 'ADD_GLOBAL_ACTIVITY', payload: { type: 'delete', message: `Deleted plan "${plan.name}"` } });
        showToast(`"${plan.name}" deleted`, 'error');
        break;
    }
  }, [dispatch, showToast]);

  const openPlan = useCallback((plan) => {
    dispatch({ type: 'SET_UI', payload: { activePlanId: plan.id } });
    navigate(`/plans/${plan.id}`);
  }, [dispatch, navigate]);

  return (
    <DashboardLayout title="Study Plans" subtitle="Manage your study roadmaps">
      {/* Header Actions */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#718096' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plans..."
            className="w-full pl-10 pr-4 py-3 text-sm focus:outline-none"
            style={{ ...inputStyle }}
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="brass-btn flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all active:scale-[0.97] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Create Plan Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(26,32,44,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowCreate(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
            className="rounded-2xl p-6 w-full max-w-md space-y-4"
            style={{ ...cardStyle, boxShadow: '10px 10px 25px rgba(163,177,198,0.7), -10px -10px 25px rgba(255,255,255,0.9)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-main">Create New Plan</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="cursor-pointer" style={{ color: '#718096' }}><X className="w-5 h-5" /></button>
            </div>
            <input type="text" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="Plan name" required className="w-full px-4 py-2.5 text-sm focus:outline-none" style={{ ...inputStyle }} />
            <textarea value={newPlan.description} onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 text-sm focus:outline-none resize-none" style={{ ...inputStyle }} />
            <div>
              <label className="text-xs mb-2 block" style={{ color: '#718096' }}>Color</label>
              <div className="flex gap-2">
                {PLAN_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setNewPlan({ ...newPlan, color: c })} className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${newPlan.color === c ? 'ring-2 ring-[#ed8936] scale-110' : 'hover:scale-110'}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <button type="submit" className="brass-btn w-full py-2.5 text-sm font-semibold cursor-pointer">Create Plan</button>
          </form>
        </div>
      )}

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <EmptyState title="No Plans Yet" description="Create your first study plan to get started" actionLabel="Create Plan" onAction={() => setShowCreate(true)} icon={BookOpen} />
      ) : (
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const tasks = getAllTasksInPlan(plan);
            const completed = tasks.filter((t) => t.status === 'completed').length;
            const progress = calculateProgress(completed, tasks.length);
            return (
              <div
                key={plan.id}
                className="plan-card p-6 hover:brightness-105 transition-all group cursor-pointer relative"
                style={cardStyle}
                onClick={() => openPlan(plan)}
              >
                {plan.pinned && <Pin className="absolute top-3 right-3 w-3.5 h-3.5" style={{ color: 'var(--accent-orange)' }} />}

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: plan.color, boxShadow: `0 0 8px ${plan.color}60` }} />
                  <h3 className="text-base font-semibold text-main truncate">{plan.name}</h3>
                </div>

                {plan.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: '#718096' }}>{plan.description}</p>}

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#e6ebf2', boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.8)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: plan.color || 'var(--accent-orange)' }} />
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: '#718096' }}>{progress}%</span>
                </div>

                <div className="flex items-center gap-4 text-[11px]" style={{ color: '#718096' }}>
                  <span>{tasks.length} tasks</span>
                  <span>{plan.months?.length || 0} months</span>
                  <span>{formatDate(plan.createdAt, 'MMM dd')}</span>
                </div>

                <button
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  style={{ background: '#e6ebf2', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.8)' }}
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === plan.id ? null : plan.id); }}
                >
                  <MoreHorizontal className="w-4 h-4" style={{ color: '#718096' }} />
                </button>

                {menuOpen === plan.id && (
                  <div className="absolute top-10 right-3 rounded-xl py-1 w-40 z-50 shadow-xl" style={{ background: '#e6ebf2', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '6px 6px 15px rgba(163,177,198,0.6), -6px -6px 15px rgba(255,255,255,0.85)' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleAction('pin', plan)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#dce3ed] cursor-pointer" style={{ color: '#2d3748' }}>
                      {plan.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      {plan.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => handleAction('duplicate', plan)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#dce3ed] cursor-pointer" style={{ color: '#2d3748' }}>
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button onClick={() => handleAction('archive', plan)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#dce3ed] cursor-pointer" style={{ color: '#2d3748' }}>
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </button>
                    <button onClick={() => handleAction('delete', plan)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#dce3ed] cursor-pointer" style={{ color: '#e53e3e' }}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
