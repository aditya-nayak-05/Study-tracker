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
      <div className="w-16 h-16 rounded-2xl bg-[#18181f] flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-[#94a3b8]" />
      </div>
      <h3 className="text-lg font-semibold text-[#f5f5f7] mb-2">{title}</h3>
      <p className="text-sm text-[#94a3b8] max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d8a442] to-[#f2d894] text-[#18181f] text-sm font-medium hover:shadow-lg hover:shadow-[#d8a442]/25 transition-all active:scale-[0.97] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
});

export default EmptyState;
