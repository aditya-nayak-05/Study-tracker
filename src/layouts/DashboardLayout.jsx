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
      className="journal-page p-3 sm:p-5 md:p-8 sm:pl-16 md:pl-20 min-h-[calc(100vh-5rem)] relative overflow-visible"
    >
      {/* Dog-Ear Book Page Corner Fold Accent */}
      <div 
        className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(225deg, var(--neu-border-subtle) 50%, var(--neu-page-bg) 50%)',
          boxShadow: '-2px 2px 5px rgba(163, 177, 198, 0.5)',
          borderBottomLeftRadius: '4px',
        }}
      />

      {/* Ribbon Bookmark */}
      <div className="ribbon-bookmark" />

      {/* Spiral Binder Rings on Left Margin - hidden on small mobile to maximize content room */}
      <div className="hidden sm:flex absolute left-[-16px] top-12 bottom-12 flex-col justify-between z-20 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="spiral-ring" />
        ))}
      </div>

      {(title || subtitle || headerRight) && (
        <div 
          ref={headerRef} 
          className={`flex flex-col gap-1 mb-5 sm:mb-8 pb-2 ${
            headerRight ? 'lg:flex-row lg:items-center justify-between' : 'items-center text-center mx-auto'
          }`}
        >
          {(title || subtitle) && (
            <div className={headerRight ? 'shrink-0' : 'text-center mx-auto'}>
              {title && (
                <h1 
                  className="text-xl sm:text-2xl md:text-3xl font-black text-main tracking-tight text-center"
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted mt-1 font-medium text-center">
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
