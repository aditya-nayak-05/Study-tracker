import React, { useRef, useEffect, useState, useMemo } from 'react';
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
  '/learn': 'Learning Hub',
};

// ── Custom Navbar Learning Page Stats Widget ──
function NavbarLearningStats({ state, location }) {
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
        className="px-3.5 py-2 rounded-xl border border-white/5 flex items-center gap-2 group transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] shrink-0" 
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-dark-400 font-medium">Today task:</span>
        <span className="text-white font-semibold max-w-[140px] truncate group-hover:text-indigo-400 transition-colors" title={task.title}>{task.title}</span>
      </div>

      {/* Current Plan Progress Bar */}
      <div 
        className="px-3.5 py-2 rounded-xl border border-white/5 flex items-center gap-3 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(52,211,153,0.15)] flex-1 max-w-[220px]" 
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-dark-400 font-medium shrink-0">Progress:</span>
        <div className="flex items-center gap-2 w-full">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden flex-1 relative">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <span className="text-white font-bold shrink-0">{progressPercent}%</span>
        </div>
      </div>

      {/* Today Total Study Hours */}
      <div 
        className="px-3.5 py-2 rounded-xl border border-white/5 flex items-center gap-2 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] shrink-0" 
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-dark-400 font-medium">Today hours:</span>
        <span className="text-indigo-400 font-extrabold">{todayHours}</span>
      </div>

      {/* Current Time in India (IST) */}
      <div 
        className="px-3.5 py-2 rounded-xl border border-white/5 flex items-center justify-center transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0" 
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-amber-400 font-extrabold font-mono tracking-wider text-center">{istTime}</span>
      </div>
    </div>
  );
}

const Navbar = React.memo(function Navbar({ onSearchOpen }) {
  const { state } = useStudy();
  const location = useLocation();
  const navRef = useRef(null);
  const [notifications] = useState([]);

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
      className="h-[4.5rem] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between px-8 sticky top-0 z-30"
      style={{ background: 'rgba(10,10,20,0.90)', backdropFilter: 'blur(12px)' }}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm shrink-0">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-dark-400" />}
            <span className={i === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-dark-300'}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Cinematic Learning Page Navbar Stats */}
      {location.pathname.startsWith('/learn/') && (
        <NavbarLearningStats state={state} location={location} />
      )}

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
