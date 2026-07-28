import React, { useState, useEffect } from 'react';
import { Laptop, Download, CheckCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export default function InstallPWAButton({ variant = 'navbar' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { showToast } = useStudy();

  useEffect(() => {
    // Check if already in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      showToast('StudyFlow app installed successfully! 🎉', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        showToast('Installing StudyFlow app to your desktop...', 'info');
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction toast if browser handles prompt natively in address bar
      showToast('Click the "Open in app" or install icon in your browser address bar at top right! 💻', 'info');
    }
  };

  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>Desktop App Installed</span>
        </div>
      );
    }
    return null;
  }

  if (variant === 'settings') {
    return (
      <button
        onClick={handleInstallClick}
        className="brass-btn px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-transform"
      >
        <Laptop className="w-4 h-4" />
        <span>Install Desktop App</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      title="Install StudyFlow as a standalone Desktop App"
      className="relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer brass-btn flex items-center gap-1.5 shrink-0 shadow-sm"
    >
      <Laptop className="w-4 h-4" />
      <span className="hidden sm:inline">Open in App</span>
    </button>
  );
}
