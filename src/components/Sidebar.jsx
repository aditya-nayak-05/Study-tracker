import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import {
  LayoutDashboard, BookOpen, Calendar, BarChart3, Clock, User, Settings,
  ChevronLeft, ChevronRight, Pin, Sparkles,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/plans', label: 'Plans', icon: BookOpen },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/study-hours', label: 'Study Hours', icon: Clock },
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
      className="fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden"
      style={{ width: collapsed ? 72 : 260, background: 'rgba(10,10,20,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer
                ${isActive
                  ? 'bg-brand-500/15 text-brand-400 glow-brand'
                  : 'text-dark-200 hover:bg-glass-hover hover:text-white'
                }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-400' : 'text-dark-300 group-hover:text-brand-400'}`} />
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
