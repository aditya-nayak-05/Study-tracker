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
    <div ref={containerRef} className="fixed inset-0 z-[300] flex flex-col items-center justify-center" style={{ background: '#1a120b' }}>
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #d4a843, #b8860b)',
            boxShadow: 'inset 0 1px 1px #e8c878, 0 4px 6px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.2)',
            border: '1px solid rgba(138,101,8,0.5)'
          }}
        >
          <span className="text-lg font-bold" style={{ color: '#1e1408', textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>S</span>
        </div>
        <span className="text-2xl font-bold" style={{ color: '#f5e6d0', textShadow: '0 1px 1px rgba(0,0,0,0.5), 0 -1px 0 rgba(255,255,255,0.06)' }}>StudyFlow</span>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => (dotRefs.current[i] = el)}
            className="w-2 h-2 rounded-full"
            style={{
              background: '#b8860b',
              boxShadow: 'inset 0 1px 1px #e8c878, 0 2px 4px rgba(0,0,0,0.5)'
            }}
          />
        ))}
      </div>
    </div>
  );
});

export default LoadingScreen;
