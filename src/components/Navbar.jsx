import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageNames = {
  '/': 'Dashboard',
  '/plans': 'Plans',
  '/calendar': 'Calendar',
  '/analytics': 'Analytics',
  '/study-hours': 'Study Hours',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

const Navbar = React.memo(function Navbar({ onSearchOpen }) {
  const { state } = useStudy();
  const location = useLocation();
  const navRef = useRef(null);
  const [notifications] = useState([]);

  const currentPage = pageNames[location.pathname] || 'Plan Detail';
  const breadcrumbs = ['Home'];
  if (location.pathname !== '/') {
    breadcrumbs.push(currentPage);
  }

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
  }, []);

  return (
    <header
      ref={navRef}
      className="h-[4.5rem] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between px-8 sticky top-0 z-30"
      style={{ background: 'rgba(10,10,20,0.90)', backdropFilter: 'blur(12px)' }}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-dark-400" />}
            <span className={i === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-dark-300'}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-glass-border text-dark-300 hover:text-white hover:border-brand-500/30 transition-all text-sm cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 ml-2">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-dark-300 hover:text-white hover:bg-glass-hover transition-all cursor-pointer">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-rose" />
          )}
        </button>

        {/* Profile */}
        {state.profile && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
            {state.profile.avatar ? (
              <img src={state.profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              state.profile.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
        )}
      </div>
    </header>
  );
});

export default Navbar;
