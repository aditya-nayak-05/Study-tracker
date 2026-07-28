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
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4a843] shadow-2xl">
          <img src={logoImg} alt="Study Tracker Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-2xl font-black uppercase tracking-wider" style={{ color: '#f5e6d0', textShadow: '0 1px 1px rgba(0,0,0,0.5), 0 -1px 0 rgba(255,255,255,0.06)' }}>Study Tracker</span>
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
