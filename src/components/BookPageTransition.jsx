import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export default function BookPageTransition({ children }) {
  const location = useLocation();
  const pageRef = useRef(null);
  const flipOverlayRef = useRef(null);
  const spineShadowRef = useRef(null);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (!pageRef.current) return;

    // Trigger 3D Book Page Turn Animation
    const pageEl = pageRef.current;
    const overlayEl = flipOverlayRef.current;
    const shadowEl = spineShadowRef.current;

    const timeline = gsap.timeline({
      onStart: () => {
        setDisplayChildren(children);
      }
    });

    // 1. Page turn sequence around left spine (transform-origin: left center)
    timeline
      .set(pageEl, {
        transformOrigin: 'left center',
        perspective: 1800,
        transformStyle: 'preserve-3d',
      })
      .fromTo(
        pageEl,
        {
          rotateY: 25,
          scale: 0.96,
          opacity: 0.3,
          boxShadow: '-30px 0 50px rgba(0, 0, 0, 0.9)',
        },
        {
          rotateY: 0,
          scale: 1,
          opacity: 1,
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          duration: 0.55,
          ease: 'power3.out',
          clearProps: 'transform,transformOrigin,perspective',
        }
      );

    if (overlayEl) {
      timeline.fromTo(
        overlayEl,
        { opacity: 0.8, xPercent: -100 },
        { opacity: 0, xPercent: 100, duration: 0.55, ease: 'power2.inOut' },
        0
      );
    }

    if (shadowEl) {
      timeline.fromTo(
        shadowEl,
        { opacity: 0.9, scaleX: 1.5 },
        { opacity: 0.2, scaleX: 1, duration: 0.55, ease: 'power2.out' },
        0
      );
    }

  }, [location.pathname]);

  return (
    <div className="relative w-full overflow-visible" style={{ perspective: '2000px' }}>
      {/* 3D Spine Crease Shadow Overlay */}
      <div
        ref={spineShadowRef}
        className="absolute left-0 top-0 bottom-0 w-12 z-30 pointer-events-none opacity-0"
        style={{
          background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
        }}
      />

      {/* Realistic 3D Paper Flip Sheen Overlay */}
      <div
        ref={flipOverlayRef}
        className="absolute inset-0 z-40 pointer-events-none opacity-0 overflow-hidden rounded-2xl"
        style={{
          background:
            'linear-gradient(105deg, transparent 20%, rgba(212, 168, 67, 0.15) 40%, rgba(255, 255, 255, 0.25) 50%, rgba(0, 0, 0, 0.4) 60%, transparent 80%)',
        }}
      />

      {/* Main Animated Page Surface */}
      <div
        ref={pageRef}
        className="w-full transition-shadow duration-300"
        style={{
          transformOrigin: 'left center',
          backfaceVisibility: 'hidden',
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
}
