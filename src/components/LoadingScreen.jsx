import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import logoImg from '../assets/logo.png';

const LoadingScreen = React.memo(function LoadingScreen() {
  const containerRef = useRef(null);
  const dotRefs = useRef([]);

  useEffect(() => {
    dotRefs.current.forEach((dot, i) => {
      if (dot) {
        gsap.to(dot, {
          y: -8,
          duration: 0.35,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          delay: i * 0.1,
        });
      }
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center transition-opacity duration-300"
      style={{ background: 'var(--neu-bg, #e6ebf2)' }}
    >
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--accent-orange)] shadow-xl">
          <img src={logoImg} alt="Study Tracker Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-xl font-bold uppercase tracking-wider" style={{ color: 'var(--neu-text-main, #1a202c)' }}>
          Study Tracker
        </span>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => (dotRefs.current[i] = el)}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: 'var(--accent-orange, #ed8936)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
});

export default LoadingScreen;
