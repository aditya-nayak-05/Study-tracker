import React, { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { Search, Bell, ChevronRight, Palette, Type } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import FontPickerModal from './FontPickerModal';
import ThemePickerModal from './ThemePickerModal';
import InstallPWAButton from './InstallPWAButton';

const pageNames = {
  '/': 'Dashboard',
  '/plans': 'Plans',
  '/calendar': 'Calendar',
  '/analytics': 'Analytics',
  '/study-hours': 'Study Hours',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/learn': 'Learning Hub',
};

// ── Custom Navbar Learning Page Stats Widget ──
function NavbarLearningStats({ state, location, showCinemaControls }) {
  const [istTime, setIstTime] = useState('');

  const parts = location.pathname.split('/');
  const planId = parts[2];
  const taskId = parts[3];

  const plan = state.plans.find((p) => p.id === planId);
  
  let task = null;
  plan?.months?.forEach((m) => {
    m.weeks?.forEach((w) => {
      w.days?.forEach((d) => {
        d.tasks?.forEach((t) => {
          if (t.id === taskId) task = t;
        });
      });
    });
  });

  // Calculate plan progress
  const { total, completed } = useMemo(() => {
    let tot = 0;
    let comp = 0;
    plan?.months?.forEach((m) => {
      m.weeks?.forEach((w) => {
        w.days?.forEach((d) => {
          d.tasks?.forEach((t) => {
            tot++;
            if (t.status === 'completed') comp++;
          });
        });
      });
    });
    return { total: tot, completed: comp };
  }, [plan]);

  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate today's study hours
  const todayStr = new Date().toISOString().split('T')[0];
  const todayHours = useMemo(() => {
    const hoursList = state.globalStudyHours || [];
    const sumDec = hoursList
      .filter((h) => h.date === todayStr)
      .reduce((sum, h) => sum + (h.hours || 0) + (h.minutes || 0) / 60, 0);
    
    // Format to Xh Ym
    const totalSec = Math.round(sumDec * 3600);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, [state.globalStudyHours, todayStr]);

  // Live ticking IST clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setIstTime(now.toLocaleTimeString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!plan || !task) return null;

  return (
    <div className="hidden xl:flex items-center gap-5.5 mx-10 flex-1 justify-center max-w-4xl">
      {/* Today Task */}
      <div 
        className="px-3.5 py-2 rounded-xl border border-[var(--neu-border)] flex items-center gap-2 group transition-all duration-300 hover:border-[var(--accent-orange)] shrink-0" 
        style={{ 
          background: 'var(--neu-card-bg)',
          boxShadow: 'var(--neu-shadow-raised)',
          opacity: showCinemaControls ? 1 : 0,
          pointerEvents: showCinemaControls ? 'auto' : 'none'
        }}
      >
        <span className="text-muted font-medium" style={{textShadow: 'none'}}>Today task:</span>
        <span className="text-main font-semibold max-w-[140px] truncate group-hover:text-accent-primary transition-colors" title={task.title}>{task.title}</span>
      </div>

      {/* Current Plan Progress Bar */}
      <div 
        className="px-3.5 py-2 rounded-xl border border-[var(--neu-border)] flex items-center gap-3 transition-all duration-300 hover:border-[var(--accent-orange)] flex-1 max-w-[220px]" 
        style={{ 
          background: 'var(--neu-card-bg)',
          boxShadow: 'var(--neu-shadow-raised)',
          opacity: showCinemaControls ? 1 : 0,
          pointerEvents: showCinemaControls ? 'auto' : 'none'
        }}
      >
        <span className="text-muted font-medium shrink-0" style={{textShadow: 'none'}}>Progress:</span>
        <div className="flex items-center gap-2 w-full">
          <div className="h-2 rounded-full bg-[var(--neu-card-bg)] overflow-hidden flex-1 relative" style={{ boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.9)' }}>
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#ed8936] to-[#dd6b20] transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <span className="text-main font-bold shrink-0">{progressPercent}%</span>
        </div>
      </div>

      {/* Today Total Study Hours - ALWAYS 100% OPACITY */}
      <div 
        className="px-3.5 py-2 rounded-xl border border-[var(--neu-border)] flex items-center gap-2 transition-all duration-300 hover:border-[var(--accent-orange)] shrink-0" 
        style={{ 
          background: 'var(--neu-card-bg)',
          boxShadow: 'var(--neu-shadow-raised)' 
        }}
      >
        <span className="text-muted font-medium" style={{textShadow: 'none'}}>Today hours:</span>
        <span className="text-accent-primary font-extrabold">{todayHours}</span>
      </div>

      {/* Current Time in India (IST) - ALWAYS 100% OPACITY */}
      <div 
        className="px-3.5 py-2 rounded-xl border border-[var(--neu-border)] flex items-center justify-center transition-all duration-300 hover:border-[var(--accent-orange)] shrink-0" 
        style={{ 
          background: 'var(--neu-card-bg)',
          boxShadow: 'var(--neu-shadow-raised)' 
        }}
      >
        <span className="text-accent-primary font-extrabold font-mono tracking-wider text-center">{istTime}</span>
      </div>
    </div>
  );
}

const Navbar = React.memo(function Navbar({ onSearchOpen }) {
  const { state, dispatch, showToast } = useStudy();
  const location = useLocation();
  const navRef = useRef(null);
  const [notifications] = useState([]);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const [showCinemaControls, setShowCinemaControls] = useState(true);
  const isLearnPage = location.pathname.startsWith('/learn/');

  useEffect(() => {
    if (!isLearnPage) {
      setShowCinemaControls(true);
      return;
    }

    let timeoutId = null;

    const handleMouseMove = () => {
      setShowCinemaControls(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowCinemaControls(false);
      }, 2500); // 2.5 seconds
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);
    
    // Set initial timer to fade out after 2.5s if mouse is still
    timeoutId = setTimeout(() => {
      setShowCinemaControls(false);
    }, 2500);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLearnPage]);

  let currentPage = pageNames[location.pathname];
  if (!currentPage) {
    if (location.pathname.startsWith('/learn/')) {
      currentPage = 'Learning Session';
    } else if (location.pathname.startsWith('/plans/')) {
      currentPage = 'Plan Detail';
    } else {
      currentPage = 'Plan Detail';
    }
  }
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
      className="h-[4.5rem] border-b border-[var(--neu-border-subtle)] flex items-center justify-between px-8 sticky top-0 z-30 transition-all duration-500"
      style={{ 
        background: showCinemaControls ? 'var(--neu-header-bg)' : 'transparent', 
        backdropFilter: showCinemaControls ? 'blur(12px)' : 'none', 
        borderBottomColor: showCinemaControls ? 'var(--neu-border-subtle)' : 'transparent', 
        boxShadow: showCinemaControls ? 'var(--neu-shadow-raised)' : 'none' 
      }}
    >
      {/* Breadcrumbs */}
      <div 
        className="flex items-center gap-2 text-sm shrink-0 transition-opacity duration-500"
        style={{
          opacity: showCinemaControls ? 1 : 0,
          pointerEvents: showCinemaControls ? 'auto' : 'none'
        }}
      >
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted" />}
            <span className={i === breadcrumbs.length - 1 ? 'text-main font-semibold' : 'text-muted'} style={{textShadow: 'none'}}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Cinematic Learning Page Navbar Stats */}
      {location.pathname.startsWith('/learn/') && (
        <NavbarLearningStats 
          state={state} 
          location={location} 
          showCinemaControls={showCinemaControls} 
        />
      )}

      {/* Actions */}
      <div 
        className="flex items-center gap-3 transition-opacity duration-500"
        style={{
          opacity: showCinemaControls ? 1 : 0,
          pointerEvents: showCinemaControls ? 'auto' : 'none'
        }}
      >
        {/* Install Desktop App Button */}
        <InstallPWAButton variant="navbar" />

        {/* Search */}
        <button
          onClick={onSearchOpen}
          aria-label="Search plans, tasks, and days"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-muted hover:text-main hover:border-[var(--accent-orange)] transition-all text-sm cursor-pointer inset-field"
        >
          <Search className="w-4 h-4 text-accent-primary" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded border border-[rgba(163,177,198,0.4)] text-muted ml-2">⌘K</kbd>
        </button>

        {/* Font Change Button */}
        <button 
          onClick={() => setFontPickerOpen(true)}
          aria-label="Change Typography Font (14 fonts available)"
          title="Change Typography Font (14 fonts available)"
          className="relative px-2.5 py-1.5 rounded-lg text-muted transition-all cursor-pointer inset-field flex items-center gap-1.5"
        >
          <Type className="w-4 h-4 text-accent-primary" />
          <span className="hidden md:inline text-xs font-semibold text-main">Font</span>
        </button>

        {/* Theme Palette Button */}
        <button 
          onClick={() => setThemePickerOpen(true)}
          aria-label="Change Color Theme"
          title="Change Color Theme"
          className="relative p-2 rounded-lg text-muted transition-all cursor-pointer inset-field"
        >
          <Palette className="w-5 h-5 text-accent-primary transition-transform duration-300 hover:rotate-12" />
        </button>

        {/* Notifications */}
        <button 
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-muted transition-all cursor-pointer inset-field"
        >
          <Bell className="w-5 h-5 text-accent-primary" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#38a169] border border-[var(--neu-bg)]" />
          )}
        </button>

        {/* Profile */}
        {state.profile && (
          <button
            aria-label="User Profile"
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full brass-btn flex items-center justify-center text-sm font-semibold overflow-hidden shadow-sm cursor-pointer"
          >
            {state.profile.avatar ? (
              <img src={state.profile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              state.profile.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </button>
        )}
      </div>

      {fontPickerOpen && <FontPickerModal onClose={() => setFontPickerOpen(false)} />}
      {themePickerOpen && (
        <ThemePickerModal
          isOpen={themePickerOpen}
          onClose={() => setThemePickerOpen(false)}
          currentTheme={state.settings?.themeMode || 'light'}
          onSelect={(themeId) => {
            dispatch({ type: 'UPDATE_SETTINGS', payload: { themeMode: themeId } });
            showToast(`Theme changed to ${themeId} 🎨`, 'info');
          }}
        />
      )}
    </header>
  );
});

export default Navbar;
