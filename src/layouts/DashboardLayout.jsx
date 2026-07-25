import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const DashboardLayout = React.memo(function DashboardLayout({ children, title, subtitle }) {
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // 3D Real Book Page Flip Animation around left binder rings
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        {
          rotateY: 30,
          scale: 0.95,
          opacity: 0,
          boxShadow: '-30px 0 60px rgba(0,0,0,0.95)',
        },
        {
          rotateY: 0,
          scale: 1,
          opacity: 1,
          boxShadow: '8px 16px 30px rgba(0,0,0,0.95)',
          duration: 0.5,
          ease: 'power3.out',
          clearProps: 'transform,boxShadow',
        }
      );
    }

    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'power2.out', clearProps: 'transform' });
    }
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.15, ease: 'power2.out', clearProps: 'transform' });
    }
  }, [title]);

  return (
    <div 
      ref={pageRef}
      className="journal-page p-6 sm:p-8 min-h-[calc(100vh-6rem)] relative overflow-visible"
      style={{ transformOrigin: 'left center', perspective: '1800px' }}
    >
      {/* Dog-Ear Book Page Corner Fold Accent */}
      <div 
        className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(225deg, #09090b 50%, #1e1e28 50%)',
          boxShadow: '-2px 2px 5px rgba(0,0,0,0.6)',
          borderBottomLeftRadius: '4px',
        }}
      />

      {/* Ribbon Bookmark */}
      <div className="ribbon-bookmark" />

      {/* Spiral Binder Rings on Left Margin */}
      <div className="absolute left-[-16px] top-12 bottom-12 flex flex-col justify-between z-20 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="spiral-ring" />
        ))}
      </div>

      {(title || subtitle) && (
        <div ref={headerRef} style={{ marginBottom: '2rem', paddingBottom: '0.5rem', paddingLeft: '1rem' }}>
          {title && (
            <h1 
              className="text-2xl sm:text-3xl font-extrabold text-[#f2d894] tracking-tight"
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#cbd5e1] mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div ref={contentRef} className="pl-4">
        {children}
      </div>
    </div>
  );
});

export default DashboardLayout;
