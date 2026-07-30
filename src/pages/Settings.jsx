import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import * as storage from '../utils/storage';
import { exportToCSV, exportToExcel, exportToPDF, importFromCSV, importFromExcel, buildPlanFromImport } from '../utils/exportImport';
import { availableFonts } from '../data/fonts';
import { themes as settingsThemes } from '../data/themes';
import InstallPWAButton from '../components/InstallPWAButton';
import {
  Settings as SettingsIcon, Trash2, Download, Upload, Zap, Clock,
  AlertTriangle, FileDown, FileUp, Database, HardDrive, Type, Check, Laptop, Palette,
} from 'lucide-react';

export default function Settings() {
  const { state, dispatch, showToast } = useStudy();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const importFileRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [settings, setSettings] = useState(state.settings);

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.settings-card');
      gsap.fromTo(cards, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  }, [dispatch]);

  const handleExportData = useCallback(() => {
    const data = storage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
  }, [showToast]);

  const handleImportData = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        storage.importAllData(data);
        showToast('Data imported! Reload to apply.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [showToast]);

  const handleImportPlan = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let data;
      if (file.name.endsWith('.csv')) data = await importFromCSV(file);
      else data = await importFromExcel(file);
      const plan = buildPlanFromImport(data, file.name.replace(/\.\w+$/, ''));
      dispatch({ type: 'IMPORT_PLAN', payload: plan });
      showToast('Plan imported successfully!', 'success');
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
    e.target.value = '';
  }, [dispatch, showToast]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
    showToast('Application reset', 'info');
    setConfirmReset(false);
    setTimeout(() => window.location.reload(), 500);
  }, [dispatch, showToast]);

  const storageSize = storage.getStorageSize();
  const storageSizeStr = storageSize > 1024 * 1024
    ? `${(storageSize / (1024 * 1024)).toFixed(2)} MB`
    : `${(storageSize / 1024).toFixed(1)} KB`;

  return (
    <DashboardLayout title="Settings" subtitle="Configure your study planner">
      <div ref={containerRef} className="max-w-7xl w-full flex flex-col xl:flex-row gap-6">
        {/* Left Column: 2x2 Grid Layout for Core Settings */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top-Left: Timer Settings */}
            <div className="notebook-settings-card p-6 flex flex-col justify-between">
              <div>
                <div className="notebook-header-line">
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-primary" /> Timer Settings
                  </h3>
                </div>
                <div className="max-w-xs">
                  <div>
                    <label className="text-xs text-muted block mb-1.5 font-medium">Timer Duration (min)</label>
                    <input type="number" min={1} max={180} value={settings.timerDuration || settings.pomodoroWork || 25}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 25;
                        updateSetting('timerDuration', val);
                        updateSetting('pomodoroWork', val);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-main text-sm focus:outline-none" style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)', border: '1px solid rgba(255,255,255,0.6)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top-Right: Desktop App Download */}
            <div className="notebook-settings-card p-6 flex flex-col justify-between">
              <div className="notebook-header-line">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-accent-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-main">Desktop Application</h3>
                    <p className="text-xs text-muted">Install StudyFlow to your desktop taskbar/dock for standalone offline use</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <InstallPWAButton variant="settings" />
              </div>
            </div>

            {/* Bottom-Left: Theme Section */}
            <div className="notebook-settings-card p-6 flex flex-col">
              <div className="notebook-header-line">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-accent-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-main">Color Theme</h3>
                    <p className="text-xs text-muted">Choose from 16 premium color themes</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {settingsThemes.map((theme) => {
                  const isActive = (settings.themeMode || 'light') === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => updateSetting('themeMode', theme.id)}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                        isActive ? 'ring-2 ring-[var(--accent-orange)] scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                      style={{
                        background: theme.swatches[0],
                        border: isActive ? '2px solid var(--accent-orange)' : '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <div className="flex justify-center gap-1 mb-2">
                        {theme.swatches.map((c, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ background: c }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-center block" style={{ color: theme.id === 'light' ? '#1a202c' : '#f5f5f7' }}>
                        {theme.icon} {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom-Right: Font Section */}
            <div className="notebook-settings-card p-6 flex flex-col">
              <div className="notebook-header-line">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-accent-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-main">Typography Theme</h3>
                    <p className="text-xs text-muted">Select from 22 Google Fonts (Playful, Creative Display & Handwritten Scripts)</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {availableFonts.map((f) => {
                  const isSelected = (settings.fontFamily || "'Inter', sans-serif") === f.family;
                  return (
                    <button
                      key={f.name}
                      onClick={() => {
                        updateSetting('fontFamily', f.family);
                        showToast(`Font updated to ${f.name} ✍️`, 'success');
                      }}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                        isSelected ? 'binder-tab active' : 'neu-card hover:border-[var(--accent-orange)]'
                      }`}
                    >
                      <div className="w-full text-center">
                        <span className="text-sm font-semibold text-main block text-center truncate" style={{ fontFamily: f.family }}>
                          {f.name}
                        </span>
                        <span className="text-[10px] text-muted text-center block mt-0.5">{f.category}</span>
                      </div>
                      {isSelected && (
                        <div className="mt-1 flex justify-center">
                          <Check className="w-3.5 h-3.5 text-accent-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Animations, Data Management, Danger Zone (Notebook Ruled Sidebar) */}
        <div className="w-full xl:w-96 space-y-6 shrink-0">
          {/* Animations */}
          <div className="notebook-settings-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-accent-primary" />
                <div>
                  <h3 className="text-sm font-bold text-main">Animations</h3>
                  <p className="text-xs text-muted">Toggle GSAP animations globally</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
                className="w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors"
                style={{ background: 'var(--neu-card-bg)', boxShadow: settings.animationsEnabled ? 'inset 2px 2px 4px rgba(163, 177, 198, 0.6), inset -2px -2px 4px rgba(255, 255, 255, 0.9)' : '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)' }}
              >
                <div className={`w-5 h-5 rounded-full transition-transform ${settings.animationsEnabled ? 'translate-x-5 bg-[#38a169]' : 'bg-[#a0aec0]'}`} style={{ boxShadow: '1px 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          </div>

          {/* Import / Export & Data Management */}
          <div className="notebook-settings-card p-6">
            <div className="notebook-header-line">
              <h3 className="text-sm font-bold text-main flex items-center gap-2">
                <Database className="w-4 h-4 text-accent-primary" /> Data Management
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-sm text-main font-medium">Storage Used</p>
                    <p className="text-xs text-muted">{storageSizeStr}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={handleExportData} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-main text-xs transition-all cursor-pointer font-medium" style={{ background: 'var(--neu-card-bg)', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>
                  <Download className="w-3.5 h-3.5" /> Export Backup
                </button>
                <input type="file" ref={fileInputRef} accept=".json" onChange={handleImportData} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-main text-xs transition-all cursor-pointer font-medium" style={{ background: 'var(--neu-card-bg)', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>
                  <Upload className="w-3.5 h-3.5" /> Import Backup
                </button>
              </div>

              <div className="pt-3 border-t border-[var(--neu-border-subtle)]">
                <p className="text-xs text-muted mb-2">Import a study plan from CSV/Excel</p>
                <input type="file" ref={importFileRef} accept=".csv,.xlsx,.xls" onChange={handleImportPlan} className="hidden" />
                <button onClick={() => importFileRef.current?.click()} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-accent-primary text-xs transition-all cursor-pointer font-medium" style={{ background: 'var(--neu-card-bg)', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>
                  <FileUp className="w-3.5 h-3.5" /> Import Plan (CSV/Excel)
                </button>
              </div>

              {state.plans.length > 0 && (
                <div className="pt-3 border-t border-[var(--neu-border-subtle)]">
                  <p className="text-xs text-muted mb-2">Export plans</p>
                  <div className="flex flex-col gap-2">
                    {state.plans.filter((p) => !p.archived).map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between gap-1">
                        <span className="text-xs text-muted truncate max-w-[150px]">{plan.name}:</span>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => { exportToPDF(plan); showToast('PDF exported', 'success'); }} className="text-[10px] px-2 py-1 rounded-lg text-main cursor-pointer font-medium" style={{ background: 'var(--neu-card-bg)', boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>PDF</button>
                          <button onClick={() => { exportToCSV(plan); showToast('CSV exported', 'success'); }} className="text-[10px] px-2 py-1 rounded-lg text-main cursor-pointer font-medium" style={{ background: 'var(--neu-card-bg)', boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>CSV</button>
                          <button onClick={() => { exportToExcel(plan); showToast('Excel exported', 'success'); }} className="text-[10px] px-2 py-1 rounded-lg text-main cursor-pointer font-medium" style={{ background: 'var(--neu-card-bg)', boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>Excel</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="notebook-settings-card p-6">
            <div className="notebook-header-line">
              <h3 className="text-sm font-bold text-[#e53e3e] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#e53e3e]" /> Danger Zone
              </h3>
            </div>
            {confirmReset ? (
              <div className="space-y-3">
                <p className="text-xs text-muted">Are you sure? This will delete all data permanently.</p>
                <div className="flex gap-2">
                  <button onClick={handleReset} className="px-3.5 py-2 rounded-xl bg-[#e53e3e] text-white text-xs font-medium cursor-pointer shadow-md">Yes, Reset</button>
                  <button onClick={() => setConfirmReset(false)} className="px-3.5 py-2 rounded-xl text-muted text-xs cursor-pointer" style={{ background: 'var(--neu-card-bg)', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#e53e3e] text-xs transition-all cursor-pointer font-medium" style={{ background: 'var(--neu-card-bg)', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' }}>
                <Trash2 className="w-4 h-4" /> Reset Application
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
