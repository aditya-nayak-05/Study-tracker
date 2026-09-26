import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Check, Star, MoreVertical
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
  onUpdateQuestion,
  onToggleImportant,
  onEdit,
  onDelete,
  onPractice,
}) {
  const [expanded, setExpanded] = useState(!isCompact);
  const [localAnswer, setLocalAnswer] = useState(question.answer || '');
  const [saveStatus, setSaveStatus] = useState('idle'); 
  const [showNotes, setShowNotes] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(!question.answer);
  const [localNote, setLocalNote] = useState(question.notes || '');

  // Menu ref for clicking outside
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync when question.answer changes externally (e.g. edit modal)
  useEffect(() => {
    setLocalAnswer(question.answer || '');
    if (question.answer) setIsEditingAnswer(false);
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
    if (localAnswer !== question.answer) {
      onUpdateAnswer(setId, question.id, localAnswer);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }
  };

  // Highlight search matches
  const renderHighlighted = (text) => {
    if (!searchQuery.trim() || !text) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
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

  const isCompleted = Boolean(question.completed);

  return (
    <div
      className={`max-w-5xl mx-auto p-4 sm:p-5 md:p-6 lg:p-7 rounded-2xl border transition-all duration-300 relative bg-[var(--neu-card-bg)] ${
        isCompleted ? 'opacity-80 border-[var(--neu-border-subtle)]' : 'border-[var(--neu-border)]'
      }`}
    >
      {/* Selection Checkbox (if needed) */}
      {onToggleSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(question.id)}
            className="w-4 h-4 rounded border-gray-500 accent-indigo-500 cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      {/* Header: Number and Dropdown */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-mono text-muted flex items-center gap-2">
          {isCompleted && <span className="text-emerald-500">✓</span>}
          {String(index + 1).padStart(2, '0')}
          {question.important && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
        </div>
        
        {/* 3 dot menu */}
        <div className="relative" ref={menuRef}>
          <button 
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-1 text-muted hover:text-main rounded-md hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--neu-card-bg)] border border-[var(--neu-border)] shadow-lg rounded-xl overflow-hidden z-20 py-1">
              <button 
                onClick={() => { onToggleImportant(setId, question.id, !question.important); setIsMenuOpen(false); }} 
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--neu-hover-bg)] text-main cursor-pointer"
              >
                {question.important ? 'Unmark Important' : 'Mark Important'}
              </button>
              {onPractice && (
                <button 
                  onClick={() => { onPractice(question.id); setIsMenuOpen(false); }} 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--neu-hover-bg)] text-main cursor-pointer"
                >
                  Practice
                </button>
              )}
              <button 
                onClick={() => { onEdit(question); setIsMenuOpen(false); }} 
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--neu-hover-bg)] text-main cursor-pointer"
              >
                Edit Question
              </button>
              <button 
                onClick={() => { onDelete(question.id, question.text); setIsMenuOpen(false); }} 
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                Delete Question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Question Text */}
      <h3 
        onClick={() => setExpanded((prev) => !prev)}
        className="text-[17px] sm:text-[19px] font-semibold leading-relaxed text-main mb-6 cursor-pointer"
      >
        {renderHighlighted(question.text)}
      </h3>

      {/* Expanded Content (Answer & Notes) */}
      {expanded && (
        <div className="mb-6 space-y-6">
          {/* Answer Section */}
          <div>
            {!isEditingAnswer && localAnswer ? (
              <div className="group relative">
                <div className="text-[15px] sm:text-base leading-[1.6] text-main/90 whitespace-pre-wrap">
                  {localAnswer}
                </div>
                <button 
                  onClick={() => setIsEditingAnswer(true)}
                  className="mt-2 text-sm text-muted hover:text-main underline decoration-muted/30 underline-offset-4 cursor-pointer"
                >
                  Edit Answer
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={localAnswer}
                  onChange={handleAnswerChange}
                  onBlur={handleBlur}
                  placeholder="Write or refine your answer here..."
                  className="w-full p-4 text-[15px] sm:text-base rounded-xl focus:outline-none inset-field text-main leading-[1.6] resize-y"
                  style={{
                    background: 'var(--neu-inset-bg)',
                    border: '1px solid var(--neu-border-subtle)',
                  }}
                  rows={4}
                />
                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      handleBlur();
                      setIsEditingAnswer(false);
                    }} 
                    className="leather-btn text-sm px-4 py-1.5 rounded-lg cursor-pointer bg-[var(--neu-card-bg)] border border-[var(--neu-border-subtle)] hover:border-[var(--neu-border)] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {showNotes && (
        <div className="mb-6 space-y-3 p-4 rounded-xl bg-[var(--neu-hover-bg)] border border-[var(--neu-border-subtle)]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Study Note</label>
          <textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            placeholder="Add your study notes, memory tricks, or references here..."
            className="w-full p-3 text-[14px] sm:text-[15px] rounded-xl focus:outline-none inset-field text-main leading-[1.6] resize-y bg-transparent"
            rows={3}
          />
          <div className="flex justify-end">
            <button 
              onClick={() => {
                if (onUpdateQuestion) {
                  onUpdateQuestion(setId, question.id, { notes: localNote });
                }
                setShowNotes(false);
              }} 
              className="leather-btn text-sm px-4 py-1.5 rounded-lg cursor-pointer bg-[var(--neu-card-bg)] border border-[var(--neu-border-subtle)] hover:border-[var(--neu-border)] transition-colors"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Bottom Actions Row */}
      <div className="flex items-center gap-4 pt-4 border-t border-[var(--neu-border-subtle)]">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-sm font-medium text-main hover:text-accent-primary transition-colors cursor-pointer"
        >
          {expanded ? 'Hide Answer' : 'See Answer'}
        </button>
        <button 
          onClick={() => setShowNotes(!showNotes)} 
          className="text-sm font-medium text-main hover:text-accent-primary transition-colors cursor-pointer"
        >
          + Add Note
        </button>
        
        <div className="flex-1"></div>
        
        <button 
          onClick={() => onToggleComplete(setId, question.id, !isCompleted)}
          className={`text-sm flex items-center gap-2 font-medium transition-colors cursor-pointer ${
            isCompleted ? 'text-emerald-500' : 'text-muted hover:text-main'
          }`}
        >
          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
            isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-muted'
          }`}>
            {isCompleted && <Check className="w-3 h-3 text-white stroke-[3]" />}
          </div>
          {isCompleted ? 'Completed' : 'Complete'}
        </button>
      </div>

    </div>
  );
}
