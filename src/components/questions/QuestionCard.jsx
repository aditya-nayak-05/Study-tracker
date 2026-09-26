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

  const isCompleted = Boolean(question.completed);
  const btnClasses = "inset-field h-[38px] px-3.5 rounded-[9px] text-[13px] font-semibold flex items-center gap-2 w-full justify-start cursor-pointer border border-transparent hover:border-[var(--neu-border-subtle)] transition-colors";

  return (
    <div
      className={`w-full p-5 sm:p-7 rounded-2xl border transition-all duration-300 relative bg-[var(--neu-card-bg)] ${
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

      {/* 3 dot menu absolute top right */}
      <div className="absolute top-5 right-5 z-20" ref={menuRef}>
        <button 
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-1.5 text-muted hover:text-main rounded-md hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--neu-card-bg)] border border-[var(--neu-border)] shadow-lg rounded-xl overflow-hidden py-1">
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

      <div className="flex flex-col md:flex-row md:items-start justify-between pr-8 md:pr-0 w-full gap-4 md:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="text-sm font-mono text-muted flex items-center gap-2">
            {isCompleted && <span className="text-emerald-500">✓</span>}
            {String(index + 1).padStart(2, '0')}
            {question.important && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
          </div>
          
          <h3 
            className="text-[16px] sm:text-[18px] font-semibold leading-[1.5] text-main"
          >
            {renderHighlighted(question.text)}
          </h3>
        </div>

        {/* RIGHT COLUMN */}
        <div className="mt-5 md:mt-0 md:w-[220px] md:shrink-0 flex flex-col gap-2.5 md:border-l md:border-[var(--neu-border-subtle)] md:pl-5 md:ml-4">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className={btnClasses}
          >
            {expanded ? 'Hide Answer' : 'Show Answer'}
          </button>
          
          <button 
            onClick={() => setShowNotes(!showNotes)} 
            className={btnClasses}
          >
            + Add Note
          </button>
          
          <button 
            onClick={() => onToggleComplete(setId, question.id, !isCompleted)}
            className={btnClasses}
          >
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
              isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--neu-border-subtle)]'
            }`}>
              {isCompleted && <Check className="w-3 h-3 text-white stroke-[3]" />}
            </div>
            {isCompleted ? 'Completed' : 'Complete'}
          </button>
        </div>
        
      </div>

      {/* ANSWER SECTION */}
      {expanded && (
        <div className="mt-5 pt-5 border-t border-[var(--neu-border-subtle)] animate-in fade-in duration-300">
          {!isEditingAnswer && localAnswer ? (
            <div className="group relative">
              <div className="text-[15px] sm:text-base leading-[1.6] text-main/90 whitespace-pre-wrap">
                {localAnswer}
              </div>
              <button 
                onClick={() => setIsEditingAnswer(true)}
                className="mt-3 text-sm text-muted hover:text-main underline decoration-muted/30 underline-offset-4 cursor-pointer"
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
                className="w-full p-4 text-[15px] sm:text-base rounded-xl focus:outline-none inset-field text-main leading-[1.6] resize-y bg-transparent"
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
                  className="leather-btn text-sm px-4 py-2 rounded-lg cursor-pointer font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NOTES SECTION */}
      {showNotes && (
        <div className="mt-5 pt-5 border-t border-[var(--neu-border-subtle)] animate-in fade-in duration-300">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Study Note</label>
          <div className="space-y-3">
            <textarea
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder="Add your study notes, memory tricks, or references here..."
              className="w-full p-4 text-[14px] sm:text-[15px] rounded-xl focus:outline-none inset-field text-main leading-[1.6] resize-y bg-transparent"
              style={{
                background: 'var(--neu-inset-bg)',
                border: '1px solid var(--neu-border-subtle)',
              }}
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
                className="leather-btn text-sm px-4 py-2 rounded-lg cursor-pointer font-semibold"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
