import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { codeSnippets, snippetColors } from '../data/codeSnippets';

const FloatingBackground = React.memo(function FloatingBackground() {
  const containerRef = useRef(null);
  const snippetRefs = useRef([]);
  const particleRefs = useRef([]);

  const visibleSnippets = useMemo(() => {
    const shuffled = [...codeSnippets].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 18);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate floating snippets
      snippetRefs.current.forEach((el, i) => {
        if (!el) return;
        const duration = 20 + Math.random() * 30;
        const delay = Math.random() * 10;
        gsap.set(el, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0,
        });
        gsap.to(el, {
          y: `-=${100 + Math.random() * 200}`,
          x: `+=${(Math.random() - 0.5) * 200}`,
          opacity: 0.08 + Math.random() * 0.07,
          duration,
          delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
        gsap.to(el, {
          rotation: (Math.random() - 0.5) * 10,
          duration: duration * 0.7,
          delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Animate particles
      particleRefs.current.forEach((el) => {
        if (!el) return;
        const duration = 15 + Math.random() * 25;
        gsap.set(el, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          scale: 0.5 + Math.random() * 1.5,
        });
        gsap.to(el, {
          y: `-=${50 + Math.random() * 150}`,
          x: `+=${(Math.random() - 0.5) * 100}`,
          opacity: 0.15 + Math.random() * 0.25,
          duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.05) 50%, transparent 80%)',
        }}
      />

      {/* Floating code snippets */}
      {visibleSnippets.map((snippet, i) => (
        <div
          key={i}
          ref={(el) => (snippetRefs.current[i] = el)}
          className="absolute font-mono text-[10px] sm:text-xs whitespace-nowrap select-none"
          style={{
            color: snippetColors[i % snippetColors.length],
            textShadow: `0 0 8px ${snippetColors[i % snippetColors.length]}`,
            opacity: 0,
          }}
        >
          {snippet}
        </div>
      ))}

      {/* Particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`p-${i}`}
          ref={(el) => (particleRefs.current[i] = el)}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3 + 'px',
            height: 2 + Math.random() * 3 + 'px',
            background: snippetColors[i % snippetColors.length],
            boxShadow: `0 0 6px ${snippetColors[i % snippetColors.length]}`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
});

export default FloatingBackground;
