import React from 'react';

const SkeletonLoader = React.memo(function SkeletonLoader({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-xl bg-[#18181f] ${className}`} />
      ))}
    </>
  );
});

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 space-y-4 animate-pulse border border-[rgba(255,255,255,0.08)]" style={{ background: 'linear-gradient(145deg, #191922, #111116)' }}>
      <div className="h-4 bg-[#18181f] rounded w-3/4" />
      <div className="h-3 bg-[#18181f] rounded w-1/2" />
      <div className="h-2 bg-[#18181f] rounded w-full mt-4" />
    </div>
  );
}

export default SkeletonLoader;
