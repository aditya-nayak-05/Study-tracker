import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { codeSnippets } from '../data/codeSnippets';

const FloatingBackground = React.memo(function FloatingBackground() {
  const containerRef = useRef(null);
  const snippetRefs = useRef([]);
  const particleRefs = useRef([]);

  const visibleSnippets = useMemo(() => {
    const shuffled = [...codeSnippets].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate floating snippets with gentle GPU transforms
      snippetRefs.current.forEach((el, i) => {
        if (!el) return;
        const duration = 25 + Math.random() * 20;
        const delay = i * 2;
        gsap.set(el, {
          x: (i * 200 + 50) % (window.innerWidth || 1200),
          y: (i * 120 + 80) % (window.innerHeight || 800),
          opacity: 0,
        });
        gsap.to(el, {
          y: `-=${80 + Math.random() * 60}`,
          opacity: 0.07,
          duration,
          delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Animate particles
      particleRefs.current.forEach((el, i) => {
        if (!el) return;
        const duration = 20 + Math.random() * 15;
        gsap.set(el, {
          x: (i * 220 + 100) % (window.innerWidth || 1200),
          y: (i * 150 + 50) % (window.innerHeight || 800),
        });
        gsap.to(el, {
          y: `-=${60}`,
          opacity: 0.18,
          duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [visibleSnippets]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Subtle Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,134,11,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,134,11,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating code snippets */}
      {visibleSnippets.map((snippet, i) => (
        <div
          key={i}
          ref={(el) => (snippetRefs.current[i] = el)}
          className="absolute font-mono text-[10px] select-none"
          style={{
            color: 'var(--neu-text-sub)',
            opacity: 0,
            willChange: 'transform',
          }}
        >
          {snippet}
        </div>
      ))}

      {/* Lightweight Ambient Particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`p-${i}`}
          ref={(el) => (particleRefs.current[i] = el)}
          className="absolute rounded-full"
          style={{
            width: '3px',
            height: '3px',
            background: 'var(--accent-orange, #ed8936)',
            opacity: 0,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
});

export default FloatingBackground;
