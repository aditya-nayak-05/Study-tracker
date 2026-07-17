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

// Lazy-load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Plans = lazy(() => import('./pages/Plans'));
const PlanDetail = lazy(() => import('./pages/PlanDetail'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const Analytics = lazy(() => import('./pages/Analytics'));
const StudyHours = lazy(() => import('./pages/StudyHours'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

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
          alignItems: 'center', justifyContent: 'center', background: '#06060e',
          color: '#e4e4f0', fontFamily: 'Inter, sans-serif', padding: '2rem',
        }}>
          <div style={{
            background: '#12122a', border: '1px solid rgba(251,113,133,0.3)',
            borderRadius: '1rem', padding: '2rem', maxWidth: '600px', width: '100%',
            boxShadow: '0 0 40px rgba(251,113,133,0.1)',
          }}>
            <h2 style={{ color: '#fb7185', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Something went wrong</h2>
            <p style={{ color: '#aaaac8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <pre style={{ color: '#8888aa', fontSize: '0.7rem', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto', background: '#0c0c18', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              {this.state.error?.stack}
            </pre>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem', border: 'none',
                  background: 'linear-gradient(to right, #6366f1, #8b5cf6)', color: '#fff',
                  fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
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
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(251,113,133,0.3)',
                  background: 'transparent', color: '#fb7185',
                  fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', color: '#818cf8', fontSize: '0.875rem' }}>
      Loading page...
    </div>
  );
}

function AppContent() {
  const { state } = useStudy();
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/plans/:planId" element={<PlanDetail />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/study-hours" element={<StudyHours />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
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
