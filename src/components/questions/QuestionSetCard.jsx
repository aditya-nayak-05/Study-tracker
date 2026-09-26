import React, { useState, useRef, useEffect } from 'react';
import {
  Pin, PinOff, MoreVertical, Play, Edit2, Copy, Download, Trash2,
  CheckCircle, Circle, FileText, ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from '../../utils/helpers';

export default function QuestionSetCard({
  set,
  onOpenSet,
  onContinuePractice,
  onPin,
  onEdit,
  onDuplicate,
  onExportJSON,
  onExportCSV,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const questions = set.questions || [];
  const total = questions.length;
  const completed = questions.filter((q) => q.completed).length;
  const remaining = total - completed;
  const answered = questions.filter((q) => q.answer && q.answer.trim()).length;
  const unanswered = total - answered;
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const answerPercent = total > 0 ? Math.round((answered / total) * 100) : 0;

  // Format last practiced / updated
  const lastTime = set.lastOpenedAt || set.updatedAt || set.createdAt;
  const formattedTime = lastTime ? formatDistanceToNow(lastTime) : 'Never';

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between plan-card dash-card"
      style={{
        background: 'var(--neu-card-bg)',
        border: set.pinned ? '1.5px solid var(--accent-orange)' : '1px solid var(--neu-border)',
        boxShadow: set.pinned
          ? '0 0 16px rgba(237, 137, 54, 0.15), var(--neu-shadow-raised)'
          : 'var(--neu-shadow-raised)',
      }}
    >
      <div>
        {/* Top bar: Pin, Subject & 3-Dot Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {set.pinned && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                <Pin className="w-3 h-3 fill-amber-400" />
                <span>Pinned</span>
              </span>
            )}
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border truncate"
              style={{
                background: `${set.color || '#6366f1'}15`,
                color: set.color || '#6366f1',
                borderColor: `${set.color || '#6366f1'}30`,
              }}
            >
              {set.subject || 'General'}
            </span>
          </div>

          <div className="flex items-center gap-1 relative" ref={menuRef}>
            {/* Quick Pin toggle button */}
            <button
              type="button"
              onClick={() => onPin(set.id)}
              title={set.pinned ? 'Unpin Set' : 'Pin Set'}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                set.pinned
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-muted hover:text-amber-400 hover:bg-[var(--neu-hover-bg)]'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${set.pinned ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Menu trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              title="More Actions"
              className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 w-44 rounded-xl p-1.5 shadow-2xl border text-xs font-semibold backdrop-blur-md"
                style={{
                  background: 'var(--neu-card-bg)',
                  borderColor: 'var(--neu-border)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(set);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-accent-primary" />
                  <span>Rename / Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(set.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer text-left"
                >
                  <Copy className="w-3.5 h-3.5 text-accent-primary" />
                  <span>Duplicate Set</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onPin(set.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer text-left"
                >
                  {set.pinned ? <PinOff className="w-3.5 h-3.5 text-amber-400" /> : <Pin className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{set.pinned ? 'Unpin Set' : 'Pin to Top'}</span>
                </button>

                <div className="my-1 border-t border-[var(--neu-border-subtle)]" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onExportJSON(set);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer text-left"
                >
                  <Download className="w-3.5 h-3.5 text-accent-primary" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onExportCSV(set);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-accent-primary" />
                  <span>Export CSV</span>
                </button>

                <div className="my-1 border-t border-[var(--neu-border-subtle)]" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(set.id, set.name, total);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Set</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Set Title & Description */}
        <div
          onClick={() => onOpenSet(set.id)}
          className="cursor-pointer group-hover:text-accent-primary transition-colors"
        >
          <h3 className="text-base sm:text-lg font-black text-main leading-snug tracking-tight line-clamp-1">
            {set.name}
          </h3>
          <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed min-h-[2rem]">
            {set.description || 'No description provided.'}
          </p>
        </div>

        {/* Progress Bar & Percent */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted uppercase tracking-wider text-[10px]">Completion</span>
            <span className="text-main font-mono">{completionPercent}%</span>
          </div>

          <div
            className="w-full h-2 rounded-full overflow-hidden neu-card"
            style={{
              background: 'var(--neu-inset-bg)',
              boxShadow: 'var(--neu-shadow-inset)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPercent}%`,
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
              }}
            />
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[var(--neu-border-subtle)] text-xs">
          <div className="flex items-center gap-1.5 text-main font-semibold">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{completed} Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted font-medium">
            <Circle className="w-3.5 h-3.5 text-muted shrink-0" />
            <span>{remaining} Remaining</span>
          </div>
          <div className="flex items-center gap-1.5 text-main font-semibold">
            <span className="text-blue-400 text-xs">📝</span>
            <span>{answered} Answered</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted font-medium">
            <span className="text-zinc-400 text-xs">○</span>
            <span>{unanswered} Unanswered</span>
          </div>
        </div>
      </div>

      {/* Footer: Last practiced + Buttons */}
      <div className="mt-5 pt-3.5 border-t border-[var(--neu-border-subtle)] flex items-center justify-between gap-3">
        <span className="text-[11px] text-muted italic truncate">
          Practiced {formattedTime}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenSet(set.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-all cursor-pointer"
          >
            Open
          </button>

          <button
            type="button"
            onClick={() => onContinuePractice(set.id)}
            className="brass-btn px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Play className="w-3 h-3 text-accent-primary" />
            <span>Practice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
