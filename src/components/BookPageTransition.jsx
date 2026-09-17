import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { pageEnter, contentCascade, isReducedMotion } from '../utils/motion';

export default function BookPageTransition({ children }) {
  const location = useLocation();
  const pageRef = useRef(null);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (!pageRef.current) return;
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Determine directional motion based on route depth
    const prevDepth = prevPathRef.current.split('/').filter(Boolean).length;
    const currentDepth = location.pathname.split('/').filter(Boolean).length;
    const direction = currentDepth >= prevDepth ? 'down' : 'up';
    prevPathRef.current = location.pathname;

    const ctx = gsap.context(() => {
      // 1. Premium Directional Fade
      pageEnter(pageRef.current, direction, () => {
        // 2. Soft Content Cascade on meaningful children
        if (!pageRef.current || isReducedMotion()) return;
        const targets = pageRef.current.querySelectorAll(
          '.journal-page > div > h1, .journal-page > div > p, .dash-card, .plan-card, .stagger-item'
        );
        if (targets.length > 0) {
          contentCascade(Array.from(targets).slice(0, 8), 0.05, 0.02);
        }
      });
    }, pageRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div
      ref={pageRef}
      className="w-full"
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {children}
    </div>
  );
}

