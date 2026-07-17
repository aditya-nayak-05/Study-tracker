import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import * as storage from '../utils/storage';
import { exportToCSV, exportToExcel, exportToPDF, importFromCSV, importFromExcel, buildPlanFromImport } from '../utils/exportImport';
import {
  Settings as SettingsIcon, Trash2, Download, Upload, Zap, Clock,
  AlertTriangle, FileDown, FileUp, Database, HardDrive,
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
      <div ref={containerRef} className="max-w-2xl space-y-6">
        {/* Pomodoro Settings */}
        <div className="settings-card glass gradient-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-amber" /> Pomodoro Settings
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-dark-300 block mb-1.5">Work (min)</label>
              <input type="number" min={1} max={120} value={settings.pomodoroWork}
                onChange={(e) => updateSetting('pomodoroWork', parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40" />
            </div>
            <div>
              <label className="text-xs text-dark-300 block mb-1.5">Break (min)</label>
              <input type="number" min={1} max={60} value={settings.pomodoroBreak}
                onChange={(e) => updateSetting('pomodoroBreak', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40" />
            </div>
            <div>
              <label className="text-xs text-dark-300 block mb-1.5">Long Break (min)</label>
              <input type="number" min={1} max={60} value={settings.pomodoroLongBreak}
                onChange={(e) => updateSetting('pomodoroLongBreak', parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-glass-border text-white text-sm focus:outline-none focus:border-brand-500/40" />
            </div>
          </div>
        </div>

        {/* Animations */}
        <div className="settings-card glass gradient-border rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-neon-green" />
              <div>
                <h3 className="text-sm font-semibold text-white">Animations</h3>
                <p className="text-xs text-dark-400">Toggle GSAP animations globally</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
              className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.animationsEnabled ? 'bg-brand-500' : 'bg-dark-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.animationsEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* Import / Export */}
        <div className="settings-card glass gradient-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-400" /> Data Management
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-dark-300" />
                <div>
                  <p className="text-sm text-dark-100">Storage Used</p>
                  <p className="text-xs text-dark-400">{storageSizeStr}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 text-dark-200 text-sm hover:bg-dark-600 hover:text-white transition-all cursor-pointer">
                <Download className="w-4 h-4" /> Export Backup
              </button>
              <input type="file" ref={fileInputRef} accept=".json" onChange={handleImportData} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 text-dark-200 text-sm hover:bg-dark-600 hover:text-white transition-all cursor-pointer">
                <Upload className="w-4 h-4" /> Import Backup
              </button>
            </div>

            <div className="pt-3 border-t border-glass-border">
              <p className="text-xs text-dark-400 mb-2">Import a study plan from CSV/Excel</p>
              <input type="file" ref={importFileRef} accept=".csv,.xlsx,.xls" onChange={handleImportPlan} className="hidden" />
              <button onClick={() => importFileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 text-brand-400 text-sm hover:bg-brand-500/20 transition-all cursor-pointer">
                <FileUp className="w-4 h-4" /> Import Plan (CSV/Excel)
              </button>
            </div>

            {state.plans.length > 0 && (
              <div className="pt-3 border-t border-glass-border">
                <p className="text-xs text-dark-400 mb-2">Export plans</p>
                <div className="flex flex-wrap gap-2">
                  {state.plans.filter((p) => !p.archived).map((plan) => (
                    <div key={plan.id} className="flex items-center gap-1">
                      <span className="text-xs text-dark-300 mr-1">{plan.name}:</span>
                      <button onClick={() => { exportToPDF(plan); showToast('PDF exported', 'success'); }} className="text-[10px] px-2 py-1 rounded bg-dark-700 text-dark-300 hover:text-white cursor-pointer">PDF</button>
                      <button onClick={() => { exportToCSV(plan); showToast('CSV exported', 'success'); }} className="text-[10px] px-2 py-1 rounded bg-dark-700 text-dark-300 hover:text-white cursor-pointer">CSV</button>
                      <button onClick={() => { exportToExcel(plan); showToast('Excel exported', 'success'); }} className="text-[10px] px-2 py-1 rounded bg-dark-700 text-dark-300 hover:text-white cursor-pointer">Excel</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card glass rounded-2xl p-6 border border-neon-rose/20">
          <h3 className="text-sm font-semibold text-neon-rose mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h3>
          {confirmReset ? (
            <div className="space-y-3">
              <p className="text-sm text-dark-200">Are you sure? This will delete all data permanently.</p>
              <div className="flex gap-2">
                <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-neon-rose text-white text-sm font-medium cursor-pointer">Yes, Reset</button>
                <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-xl bg-dark-700 text-dark-300 text-sm cursor-pointer">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-rose/10 text-neon-rose text-sm hover:bg-neon-rose/20 transition-all cursor-pointer">
              <Trash2 className="w-4 h-4" /> Reset Application
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
