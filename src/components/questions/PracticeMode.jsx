import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Check, X, Eye, EyeOff, Shuffle, RotateCcw,
  Star, Edit3, CheckCircle2, Circle, Sparkles, BookOpen
} from 'lucide-react';

export default function PracticeMode({
  questionSets = [],
  activeSetId,
  initialQuestionId = null,
  onExit,
  onToggleComplete,
  onUpdateAnswer,
  onUpdateQuestionSet,
}) {
  const [selectedSetId, setSelectedSetId] = useState(activeSetId || (questionSets[0]?.id ?? ''));
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'uncompleted' | 'unanswered' | 'important'
  const [isRandom, setIsRandom] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState('');

  const currentSet = useMemo(() => {
    return questionSets.find((s) => s.id === selectedSetId) || questionSets[0] || null;
  }, [questionSets, selectedSetId]);

  // Filter questions based on filterMode
  const filteredQuestions = useMemo(() => {
    if (!currentSet || !currentSet.questions) return [];
    let list = [...currentSet.questions];

    if (filterMode === 'uncompleted') {
      list = list.filter((q) => !q.completed);
    } else if (filterMode === 'unanswered') {
      list = list.filter((q) => !q.answer || !q.answer.trim());
    } else if (filterMode === 'important') {
      list = list.filter((q) => q.important);
    }

    if (isRandom) {
      // Deterministic shuffle for this state
      list = [...list].sort(() => 0.5 - Math.random());
    }

    return list;
  }, [currentSet, filterMode, isRandom]);

  // Initialize or resume question index
  useEffect(() => {
    if (filteredQuestions.length === 0) {
      setCurrentIndex(0);
      return;
    }

    // Try finding initialQuestionId or lastPracticeQuestionId
    const targetId = initialQuestionId || currentSet?.lastPracticeQuestionId;
    if (targetId) {
      const idx = filteredQuestions.findIndex((q) => q.id === targetId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        return;
      }
    }

    if (currentIndex >= filteredQuestions.length) {
      setCurrentIndex(0);
    }
  }, [currentSet?.id, filterMode, isRandom]);

  const activeQuestion = filteredQuestions[currentIndex] || null;

  // Reset showAnswer & editing state on question change
  useEffect(() => {
    setShowAnswer(false);
    setIsEditingAnswer(false);
    setEditedAnswer(activeQuestion?.answer || '');

    // Persist last practiced question ID to question set
    if (activeQuestion && currentSet && onUpdateQuestionSet) {
      onUpdateQuestionSet(currentSet.id, {
        lastPracticeQuestionId: activeQuestion.id,
        lastOpenedAt: new Date().toISOString(),
      });
    }
  }, [activeQuestion?.id]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop around or finish
    }
  }, [currentIndex, filteredQuestions.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredQuestions.length - 1);
    }
  }, [currentIndex, filteredQuestions.length]);

  const handleToggleAnswer = useCallback(() => {
    setShowAnswer((prev) => !prev);
  }, []);

  const handleSaveAnswer = () => {
    if (!activeQuestion || !currentSet) return;
    onUpdateAnswer(currentSet.id, activeQuestion.id, editedAnswer);
    setIsEditingAnswer(false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in a textarea or input
      if (['TEXTAREA', 'INPUT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleToggleAnswer();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, handleToggleAnswer, onExit]);

  if (!currentSet) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted text-sm">No question set available for practice.</p>
        <button
          onClick={onExit}
          className="brass-btn px-4 py-2 rounded-xl text-[13px] font-bold"
        >
          Return to Questions
        </button>
      </div>
    );
  }

  const isCompleted = Boolean(activeQuestion?.completed);
  const totalInFilter = filteredQuestions.length;
  const progressPercent = totalInFilter > 0 ? Math.round(((currentIndex + 1) / totalInFilter) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Practice Bar: Exit, Set Selector, Mode Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-md">
        {/* Left: Exit button & Set Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer inset-field"
          >
            <ArrowLeft className="w-4 h-4 text-accent-primary" />
            <span>Exit Practice</span>
          </button>

          <select
            value={selectedSetId}
            onChange={(e) => {
              setSelectedSetId(e.target.value);
              setCurrentIndex(0);
            }}
            className="px-3 py-1.5 text-[13px] font-bold rounded-xl border border-[var(--neu-border-subtle)] bg-[var(--neu-card-bg)] text-main focus:outline-none cursor-pointer"
          >
            {questionSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.questions?.length || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Right: Filters & Random toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl inset-field bg-[var(--neu-inset-bg)]">
            {[
              { id: 'all', label: 'All' },
              { id: 'uncompleted', label: 'Uncompleted' },
              { id: 'unanswered', label: 'Unanswered' },
              { id: 'important', label: '⭐ Important' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilterMode(f.id);
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterMode === f.id
                    ? 'brass-btn text-white'
                    : 'text-muted hover:text-main'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Random Order Toggle */}
          <button
            type="button"
            onClick={() => setIsRandom((prev) => !prev)}
            title="Shuffle Questions"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
              isRandom
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'inset-field text-muted hover:text-main'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[13px] font-bold">
          <span className="text-muted uppercase tracking-wider text-xs">
            {currentSet.name}
          </span>
          <span className="font-mono text-main">
            {totalInFilter > 0 ? `Question ${currentIndex + 1} of ${totalInFilter}` : '0 of 0'}
          </span>
        </div>

        <div
          className="w-full h-[6px] rounded-full overflow-hidden neu-card"
          style={{
            background: 'var(--neu-inset-bg)',
            boxShadow: 'var(--neu-shadow-inset)',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)',
            }}
          />
        </div>
      </div>

      {/* Main Focus Practice Card */}
      {activeQuestion ? (
        <div
          className="p-7 sm:p-10 rounded-3xl border leather-card shadow-2xl relative space-y-8"
          style={{
            background: 'var(--neu-card-bg)',
            border: '1.5px solid var(--neu-border)',
            minHeight: '380px',
          }}
        >
          {/* Question Header & Meta */}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--neu-border-subtle)] pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono font-black text-muted px-2.5 py-1 rounded-lg inset-field">
                #{String(currentIndex + 1).padStart(2, '0')}
              </span>

              {activeQuestion.subject && (
                <span className="text-[11px] font-bold text-accent-primary uppercase tracking-wider">
                  {activeQuestion.subject}
                </span>
              )}

              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
                {activeQuestion.difficulty || 'medium'}
              </span>

              {activeQuestion.important && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>Important</span>
                </span>
              )}
            </div>

            {/* Quick Complete Status */}
            <button
              type="button"
              onClick={() => onToggleComplete(currentSet.id, activeQuestion.id, !isCompleted)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'inset-field text-muted hover:text-emerald-400'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isCompleted ? 'Completed ✓' : 'Mark Completed'}</span>
            </button>
          </div>

          {/* Big Prominent Question Text */}
          <div className="py-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-main leading-snug tracking-tight">
              {activeQuestion.text}
            </h2>
          </div>

          {/* Show Answer Toggle / Reveal Section */}
          <div className="pt-2">
            {!showAnswer ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <button
                  type="button"
                  onClick={handleToggleAnswer}
                  className="brass-btn px-7 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <Eye className="w-4 h-4 text-accent-primary" />
                  <span>Show Answer</span>
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/80 font-mono ml-2">
                    Space
                  </kbd>
                </button>
                <p className="text-xs text-muted">
                  Test your recall first before revealing the answer.
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6 rounded-2xl border border-[var(--neu-border-subtle)] bg-[var(--neu-inset-bg)] space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-[var(--neu-border-subtle)] pb-2">
                  <span className="text-[13px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
                    <span>Your Stored Answer</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAnswer((prev) => !prev)}
                      className="text-[13px] text-muted hover:text-main font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingAnswer ? 'Cancel Edit' : 'Edit Answer'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleAnswer}
                      className="text-[13px] text-muted hover:text-main font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </button>
                  </div>
                </div>

                {isEditingAnswer ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedAnswer}
                      onChange={(e) => setEditedAnswer(e.target.value)}
                      rows={5}
                      className="w-full p-3.5 text-sm sm:text-base rounded-xl focus:outline-none inset-field text-main leading-relaxed"
                      placeholder="Write your answer..."
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAnswer(false)}
                        className="px-3 py-1.5 text-[13px] rounded text-muted hover:text-main cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAnswer}
                        className="brass-btn px-4 py-1.5 text-[13px] font-bold text-white rounded cursor-pointer"
                      >
                        Save Answer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {activeQuestion.answer ? (
                      <p className="text-base sm:text-lg text-main leading-relaxed whitespace-pre-wrap font-normal">
                        {activeQuestion.answer}
                      </p>
                    ) : (
                      <p className="text-sm text-muted italic">
                        No answer stored yet for this question. Click "Edit Answer" above to add one.
                      </p>
                    )}

                    {activeQuestion.notes && (
                      <div className="mt-4 pt-3 border-t border-[var(--neu-border-subtle)] text-sm text-muted">
                        <span className="font-bold text-main">Notes: </span>
                        <span>{activeQuestion.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls: Previous / Next */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-[var(--neu-border-subtle)]">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold text-main hover:bg-[var(--neu-hover-bg)] inset-field transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-accent-primary" />
              <span>Previous</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted font-mono">
              <span>Use <kbd className="px-1.5 py-0.5 rounded border border-gray-600 bg-black/20">←</kbd> <kbd className="px-1.5 py-0.5 rounded border border-gray-600 bg-black/20">→</kbd> to navigate</span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="brass-btn flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold cursor-pointer active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 text-accent-primary" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] space-y-3">
          <BookOpen className="w-8 h-8 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-main">No questions match this practice filter.</h3>
          <p className="text-sm text-muted">
            Try switching the filter to "All" or choosing another Question Set.
          </p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="brass-btn px-4 py-2.5 rounded-xl text-[13px] font-bold mt-2 cursor-pointer"
          >
            Show All Questions
          </button>
        </div>
      )}
    </div>
  );
}
