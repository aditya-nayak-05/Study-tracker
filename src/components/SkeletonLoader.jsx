import React from 'react';

const SkeletonLoader = React.memo(function SkeletonLoader({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-xl bg-dark-800 ${className}`} />
      ))}
    </>
  );
});

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-dark-700 rounded w-3/4" />
      <div className="h-3 bg-dark-700 rounded w-1/2" />
      <div className="h-2 bg-dark-700 rounded w-full mt-4" />
    </div>
  );
}

export default SkeletonLoader;
