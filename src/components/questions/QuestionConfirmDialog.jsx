import React, { useRef, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { modalEnter, modalExit } from '../../utils/motion';

export default function QuestionConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary'
  requireTextMatch = null, // e.g. "DELETE"
  onConfirm,
  onCancel,
}) {
  const backdropRef = useRef(null);
  const boxRef = useRef(null);
  const [typedText, setTypedText] = React.useState('');

  useEffect(() => {
    if (isOpen && backdropRef.current && boxRef.current) {
      modalEnter(backdropRef.current, boxRef.current);
    }
    setTypedText('');
  }, [isOpen]);

  const handleClose = () => {
    if (backdropRef.current && boxRef.current) {
      modalExit(backdropRef.current, boxRef.current, onCancel);
    } else {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (requireTextMatch && typedText.trim() !== requireTextMatch) return;
    if (backdropRef.current && boxRef.current) {
      modalExit(backdropRef.current, boxRef.current, onConfirm);
    } else {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  const canConfirm = !requireTextMatch || typedText.trim() === requireTextMatch;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(13, 15, 23, 0.75)' }}
      onClick={handleClose}
    >
      <div
        ref={boxRef}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl p-6 w-full max-w-md leather-card shadow-2xl relative"
        style={{
          background: 'var(--neu-card-bg)',
          border: '1px solid var(--neu-border)',
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted hover:text-main transition-colors p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: confirmVariant === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: confirmVariant === 'danger' ? '#ef4444' : 'var(--accent-orange)',
            }}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-main">{title}</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {requireTextMatch && (
          <div className="mt-4 pt-3 border-t border-[var(--neu-border-subtle)]">
            <p className="text-xs font-semibold text-muted mb-2">
              Type <span className="font-mono text-main font-black">{requireTextMatch}</span> to confirm:
            </p>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={`Type ${requireTextMatch}`}
              className="w-full px-3 py-2 text-xs rounded-xl focus:outline-none inset-field font-mono font-bold tracking-wider"
              style={{
                background: 'var(--neu-card-bg)',
                border: '1px solid var(--neu-border)',
                color: 'var(--neu-text-main)',
              }}
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !canConfirm ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
            }`}
            style={{
              background:
                confirmVariant === 'danger'
                  ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                  : 'var(--accent-btn-bg)',
              color: '#ffffff',
              boxShadow: 'var(--btn-glow-shadow)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
