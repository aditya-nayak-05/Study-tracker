import React, { useState, useEffect } from 'react';
import { Laptop, Download, CheckCircle, X, RefreshCw, Monitor } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export default function InstallPWAButton({ variant = 'navbar' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
      setShowModal(false);
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
      setShowModal(true);
    }
  };

  return (
    <>
      {isInstalled ? (
        variant === 'settings' ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Desktop App Installed</span>
          </div>
        ) : (
          <div 
            title="App is running in Standalone Desktop mode"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Installed</span>
          </div>
        )
      ) : variant === 'settings' ? (
        <button
          onClick={handleInstallClick}
          className="brass-btn px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-transform"
        >
          <Download className="w-4 h-4 text-accent-primary" />
          <span>Install / Download App</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          title="Install or Download Study Tracker Web App"
          className="relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer brass-btn flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4 text-accent-primary" />
          <span className="hidden sm:inline">{deferredPrompt ? 'Install App' : 'Download App'}</span>
        </button>
      )}

      {/* Download & Installation Options Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="relative w-full max-w-lg p-6 rounded-2xl shadow-2xl border text-main space-y-5"
            style={{
              background: 'var(--neu-bg)',
              borderColor: 'var(--neu-border-subtle)',
              boxShadow: 'var(--neu-shadow-raised)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--neu-border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-main">Download Study Tracker App</h3>
                  <p className="text-xs text-muted">Install to your desktop, taskbar, or home screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-muted hover:text-main inset-field cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Tabs / Guidance */}
            <div className="space-y-4 text-xs leading-relaxed">
              {/* Option 1: Chrome Omni bar */}
              <div className="p-3.5 rounded-xl border border-accent-primary/30 bg-accent-primary/5 flex items-start gap-3">
                <Monitor className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-main text-sm mb-1">Option 1: Address Bar Shortcut</h4>
                  <p className="text-muted">
                    Look at the top-right of your browser address bar:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 font-medium text-main">
                    <li>If you see <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Open in app</span>: Click it to open in standalone mode!</li>
                    <li>If you see an <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">Install</span> icon: Click it to install directly.</li>
                  </ul>
                </div>
              </div>

              {/* Option 2: Browser Menu */}
              <div className="p-3.5 rounded-xl inset-field border border-[var(--neu-border)] space-y-2">
                <div className="flex items-center gap-2 font-bold text-main text-sm">
                  <Laptop className="w-4 h-4 text-accent-primary" />
                  <span>Option 2: Install via Browser Menu</span>
                </div>
                <ol className="list-decimal list-inside text-muted space-y-1">
                  <li>Click the 3 vertical dots (<strong>⋮</strong>) in the top-right of Chrome/Edge.</li>
                  <li>Go to <strong>Save and share</strong> (or <em>More tools</em>).</li>
                  <li>Click <strong>Install Study Tracker...</strong> (or <em>Create shortcut → Open as window</em>).</li>
                </ol>
              </div>

              {/* Option 3: Reset / Clean Re-install */}
              <div className="p-3.5 rounded-xl inset-field border border-[var(--neu-border)] space-y-2">
                <div className="flex items-center gap-2 font-bold text-main text-sm">
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                  <span>Option 3: Reset & Re-install Fresh</span>
                </div>
                <p className="text-muted">
                  Want to download it again from scratch?
                </p>
                <ol className="list-decimal list-inside text-muted space-y-1">
                  <li>Type <code className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-[11px] text-accent-primary">chrome://apps</code> in your address bar and press Enter.</li>
                  <li>Right-click <strong>Study Tracker</strong> and click <strong>Uninstall from Chrome</strong>.</li>
                  <li>Refresh this page and the install prompt will appear!</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl brass-btn text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
