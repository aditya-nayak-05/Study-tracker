import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import {
  LayoutDashboard, BookOpen, Calendar, BarChart3, Clock, User, Settings,
  ChevronLeft, ChevronRight, Pin, Sparkles, Youtube, ExternalLink
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

// Brand SVG Icons for Quick Desktop Apps
function VSCodeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.12a.999.999 0 0 0-1.276.06L.344 7.27a1 1 0 0 0-.067 1.43l3.69 3.99-3.69 3.99a1 1 0 0 0 .067 1.43l1.305 1.19a.999.999 0 0 0 1.276.06l4.12-3.12 9.46 8.63c.49.447 1.2.56 1.705.29l4.94-2.377A1.5 1.5 0 0 0 24 21.65V4.35a1.5 1.5 0 0 0-.85-1.763zM18 16.5l-6-4.5 6-4.5v9z"/>
    </svg>
  );
}

function ChromeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12 6.63 0 12-5.37 12-12 0-6.63-5.37-12-12-12zm0 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-8.86.5a9.98 9.98 0 0 1 8.86-7.5c2.34 0 4.47.81 6.16 2.16L12 16.27A4.98 4.98 0 0 0 7.02 12c-.78 0-1.52.18-2.18.5L3.14 9.5zm.36 5.5a9.97 9.97 0 0 1-.5-3c0-.85.11-1.67.31-2.45L9.12 16.8c.84.45 1.8.7 2.88.7 1.05 0 2.02-.27 2.86-.75l-4.52 7.82A9.97 9.97 0 0 1 3.5 15zm16.48-1.5a9.98 9.98 0 0 1-5.12 7.64l4.52-7.83c.42-.81.65-1.73.65-2.7 0-.74-.14-1.44-.39-2.11H8.16l2.84 4.92c.32.06.66.08 1 .08a4.98 4.98 0 0 0 4.98-4.98c0-.36-.04-.7-.11-1.02h3.11z"/>
    </svg>
  );
}

function ChatGPTIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0813 4.779-2.7582a.795.795 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4952 4.4952zm-8.857-4.1448a4.4707 4.4707 0 0 1-.5358-3.0037l.142.0854 4.7838 2.7582a.795.795 0 0 0 .7904 0l5.8339-3.3693v2.3325a.0805.0805 0 0 1-.0332.0617l-4.8315 2.7868a4.5045 4.5045 0 0 1-6.1496-1.6516zm-1.677-9.5204a4.4902 4.4902 0 0 1 2.3406-1.9679l-.0047.1659v5.5163a.795.795 0 0 0 .3976.6813l5.8338 3.3693-2.02 1.1686a.0758.0758 0 0 1-.0664.0047l-4.8315-2.7868a4.5045 4.5045 0 0 1-1.6494-6.1514zm14.0975 3.2505l-5.8339-3.3693 2.02-1.1686a.0758.0758 0 0 1 .0664-.0047l4.8315 2.7868a4.5045 4.5045 0 0 1 .6866 7.4206l-.142-.0854-4.7838-2.7582a.795.795 0 0 0-.8448 0zm2.5026-3.3931l-.1419.0813-4.779 2.7582a.795.795 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.071.071 0 0 1-.038-.052v-5.5826a4.5045 4.5045 0 0 1 7.3716-3.4545zm-11.533-4.52a4.4707 4.4707 0 0 1 3.4172-.0474l-.142.0854-4.7838 2.7582a.795.795 0 0 0-.3976.6813v6.7388l-2.02-1.1686a.0758.0758 0 0 1-.038-.0617v-5.5826a4.5045 4.5045 0 0 1 3.9642-3.4034zm1.0964 5.3789l2.7915 1.6114v3.2227l-2.7915 1.6114-2.7915-1.6114v-3.2227l2.7915-1.6114z"/>
    </svg>
  );
}

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

const quickApps = [
  {
    id: 'vscode',
    name: 'VS Code',
    protocol: 'vscode://',
    fallbackUrl: 'https://code.visualstudio.com',
    icon: VSCodeIcon,
    tooltip: 'Open VS Code (focuses active window)',
  },
  {
    id: 'chrome',
    name: 'Chrome',
    protocol: 'googlechrome://',
    fallbackUrl: 'https://www.google.com',
    icon: ChromeIcon,
    tooltip: 'Open Google Chrome',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    protocol: 'chatgpt://',
    fallbackUrl: 'https://chatgpt.com',
    icon: ChatGPTIcon,
    tooltip: 'Open ChatGPT Desktop App',
  },
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

  const handleOpenApp = (app) => {
    dispatch({
      type: 'ADD_TOAST',
      payload: { message: `Opening ${app.name} desktop app...`, type: 'info' }
    });

    try {
      // Directly trigger OS protocol scheme to open/focus desktop application
      window.location.href = app.protocol;
    } catch (err) {
      console.error('Failed to launch protocol:', err);
    }
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
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              ref={(el) => (itemRefs.current[i] = el)}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center transition-all duration-300 group cursor-pointer binder-tab
                ${collapsed ? 'justify-center p-3.5 rounded-xl' : 'gap-3 px-4 py-3'}
                ${isActive ? 'active text-accent-primary' : 'text-muted hover:text-main'}`}
            >
              <Icon className={`shrink-0 transition-all duration-300 group-hover:scale-110
                ${collapsed ? 'w-6 h-6' : 'w-4 h-4'}
                ${isActive 
                  ? 'text-accent-primary' 
                  : 'text-muted group-hover:text-accent-primary'
                }`} 
              />
              {!collapsed && (
                <span 
                  className="text-sm font-semibold tracking-wide whitespace-nowrap" 
                  style={{ textShadow: 'none' }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Desktop Apps Section */}
        <div className="pt-4 mt-3 border-t border-[var(--neu-border-subtle)]">
          {!collapsed ? (
            <>
              <div className="flex items-center justify-between px-3 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5" style={{textShadow: 'none'}}>
                  <ExternalLink className="w-3 h-3 text-accent-primary" />
                  Quick Apps
                </span>
              </div>

              <div className="space-y-2 px-1">
                {quickApps.map((app) => {
                  const AppIcon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleOpenApp(app)}
                      title={app.tooltip}
                      className="quick-app-btn"
                    >
                      <div className="quick-app-icon-badge">
                        <AppIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold tracking-wide whitespace-nowrap truncate">
                        {app.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2.5 pt-1">
              {quickApps.map((app) => {
                const AppIcon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => handleOpenApp(app)}
                    title={app.tooltip}
                    className="quick-app-icon-collapsed"
                  >
                    <AppIcon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned plans */}
        {pinnedPlans.length > 0 && !collapsed && (
          <div className="pt-4 mt-3 border-t border-[var(--neu-border-subtle)]">
            <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted mb-3" style={{textShadow: 'none'}}>Pinned Plans</p>
            {pinnedPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  dispatch({ type: 'SET_UI', payload: { activePlanId: plan.id } });
                  navigate(`/plans/${plan.id}`);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-muted hover:bg-[var(--neu-hover-bg)] hover:text-main transition-all text-sm"
              >
                <Pin className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                <span className="truncate">{plan.name}</span>
              </button>
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

