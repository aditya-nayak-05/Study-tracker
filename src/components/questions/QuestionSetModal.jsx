import React, { useState, useRef, useEffect } from 'react';
import { X, FolderPlus, Edit3, Loader2 } from 'lucide-react';
import { modalEnter, modalExit, softShake } from '../../utils/motion';

const SET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ec4899', // Pink
  '#64748b', // Slate
];

const SUGGESTED_SUBJECTS = [
  'JavaScript',
  'React',
  'Full Stack',
  'Frontend',
  'DSA & Algorithms',
  'System Design',
  'Operating Systems',
  'DBMS & SQL',
  'Computer Networks',
  'Python',
  'Interview Prep',
  'Exam Questions',
];

export default function QuestionSetModal({
  isOpen,
  initialData = null, // null for create, object for edit
  existingSets = [],
  onSave,
  onClose,
}) {
  const backdropRef = useRef(null);
  const boxRef = useRef(null);
  const nameInputRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('JavaScript');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setSubject(initialData.subject || 'JavaScript');
        setColor(initialData.color || '#6366f1');
      } else {
        setName('');
        setDescription('');
        setSubject('JavaScript');
        setColor('#6366f1');
      }
      setError('');
      setIsSubmitting(false);

      if (backdropRef.current && boxRef.current) {
        modalEnter(backdropRef.current, boxRef.current);
      }
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    if (backdropRef.current && boxRef.current) {
      modalExit(backdropRef.current, boxRef.current, onClose);
    } else {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Question Set Name cannot be empty.');
      if (nameInputRef.current) softShake(nameInputRef.current);
      return;
    }

    // Check duplicate name (case-insensitive) excluding the set itself if editing
    const isDuplicate = existingSets.some(
      (s) =>
        s.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!isEdit || s.id !== initialData?.id)
    );

    if (isDuplicate) {
      setError('A Question Set with this name already exists.');
      if (nameInputRef.current) softShake(nameInputRef.current);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onSave({
        name: trimmedName,
        description: description.trim(),
        subject: subject.trim() || 'General',
        color,
      });
      handleClose();
    }, 180);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(13, 15, 23, 0.75)' }}
      onClick={handleClose}
    >
      <form
        ref={boxRef}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl p-6 w-full max-w-lg leather-card shadow-2xl space-y-4 relative"
        style={{
          background: 'var(--neu-card-bg)',
          border: '1px solid var(--neu-border)',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--neu-border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${color}20`, color }}
            >
              {isEdit ? <Edit3 className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-main">
                {isEdit ? 'Edit Question Set' : 'Create Question Set'}
              </h2>
              <p className="text-xs text-muted">
                {isEdit ? 'Update set details & metadata' : 'Create a new independent question collection'}
              </p>
            </div>
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
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Set Name */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
            Question Set Name <span className="text-red-400">*</span>
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. JavaScript Interview Questions"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl focus:outline-none inset-field font-semibold text-main"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
            }}
            required
          />
        </div>

        {/* Category / Subject */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
            Subject / Category
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Frontend, MCA Exam, DSA"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl focus:outline-none inset-field font-semibold text-main mb-2"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
            }}
          />
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pt-1">
            {SUGGESTED_SUBJECTS.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubject(sub)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  subject.toLowerCase() === sub.toLowerCase()
                    ? 'brass-btn text-white'
                    : 'inset-field text-muted hover:text-main'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
            Description & Notes (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief goals, topics covered, or notes..."
            rows={3}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl focus:outline-none inset-field font-normal text-main resize-none"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
            }}
          />
        </div>

        {/* Color Accent */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
            Color Accent
          </label>
          <div className="flex items-center gap-2.5">
            {SET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110 opacity-70 hover:opacity-100'
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--neu-border-subtle)]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="brass-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-primary" />
                <span>{isEdit ? 'Saving...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{isEdit ? 'Save Changes' : 'Create Question Set'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
