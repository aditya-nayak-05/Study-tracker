import React, { useState, useRef, useEffect } from 'react';
import { X, Star, HelpCircle, Save } from 'lucide-react';
import { modalEnter, modalExit, softShake } from '../../utils/motion';

export default function QuestionModal({
  isOpen,
  initialQuestion = null, // null for create, object for edit
  onSave,
  onClose,
}) {
  const backdropRef = useRef(null);
  const boxRef = useRef(null);
  const textInputRef = useRef(null);

  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [important, setImportant] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  const isEdit = Boolean(initialQuestion);

  useEffect(() => {
    if (isOpen) {
      if (initialQuestion) {
        setText(initialQuestion.text || '');
        setAnswer(initialQuestion.answer || '');
        setNotes(initialQuestion.notes || '');
        setDifficulty(initialQuestion.difficulty || 'medium');
        setImportant(Boolean(initialQuestion.important));
        setTagsInput(Array.isArray(initialQuestion.tags) ? initialQuestion.tags.join(', ') : '');
      } else {
        setText('');
        setAnswer('');
        setNotes('');
        setDifficulty('medium');
        setImportant(false);
        setTagsInput('');
      }
      setError('');

      if (backdropRef.current && boxRef.current) {
        modalEnter(backdropRef.current, boxRef.current);
      }
      setTimeout(() => textInputRef.current?.focus(), 150);
    }
  }, [isOpen, initialQuestion]);

  const handleClose = () => {
    if (backdropRef.current && boxRef.current) {
      modalExit(backdropRef.current, boxRef.current, onClose);
    } else {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Question text cannot be empty.');
      if (textInputRef.current) softShake(textInputRef.current);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      text: text.trim(),
      answer: answer.trim(),
      notes: notes.trim(),
      difficulty,
      important,
      tags,
    });

    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm"
      style={{ background: 'rgba(13, 15, 23, 0.75)' }}
      onClick={handleClose}
    >
      <form
        ref={boxRef}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl p-5 sm:p-6 w-full max-w-xl leather-card shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--neu-card-bg)',
          border: '1px solid var(--neu-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--neu-border-subtle)]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent-primary" />
            <h2 className="text-base font-bold text-main">
              {isEdit ? 'Edit Question' : 'Add Single Question'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Question Text */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
            Question <span className="text-red-400">*</span>
          </label>
          <textarea
            ref={textInputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. What is the difference between synchronous and asynchronous code?"
            rows={3}
            className="w-full p-3 text-xs font-semibold rounded-xl focus:outline-none inset-field text-main resize-none"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
            }}
            required
          />
        </div>

        {/* Answer */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
            Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer or explanation here..."
            rows={4}
            className="w-full p-3 text-xs rounded-xl focus:outline-none inset-field text-main resize-none leading-relaxed"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
            }}
          />
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
            Study Notes & Tips (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key points, mnemonics, or tricky details to remember..."
            rows={2}
            className="w-full p-3 text-xs rounded-xl focus:outline-none inset-field text-main resize-none"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
            }}
          />
        </div>

        {/* Difficulty & Important & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Difficulty */}
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy', label: 'Easy', color: 'text-emerald-400 border-emerald-500/30' },
                { id: 'medium', label: 'Medium', color: 'text-blue-400 border-blue-500/30' },
                { id: 'hard', label: 'Hard', color: 'text-rose-400 border-rose-500/30' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    difficulty === d.id
                      ? 'brass-btn text-white'
                      : `inset-field text-muted hover:text-main`
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Important toggle */}
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
              Priority
            </label>
            <button
              type="button"
              onClick={() => setImportant((prev) => !prev)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                important
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'inset-field text-muted hover:text-main'
              }`}
            >
              <Star className={`w-4 h-4 ${important ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{important ? 'Marked Important ⭐' : 'Normal Priority'}</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. Scope, Closures, High-Frequency"
            className="w-full px-3.5 py-2 text-xs rounded-xl focus:outline-none inset-field text-main"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--neu-border-subtle)]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="brass-btn px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5 text-accent-primary" />
            <span>{isEdit ? 'Save Changes' : 'Add Question'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
