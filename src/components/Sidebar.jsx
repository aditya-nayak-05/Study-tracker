import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import {
  LayoutDashboard, BookOpen, Calendar, BarChart3, Clock, User, Settings,
  ChevronLeft, ChevronRight, Pin, Sparkles, Youtube,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/plans', label: 'Plans', icon: BookOpen },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/study-hours', label: 'Study Hours', icon: Clock },
  { path: '/learn', label: 'Learning', icon: Youtube },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = React.memo(function Sidebar() {
  const { state, dispatch } = useStudy();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const itemRefs = useRef([]);
  const collapsed = state.settings.sidebarCollapsed;

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
      }, 1500); // 1.5 seconds
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Set initial timer to fade out after 1.5s if mouse is still
    timeoutId = setTimeout(() => {
      setShowCinemaControls(false);
    }, 1500);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLearnPage]);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: collapsed ? 72 : 260,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
  }, [collapsed]);

  useEffect(() => {
    itemRefs.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(el, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, delay: i * 0.04, ease: 'power2.out' });
      }
    });
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
    dispatch({ type: 'SET_UI', payload: { currentPage: path } });
  };

  const toggleCollapse = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { sidebarCollapsed: !collapsed } });
  };

  const pinnedPlans = state.plans.filter((p) => p.pinned && !p.archived);

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden transition-opacity duration-300"
      style={{ 
        width: collapsed ? 72 : 260, 
        background: 'rgba(10,10,20,0.95)', 
        borderRight: '1px solid rgba(255,255,255,0.08)',
        opacity: showCinemaControls ? 1 : 0.02,
        pointerEvents: showCinemaControls ? 'auto' : 'none'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[4.5rem] border-b border-glass-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-gradient whitespace-nowrap">StudyFlow</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              ref={(el) => (itemRefs.current[i] = el)}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center rounded-xl transition-all duration-300 group cursor-pointer hover:scale-[1.03] active:scale-[0.98]
                ${collapsed ? 'justify-center p-3.5' : 'gap-3 px-4 py-3'}
                ${isActive
                  ? 'bg-brand-500/15 text-brand-400 shadow-[inset_0_0_12px_rgba(99,102,241,0.25)] border border-brand-500/20'
                  : 'text-dark-200 hover:bg-glass-hover hover:text-white border border-transparent hover:border-white/5'
                }`}
            >
              <Icon className={`shrink-0 transition-all duration-300 group-hover:scale-115
                ${collapsed ? 'w-7 h-7' : 'w-5 h-5'}
                ${isActive 
                  ? 'text-brand-400 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.65)]' 
                  : 'text-dark-300 group-hover:text-brand-400 group-hover:filter group-hover:drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]'
                }`} 
              />
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}

        {/* Pinned plans */}
        {pinnedPlans.length > 0 && !collapsed && (
          <div className="pt-4 mt-4 border-t border-glass-border">
            <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-3">Pinned Plans</p>
            {pinnedPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  dispatch({ type: 'SET_UI', payload: { activePlanId: plan.id } });
                  navigate(`/plans/${plan.id}`);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-dark-200 hover:bg-glass-hover hover:text-white transition-all text-sm"
              >
                <Pin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="truncate">{plan.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapse}
        className="h-12 border-t border-glass-border flex items-center justify-center text-dark-300 hover:text-white hover:bg-glass-hover transition-all shrink-0 cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
});

export default Sidebar;
