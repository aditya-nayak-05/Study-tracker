import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const colors = {
  success: 'border-neon-green/30 text-neon-green',
  error: 'border-neon-rose/30 text-neon-rose',
  info: 'border-brand-400/30 text-brand-400',
  warning: 'border-neon-amber/30 text-neon-amber',
};

function ToastItem({ toast, onRemove }) {
  const ref = useRef(null);
  const Icon = icons[toast.toastType] || Info;

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, []);

  const handleClose = () => {
    if (ref.current) {
      gsap.to(ref.current, {
        x: 100,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => onRemove(toast.id),
      });
    } else {
      onRemove(toast.id);
    }
  };

  return (
    <div
      ref={ref}
      className={`glass border ${colors[toast.toastType] || colors.info} rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[400px]`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm text-dark-100 flex-1">{toast.message}</span>
      <button onClick={handleClose} className="text-dark-400 hover:text-white transition-colors cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

const ToastContainer = React.memo(function ToastContainer() {
  const { state, dispatch } = useStudy();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2">
      {state.toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={(id) => dispatch({ type: 'REMOVE_TOAST', payload: id })}
        />
      ))}
    </div>
  );
});

export default ToastContainer;
