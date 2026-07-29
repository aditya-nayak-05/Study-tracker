import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import {
  LayoutDashboard, BookOpen, Calendar, BarChart3, Clock, User, Settings,
  ChevronLeft, ChevronRight, Pin, Sparkles, Youtube,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

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

// 3D Book Button — active book stays open, previous closes when switching
const BookNavItem = React.memo(function BookNavItem({ label, icon: Icon, isActive, onClick, collapsed }) {
  const handleClick = () => {
    if (!isActive) onClick();
  };

  // isActive = cover stays open (flipped). Otherwise cover is closed.
  return (
    <div className="book-btn-wrapper my-2">
      <button
        onClick={handleClick}
        title={label}
        className={`book-btn-card ${isActive ? 'active-book' : ''} ${
          collapsed ? 'h-[3.25rem]' : 'h-[4rem]'
        }`}
      >
        {/* Inner pages — always present, visible when cover is open */}
        <div className="book-inner-pages">
          <div className="book-inside-line" />
          <div className="book-inside-line short" />
          <div className="book-inside-title">{label}</div>
        </div>

        {/* Front Cover — hinged on left spine */}
        <div className={`book-front-cover ${isActive ? 'cover-open' : ''}`}>
          {/* Spine */}
          <div className="book-spine-strip">
            <div className="book-spine-highlight" />
          </div>

          {/* Title badge */}
          {!collapsed ? (
            <div className="book-golden-label px-3 py-1.5 flex items-center gap-2 max-w-[88%]">
              {Icon && <Icon className="w-4 h-4 shrink-0 text-current" />}
              <span className="text-xs font-black truncate uppercase tracking-tight text-current">
                {label}
              </span>
            </div>
          ) : (
            <div className="book-golden-label p-1.5 flex items-center justify-center ml-1">
              {Icon && <Icon className="w-4 h-4 text-current" />}
            </div>
          )}
        </div>

        {/* Page edge & bookmark */}
        <div className="book-pages-bottom" />
        <div className="book-ribbon-bookmark" />
      </button>
    </div>
  );
});

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
      }, 2500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);
    
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
      className="fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden transition-all duration-500 wood-panel"
      style={{ 
        width: collapsed ? 72 : 260, 
        opacity: showCinemaControls ? 1 : 0,
        pointerEvents: showCinemaControls ? 'auto' : 'none'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[4.5rem] border-b border-[var(--neu-border-subtle)] shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-[var(--accent-orange)] shadow-md overflow-hidden bg-black/20">
          <img src={logoImg} alt="Study Tracker Logo" className="w-full h-full object-cover rounded-full" />
        </div>
        {!collapsed && (
          <span className="text-base font-extrabold text-main whitespace-nowrap tracking-tight" style={{textShadow: 'none'}}>Study Tracker</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.path} ref={(el) => (itemRefs.current[i] = el)}>
              <BookNavItem
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                onClick={() => handleNavClick(item.path)}
                collapsed={collapsed}
              />
            </div>
          );
        })}

        {/* Pinned plans */}
        {pinnedPlans.length > 0 && !collapsed && (
          <div className="pt-4 mt-4 border-t border-[var(--neu-border-subtle)]">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-muted mb-3" style={{textShadow: 'none'}}>Pinned Plans</p>
            {pinnedPlans.map((plan) => (
              <BookNavItem
                key={plan.id}
                label={plan.name}
                icon={Pin}
                isActive={location.pathname === `/plans/${plan.id}`}
                onClick={() => {
                  dispatch({ type: 'SET_UI', payload: { activePlanId: plan.id } });
                  navigate(`/plans/${plan.id}`);
                }}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapse}
        className="h-12 border-t border-[var(--neu-border-subtle)] flex items-center justify-center text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-all shrink-0 cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
});

export default Sidebar;

