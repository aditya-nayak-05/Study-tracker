import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { FolderOpen, Plus } from 'lucide-react';

const EmptyState = React.memo(function EmptyState({ title, description, actionLabel, onAction, icon: Icon = FolderOpen }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    }
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--neu-card-bg)] flex items-center justify-center mb-5" style={{ boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.85)' }}>
        <Icon className="w-8 h-8 text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-main mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all active:scale-[0.97] cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)', boxShadow: '5px 5px 12px rgba(163, 177, 198, 0.6), -5px -5px 12px rgba(255, 255, 255, 0.85)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
});

export default EmptyState;
