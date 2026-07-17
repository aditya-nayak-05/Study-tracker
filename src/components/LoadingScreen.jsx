import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const LoadingScreen = React.memo(function LoadingScreen() {
  const containerRef = useRef(null);
  const dotRefs = useRef([]);

  useEffect(() => {
    dotRefs.current.forEach((dot, i) => {
      if (dot) {
        gsap.to(dot, {
          y: -12,
          duration: 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          delay: i * 0.1,
        });
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-dark-950">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
          <span className="text-white text-lg font-bold">S</span>
        </div>
        <span className="text-2xl font-bold text-gradient">StudyFlow</span>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => (dotRefs.current[i] = el)}
            className="w-2 h-2 rounded-full bg-brand-400"
          />
        ))}
      </div>
    </div>
  );
});

export default LoadingScreen;
