import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export default function BookPageTransition({ children }) {
  const location = useLocation();
  const pageRef = useRef(null);

  useEffect(() => {
    if (!pageRef.current) return;
    window.scrollTo({ top: 0, behavior: 'instant' });

    gsap.fromTo(
      pageRef.current,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.22,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      }
    );
  }, [location.pathname]);

  return (
    <div
      ref={pageRef}
      className="w-full"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </div>
  );
}
