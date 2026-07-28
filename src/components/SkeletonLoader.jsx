import React from 'react';

const SkeletonLoader = React.memo(function SkeletonLoader({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-xl bg-[#cbd5e0] ${className}`} />
      ))}
    </>
  );
});

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 space-y-4 animate-pulse border border-[var(--neu-border)]" style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-raised)' }}>
      <div className="h-4 bg-[#cbd5e0] rounded w-3/4" />
      <div className="h-3 bg-[#cbd5e0] rounded w-1/2" />
      <div className="h-2 bg-[#cbd5e0] rounded w-full mt-4" />
    </div>
  );
}

export default SkeletonLoader;
