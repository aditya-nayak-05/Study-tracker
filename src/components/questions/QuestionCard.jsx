import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Check, Star, Edit3, Trash2, ChevronDown, ChevronUp,
  FileText, Play, CheckCircle2, Circle
} from 'lucide-react';
import { debounce } from '../../utils/helpers';

export default function QuestionCard({
  question,
  index,
  setId,
  searchQuery = '',
  isCompact = false,
  isSelected = false,
  onToggleSelect,
  onToggleComplete,
  onUpdateAnswer,
  onToggleImportant,
  onEdit,
  onDelete,
  onPractice,
}) {
  const [expanded, setExpanded] = useState(!isCompact);
  const [localAnswer, setLocalAnswer] = useState(question.answer || '');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [showNotes, setShowNotes] = useState(false);

  // Sync when question.answer changes externally (e.g. edit modal)
  useEffect(() => {
    setLocalAnswer(question.answer || '');
  }, [question.answer]);

  // Adjust expansion when global compact mode changes
  useEffect(() => {
    setExpanded(!isCompact);
  }, [isCompact]);

  // Safe debounced auto-save
  const debouncedSave = useCallback(
    debounce((newAnswer) => {
      onUpdateAnswer(setId, question.id, newAnswer);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600),
    [setId, question.id, onUpdateAnswer]
  );

  const handleAnswerChange = (e) => {
    const val = e.target.value;
    setLocalAnswer(val);
    setSaveStatus('saving');
    debouncedSave(val);
  };

  const handleBlur = () => {
    // Immediate save on blur to guarantee no data loss
    if (localAnswer !== question.answer) {
      onUpdateAnswer(setId, question.id, localAnswer);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }
  };

  // Highlight search matches
  const renderHighlighted = (text) => {
    if (!searchQuery.trim() || !text) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-amber-400/30 text-amber-200 px-0.5 rounded font-semibold"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const isCompleted = Boolean(question.completed);
  const isAnswered = Boolean(localAnswer && localAnswer.trim());

  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative group dash-card ${
        isSelected
          ? 'border-indigo-500/60 bg-indigo-500/5 shadow-md'
          : isCompleted
          ? 'border-[var(--neu-border-subtle)] bg-[var(--neu-card-bg)] opacity-95'
          : 'border-[var(--neu-border)] bg-[var(--neu-card-bg)]'
      }`}
      style={{
        boxShadow: isSelected
          ? '0 0 16px rgba(99, 102, 241, 0.25)'
          : 'var(--neu-shadow-raised)',
      }}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Checkbox + Number + Question */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Multi-select box (optional selection) */}
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(question.id)}
              title="Select for bulk actions"
              className="mt-1 w-3.5 h-3.5 rounded border-gray-500 accent-indigo-500 cursor-pointer opacity-40 group-hover:opacity-100 transition-opacity"
            />
          )}

          {/* Completion Checkbox */}
          <button
            type="button"
            onClick={() => onToggleComplete(setId, question.id, !isCompleted)}
            title={isCompleted ? 'Mark incomplete' : 'Mark completed / practiced'}
            className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              isCompleted
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm scale-100'
                : 'inset-field border-[var(--neu-border)] text-transparent hover:border-emerald-400/60 hover:text-emerald-400/40 hover:scale-105'
            }`}
          >
            <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform ${isCompleted ? 'scale-100' : 'scale-75'}`} />
          </button>

          {/* Question Text & Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-muted px-2 py-0.5 rounded inset-field">
                #{String(index + 1).padStart(2, '0')}
              </span>

              {/* Difficulty badge */}
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  difficultyColors[question.difficulty] || difficultyColors.medium
                }`}
              >
                {question.difficulty || 'medium'}
              </span>

              {/* Answer Status */}
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isAnswered
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-500/10 text-muted border border-zinc-500/20'
                }`}
              >
                {isAnswered ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Answered</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3 h-3 text-muted" />
                    <span>Unanswered</span>
                  </>
                )}
              </span>

              {/* Tags */}
              {Array.isArray(question.tags) &&
                question.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-medium text-muted bg-[var(--neu-hover-bg)] px-2 py-0.5 rounded-md border border-[var(--neu-border-subtle)]"
                  >
                    #{tag}
                  </span>
                ))}
            </div>

            {/* Question Text */}
            <h3
              onClick={() => setExpanded((prev) => !prev)}
              className={`text-base sm:text-[17px] leading-[1.55] font-bold cursor-pointer select-text transition-colors ${
                isCompleted ? 'text-main/80 line-through decoration-muted/50' : 'text-main hover:text-accent-primary'
              }`}
            >
              {renderHighlighted(question.text)}
            </h3>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {/* Important Star Toggle */}
          <button
            type="button"
            onClick={() => onToggleImportant(setId, question.id, !question.important)}
            title={question.important ? 'Remove from Important' : 'Mark as Important ⭐'}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              question.important
                ? 'text-amber-400 bg-amber-500/15'
                : 'text-muted hover:text-amber-400 hover:bg-[var(--neu-hover-bg)]'
            }`}
          >
            <Star className={`w-4 h-4 ${question.important ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Quick Practice this single question */}
          <button
            type="button"
            onClick={() => onPractice && onPractice(question.id)}
            title="Practice this question"
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
          </button>

          {/* Edit Question */}
          <button
            type="button"
            onClick={() => onEdit(question)}
            title="Edit Question details"
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Question */}
          <button
            type="button"
            onClick={() => onDelete(question.id, question.text)}
            title="Delete Question"
            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Expand / Collapse Answer Toggle */}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            title={expanded ? 'Collapse answer' : 'Expand answer'}
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer ml-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Answer Body */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-[var(--neu-border-subtle)] space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span>Your Answer</span>
                {saveStatus === 'saving' && (
                  <span className="text-[10px] text-amber-400 animate-pulse font-normal lowercase">saving...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-[10px] text-emerald-400 font-bold lowercase">Saved ✓</span>
                )}
              </label>

              {/* Character / Word count */}
              <div className="text-[11px] font-mono text-muted">
                {localAnswer.trim() ? `${localAnswer.trim().split(/\s+/).length} words` : 'Empty answer'}
              </div>
            </div>

            <textarea
              value={localAnswer}
              onChange={handleAnswerChange}
              onBlur={handleBlur}
              placeholder="Write or refine your answer here... (Auto-saves automatically)"
              rows={4}
              className="w-full p-4 text-sm sm:text-base rounded-xl focus:outline-none inset-field text-main leading-[1.6] resize-y font-normal"
              style={{
                background: 'var(--neu-inset-bg)',
                border: '1px solid var(--neu-border-subtle)',
              }}
            />
          </div>

          {/* Optional Notes Section */}
          <div>
            <button
              type="button"
              onClick={() => setShowNotes((prev) => !prev)}
              className="text-xs font-semibold text-muted hover:text-main flex items-center gap-1.5 cursor-pointer py-0.5"
            >
              <FileText className="w-3 h-3 text-accent-primary" />
              <span>{showNotes ? 'Hide Study Notes' : question.notes ? 'View Study Notes' : '+ Add Study Notes'}</span>
            </button>

            {showNotes && (
              <div
                className="mt-2 p-3 rounded-xl border border-[var(--neu-border-subtle)] text-xs text-muted leading-relaxed"
                style={{ background: 'var(--neu-card-bg)' }}
              >
                {question.notes ? (
                  <p className="italic text-main">{question.notes}</p>
                ) : (
                  <p className="text-[11px] text-muted italic">
                    No special notes added. Use Edit Question to add memory tricks or references.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
