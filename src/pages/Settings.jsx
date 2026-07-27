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
        <div className="settings-card bg-[#e6ebf2] border border-[rgba(255,255,255,0.7)] rounded-2xl p-6" style={{ boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.6), -6px -6px 14px rgba(255, 255, 255, 0.85)' }}>
          <h3 className="text-sm font-semibold text-[#1a202c] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ed8936]" /> Pomodoro Settings
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#718096] block mb-1.5 font-medium">Work (min)</label>
              <input type="number" min={1} max={120} value={settings.pomodoroWork}
                onChange={(e) => updateSetting('pomodoroWork', parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 rounded-xl text-[#1a202c] text-sm focus:outline-none" style={{ background: '#e6ebf2', boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255,255,255,0.6)' }} />
            </div>
            <div>
              <label className="text-xs text-[#718096] block mb-1.5 font-medium">Break (min)</label>
              <input type="number" min={1} max={60} value={settings.pomodoroBreak}
                onChange={(e) => updateSetting('pomodoroBreak', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 rounded-xl text-[#1a202c] text-sm focus:outline-none" style={{ background: '#e6ebf2', boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255,255,255,0.6)' }} />
            </div>
            <div>
              <label className="text-xs text-[#718096] block mb-1.5 font-medium">Long Break (min)</label>
              <input type="number" min={1} max={60} value={settings.pomodoroLongBreak}
                onChange={(e) => updateSetting('pomodoroLongBreak', parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 rounded-xl text-[#1a202c] text-sm focus:outline-none" style={{ background: '#e6ebf2', boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255,255,255,0.6)' }} />
            </div>
          </div>
        </div>

        {/* Animations */}
        <div className="settings-card bg-[#e6ebf2] border border-[rgba(255,255,255,0.7)] rounded-2xl p-6" style={{ boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.6), -6px -6px 14px rgba(255, 255, 255, 0.85)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-[#ed8936]" />
              <div>
                <h3 className="text-sm font-semibold text-[#1a202c]">Animations</h3>
                <p className="text-xs text-[#718096]">Toggle GSAP animations globally</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
              className="w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors"
              style={{ background: '#e6ebf2', boxShadow: settings.animationsEnabled ? 'inset 2px 2px 4px rgba(163, 177, 198, 0.6), inset -2px -2px 4px rgba(255, 255, 255, 0.9)' : '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)' }}
            >
              <div className={`w-5 h-5 rounded-full transition-transform ${settings.animationsEnabled ? 'translate-x-5 bg-[#38a169]' : 'bg-[#a0aec0]'}`} style={{ boxShadow: '1px 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
        </div>

        {/* Import / Export */}
        <div className="settings-card bg-[#e6ebf2] border border-[rgba(255,255,255,0.7)] rounded-2xl p-6" style={{ boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.6), -6px -6px 14px rgba(255, 255, 255, 0.85)' }}>
          <h3 className="text-sm font-semibold text-[#1a202c] mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#ed8936]" /> Data Management
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-[#718096]" />
                <div>
                  <p className="text-sm text-[#1a202c]">Storage Used</p>
                  <p className="text-xs text-[#718096]">{storageSizeStr}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#2d3748] text-sm transition-all cursor-pointer font-medium" style={{ background: '#e6ebf2', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>
                <Download className="w-4 h-4" /> Export Backup
              </button>
              <input type="file" ref={fileInputRef} accept=".json" onChange={handleImportData} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#2d3748] text-sm transition-all cursor-pointer font-medium" style={{ background: '#e6ebf2', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>
                <Upload className="w-4 h-4" /> Import Backup
              </button>
            </div>

            <div className="pt-3 border-t border-[rgba(163,177,198,0.3)]">
              <p className="text-xs text-[#718096] mb-2">Import a study plan from CSV/Excel</p>
              <input type="file" ref={importFileRef} accept=".csv,.xlsx,.xls" onChange={handleImportPlan} className="hidden" />
              <button onClick={() => importFileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#ed8936] text-sm transition-all cursor-pointer font-medium" style={{ background: '#e6ebf2', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>
                <FileUp className="w-4 h-4" /> Import Plan (CSV/Excel)
              </button>
            </div>

            {state.plans.length > 0 && (
              <div className="pt-3 border-t border-[rgba(163,177,198,0.3)]">
                <p className="text-xs text-[#718096] mb-2">Export plans</p>
                <div className="flex flex-wrap gap-2">
                  {state.plans.filter((p) => !p.archived).map((plan) => (
                    <div key={plan.id} className="flex items-center gap-1">
                      <span className="text-xs text-[#718096] mr-1">{plan.name}:</span>
                      <button onClick={() => { exportToPDF(plan); showToast('PDF exported', 'success'); }} className="text-[10px] px-2.5 py-1 rounded-lg text-[#2d3748] cursor-pointer font-medium" style={{ background: '#e6ebf2', boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>PDF</button>
                      <button onClick={() => { exportToCSV(plan); showToast('CSV exported', 'success'); }} className="text-[10px] px-2.5 py-1 rounded-lg text-[#2d3748] cursor-pointer font-medium" style={{ background: '#e6ebf2', boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>CSV</button>
                      <button onClick={() => { exportToExcel(plan); showToast('Excel exported', 'success'); }} className="text-[10px] px-2.5 py-1 rounded-lg text-[#2d3748] cursor-pointer font-medium" style={{ background: '#e6ebf2', boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>Excel</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card bg-[#e6ebf2] border border-[rgba(255,255,255,0.7)] rounded-2xl p-6" style={{ boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.6), -6px -6px 14px rgba(255, 255, 255, 0.85)' }}>
          <h3 className="text-sm font-semibold text-[#e53e3e] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#e53e3e]" /> Danger Zone
          </h3>
          {confirmReset ? (
            <div className="space-y-3">
              <p className="text-sm text-[#718096]">Are you sure? This will delete all data permanently.</p>
              <div className="flex gap-2">
                <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-[#e53e3e] text-white text-sm font-medium cursor-pointer shadow-md">Yes, Reset</button>
                <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-xl text-[#718096] text-sm cursor-pointer" style={{ background: '#e6ebf2', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#e53e3e] text-sm transition-all cursor-pointer font-medium" style={{ background: '#e6ebf2', boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255,255,255,0.7)' }}>
              <Trash2 className="w-4 h-4" /> Reset Application
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
