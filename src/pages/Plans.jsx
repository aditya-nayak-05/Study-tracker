import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../components/EmptyState';
import {
  Plus, Search, Pin, PinOff, Copy, Trash2, Archive, MoreHorizontal,
  BookOpen, X, Loader2,
} from 'lucide-react';
import { calculateProgress, getAllTasksInPlan, formatDate } from '../utils/helpers';
import { modalEnter, modalExit, softCollapse, planGenesis, softShake, getMotionDuration, getSpeedMultiplier, isReducedMotion } from '../utils/motion';

const PLAN_COLORS = ['#38a169', '#319795', '#3182ce', '#6366f1', '#8b5cf6', '#d69e2e', 'var(--accent-orange)', '#e53e3e', '#d53f8c'];

const cardStyle = {
  background: 'var(--neu-card-bg)',
  border: '1px solid var(--neu-border)',
  borderRadius: '1.25rem',
  boxShadow: 'var(--neu-shadow-raised)',
  color: 'var(--neu-text-main)',
};

const inputStyle = {
  background: 'var(--neu-card-bg)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  color: 'var(--neu-text-main)',
  borderRadius: '0.75rem',
  boxShadow: 'var(--neu-shadow-inset)',
};

export default function Plans() {
  const { state, dispatch, showToast } = useStudy();
  const navigate = useNavigate();
  const cardsRef = useRef(null);
  const cardElementRefs = useRef({});
  const modalBackdropRef = useRef(null);
  const modalBoxRef = useRef(null);
  const nameInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [newPlan, setNewPlan] = useState({ name: '', description: '', category: 'general', color: 'var(--accent-orange)' });
  const [lastCreatedId, setLastCreatedId] = useState(null);

  const filteredPlans = (state.plans || [])
    .filter((p) => !p.archived)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll('.plan-card');
    if (cards.length === 0) return;

    if (getSpeedMultiplier() === 0 || isReducedMotion()) {
      gsap.set(cards, { y: 0, opacity: 1, scale: 1, clearProps: 'all' });
      return;
    }

    const dur = getMotionDuration(0.35);
    const mult = getSpeedMultiplier();
    gsap.fromTo(
      cards,
      { y: 16, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: dur, stagger: 0.04 * mult, ease: 'power2.out', clearProps: 'transform,opacity' }
    );
  }, [filteredPlans.length]);

  // Handle modal animation
  useEffect(() => {
    if (showCreate && modalBackdropRef.current && modalBoxRef.current) {
      modalEnter(modalBackdropRef.current, modalBoxRef.current);
    }
  }, [showCreate]);

  // Handle newly created plan card genesis animation
  useEffect(() => {
    if (lastCreatedId && cardElementRefs.current[lastCreatedId]) {
      planGenesis(cardElementRefs.current[lastCreatedId]);
      setLastCreatedId(null);
    }
  }, [lastCreatedId]);

  const closeCreateModal = useCallback(() => {
    if (modalBackdropRef.current && modalBoxRef.current) {
      modalExit(modalBackdropRef.current, modalBoxRef.current, () => {
        setShowCreate(false);
        setIsCreating(false);
      });
    } else {
      setShowCreate(false);
      setIsCreating(false);
    }
  }, []);

  const handleCreate = useCallback((e) => {
    e.preventDefault();
    if (!newPlan.name.trim()) {
      if (nameInputRef.current) softShake(nameInputRef.current);
      return;
    }
    setIsCreating(true);

    // Subtle 200ms loading feedback before genesis
    setTimeout(() => {
      const createdPlan = { ...newPlan, id: 'plan_' + Date.now() };
      dispatch({ type: 'ADD_PLAN', payload: createdPlan });
      dispatch({ type: 'ADD_GLOBAL_ACTIVITY', payload: { type: 'create', message: `Created plan "${newPlan.name}"` } });
      showToast(`Plan "${newPlan.name}" created`, 'success');
      setLastCreatedId(createdPlan.id);
      setNewPlan({ name: '', description: '', category: 'general', color: 'var(--accent-orange)' });
      closeCreateModal();
    }, 220);
  }, [newPlan, dispatch, showToast, closeCreateModal]);

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
      case 'delete': {
        const cardEl = cardElementRefs.current[plan.id];
        if (cardEl) {
          softCollapse(cardEl, () => {
            dispatch({ type: 'DELETE_PLAN', payload: plan.id });
            dispatch({ type: 'ADD_GLOBAL_ACTIVITY', payload: { type: 'delete', message: `Deleted plan "${plan.name}"` } });
            showToast(`"${plan.name}" deleted`, 'error');
          });
        } else {
          dispatch({ type: 'DELETE_PLAN', payload: plan.id });
          showToast(`"${plan.name}" deleted`, 'error');
        }
        break;
      }
    }
  }, [dispatch, showToast]);

  const openPlan = useCallback((plan) => {
    dispatch({ type: 'SET_UI', payload: { activePlanId: plan.id } });
    navigate(`/plans/${plan.id}`);
  }, [dispatch, navigate]);

  return (
    <DashboardLayout title="Study Plans" subtitle="Manage your study roadmaps">
      {/* Header Actions */}
      <div className="flex items-center gap-4 mb-8 max-w-2xl mx-auto w-full">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-primary pointer-events-none z-10" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plans..."
            className="w-full pl-10 pr-6 py-3 text-xs rounded-full focus:outline-none premium-search-input text-center font-bold tracking-wider"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="brass-btn flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all active:scale-[0.97] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {/* Create Plan Modal */}
      {showCreate && (
        <div
          ref={modalBackdropRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(26,32,44,0.5)' }}
          onClick={closeCreateModal}
        >
          <form
            ref={modalBoxRef}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
            className="rounded-2xl p-6 w-full max-w-md space-y-4"
            style={{ ...cardStyle, boxShadow: '10px 10px 25px rgba(163,177,198,0.7), -10px -10px 25px rgba(255,255,255,0.9)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-main">Create New Plan</h2>
              <button type="button" onClick={closeCreateModal} className="cursor-pointer text-muted hover:text-main transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              ref={nameInputRef}
              type="text"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              placeholder="Plan name"
              required
              className="w-full px-4 py-2.5 text-sm focus:outline-none"
              style={{ ...inputStyle }}
            />
            <textarea
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-4 py-2.5 text-sm focus:outline-none resize-none"
              style={{ ...inputStyle }}
            />
            <div>
              <label className="text-xs mb-2 block" style={{ color: 'var(--neu-text-muted)' }}>Color</label>
              <div className="flex gap-2">
                {PLAN_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewPlan({ ...newPlan, color: c })}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${newPlan.color === c ? 'ring-2 ring-[#ed8936] scale-110' : 'hover:scale-110'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="brass-btn w-full py-2.5 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-accent-primary" /> Creating Plan...
                </>
              ) : (
                'Create Plan'
              )}
            </button>
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
                ref={(el) => (cardElementRefs.current[plan.id] = el)}
                className="plan-card p-6 transition-all group cursor-pointer relative card-motion"
                style={cardStyle}
                onClick={() => openPlan(plan)}
              >
                {plan.pinned && <Pin className="absolute top-3 right-3 w-3.5 h-3.5 text-accent-primary" />}

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125" style={{ background: plan.color, boxShadow: `0 0 8px ${plan.color}60` }} />
                  <h3 className="text-base font-semibold text-main truncate">{plan.name}</h3>
                </div>

                {plan.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--neu-text-muted)' }}>{plan.description}</p>}

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--neu-card-bg)', boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.8)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: plan.color || 'var(--accent-orange)' }} />
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--neu-text-muted)' }}>{progress}%</span>
                </div>

                <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--neu-text-muted)' }}>
                  <span>{tasks.length} tasks</span>
                  <span>{plan.months?.length || 0} months</span>
                  <span>{formatDate(plan.createdAt, 'MMM dd')}</span>
                </div>

                <button
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)', boxShadow: '3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.8)' }}
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === plan.id ? null : plan.id); }}
                >
                  <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--neu-text-muted)' }} />
                </button>

                {menuOpen === plan.id && (
                  <div className="absolute top-10 right-3 rounded-xl py-1 w-40 z-50 shadow-xl dropdown-motion" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border-subtle)' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleAction('pin', plan)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--neu-hover-bg)] cursor-pointer transition-colors" style={{ color: 'var(--neu-text-main)' }}>
                      {plan.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      {plan.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => handleAction('duplicate', plan)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--neu-hover-bg)] cursor-pointer transition-colors" style={{ color: 'var(--neu-text-main)' }}>
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button onClick={() => handleAction('archive', plan)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--neu-hover-bg)] cursor-pointer transition-colors" style={{ color: 'var(--neu-text-main)' }}>
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </button>
                    <button onClick={() => handleAction('delete', plan)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--neu-hover-bg)] cursor-pointer transition-colors" style={{ color: '#e53e3e' }}>
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
