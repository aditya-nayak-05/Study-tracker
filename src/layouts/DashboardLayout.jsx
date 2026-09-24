import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const DashboardLayout = React.memo(function DashboardLayout({ children, title, subtitle, headerRight }) {
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  // Page entrance is owned cleanly by BookPageTransition

  return (
    <div 
      ref={pageRef}
      className="journal-page pl-16 pr-8 py-6 sm:pl-20 sm:pr-14 sm:py-8 min-h-[calc(100vh-6rem)] relative overflow-visible"
    >
      {/* Dog-Ear Book Page Corner Fold Accent */}
      <div 
        className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(225deg, var(--neu-border-subtle) 50%, var(--neu-page-bg) 50%)',
          boxShadow: '-2px 2px 5px rgba(163, 177, 198, 0.5)',
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

      {(title || subtitle || headerRight) && (
        <div 
          ref={headerRef} 
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-2"
        >
          {(title || subtitle) && (
            <div className="shrink-0">
              {title && (
                <h1 
                  className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight"
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted mt-1 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {headerRight && (
            <div className="flex-1 max-w-2xl 2xl:max-w-3xl w-full">
              {headerRight}
            </div>
          )}
        </div>
      )}
      
      <div ref={contentRef} className="pl-0">
        {children}
      </div>
    </div>
  );
});

export default DashboardLayout;
