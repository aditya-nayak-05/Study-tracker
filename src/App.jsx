import React, { useState, useEffect, useCallback, lazy, Suspense, Component } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useStudy } from './context/StudyContext';
import FloatingBackground from './components/FloatingBackground';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProgressBar from './components/ProgressBar';
import ToastContainer from './components/Toast';
import CreateProfileModal from './components/CreateProfileModal';
import SearchModal from './components/SearchModal';
import LoadingScreen from './components/LoadingScreen';
import BookPageTransition from './components/BookPageTransition';

// Lazy-load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Plans = lazy(() => import('./pages/Plans'));
const PlanDetail = lazy(() => import('./pages/PlanDetail'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const Analytics = lazy(() => import('./pages/Analytics'));
const StudyHours = lazy(() => import('./pages/StudyHours'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const LearningHub = lazy(() => import('./pages/LearningHub'));
const Learning = lazy(() => import('./pages/Learning'));

// Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#1a120b',
          color: '#f5e6d0', fontFamily: 'Inter, sans-serif', padding: '2rem',
        }}>
          <div style={{
            background: '#2d1f14', border: '1px solid rgba(184,134,11,0.25)',
            borderRadius: '1rem', padding: '2rem', maxWidth: '600px', width: '100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
          }}>
            <h2 style={{ color: '#8b3a3a', marginBottom: '0.5rem', fontSize: '1.25rem', textShadow: '0 1px 1px rgba(0,0,0,0.5), 0 -1px 0 rgba(255,255,255,0.06)' }}>Something went wrong</h2>
            <p style={{ color: '#a08060', fontSize: '0.875rem', marginBottom: '0.5rem', textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <pre style={{ color: '#a08060', fontSize: '0.7rem', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto', background: '#1e1408', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)', border: '1px solid rgba(184,134,11,0.12)' }}>
              {this.state.error?.stack}
            </pre>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem', border: 'none',
                  background: 'linear-gradient(180deg, #d4a843, #b8860b)', color: '#1e1408',
                  fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                  boxShadow: 'inset 0 1px 1px #e8c878, 0 4px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)',
                  textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  const keys = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('studyflow_')) keys.push(key);
                  }
                  keys.forEach((k) => localStorage.removeItem(k));
                  window.location.reload();
                }}
                style={{
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(139,58,58,0.3)',
                  background: 'transparent', color: '#8b3a3a',
                  fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
                  textShadow: '0 1px 1px rgba(0,0,0,0.5)',
                }}
              >
                Reset & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', color: '#d4a843', fontSize: '0.875rem', textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}>
      Loading page...
    </div>
  );
}

function AppContent() {
  const { state } = useStudy();
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const themeMode = state.settings?.themeMode || 'light';
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const fontFamily = state.settings?.fontFamily || "'Inter', sans-serif";
  useEffect(() => {
    document.body.style.fontFamily = fontFamily;
  }, [fontFamily]);

  // Initial loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [searchOpen]);

  const handleSearchOpen = useCallback(() => setSearchOpen(true), []);

  if (loading) return <LoadingScreen />;

  // Show profile creation if no profile exists or profile has no name
  if (!state.profile || !state.profile.name) {
    return (
      <ErrorBoundary>
        <FloatingBackground />
        <CreateProfileModal />
        <ToastContainer />
      </ErrorBoundary>
    );
  }

  const sidebarWidth = state.settings?.sidebarCollapsed ? 72 : 260;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <FloatingBackground />
      <Sidebar />

      <div style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease' }}>
        <Navbar onSearchOpen={handleSearchOpen} />
        <main style={{ padding: '2rem 2.5rem', paddingBottom: '5rem', position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 4rem)' }}>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <BookPageTransition>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/plans/:planId" element={<PlanDetail />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/study-hours" element={<StudyHours />} />
                  <Route path="/learn" element={<LearningHub />} />
                  <Route path="/learn/:planId/:taskId" element={<Learning />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </BookPageTransition>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <ProgressBar />
      <ToastContainer />
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
