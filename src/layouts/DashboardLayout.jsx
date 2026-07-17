import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const DashboardLayout = React.memo(function DashboardLayout({ children, title, subtitle }) {
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'power2.out' });
    }
  }, [title]);

  return (
    <div style={{ minHeight: '100%' }}>
      {(title || subtitle) && (
        <div ref={headerRef} style={{ marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          {title && <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>{title}</h1>}
          {subtitle && <p style={{ fontSize: '0.9rem', color: '#8888aa', marginTop: '0.5rem' }}>{subtitle}</p>}
        </div>
      )}
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
});

export default DashboardLayout;
