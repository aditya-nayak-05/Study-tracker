import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import * as storage from '../utils/storage';
import { exportToCSV, exportToExcel, exportToPDF, importFromCSV, importFromExcel, buildPlanFromImport } from '../utils/exportImport';
import { availableFonts } from '../data/fonts';
import { themes as settingsThemes } from '../data/themes';
import InstallPWAButton from '../components/InstallPWAButton';
import MotivationQuoteBanner from '../components/MotivationQuoteBanner';
import UserMotivationQuoteBanner from '../components/UserMotivationQuoteBanner';
import { SIX_HUNDRED_QUOTES, MOTIVATION_CATEGORIES, getRandomQuote } from '../data/motivationQuotes';
import {
  Settings as SettingsIcon, Trash2, Download, Upload, Zap, Clock,
  AlertTriangle, FileDown, FileUp, Database, HardDrive, Type, Check, Laptop, Palette, Target,
  Minus, Plus, RotateCcw, Play, Sparkles, Archive, ArchiveRestore,
  Quote, Edit3, Save, X, Search, Shuffle, Calendar, Lock, PenLine, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { ANIMATION_SPEED_LEVELS, ANIMATION_STYLES, triggerMotionDemo } from '../utils/motion';

export default function Settings() {
  const { state, dispatch, showToast } = useStudy();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const importFileRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [settings, setSettings] = useState(state.settings);
  const [previewing, setPreviewing] = useState(false);
  const previewCardRef = useRef(null);
  const previewBadgesRef = useRef([]);
  const previewProgressRef = useRef(null);

  useEffect(() => {
    setSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.notebook-settings-card, .settings-card');
      gsap.fromTo(cards, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  }, [dispatch]);

  const currentSpeedLevel = settings.animationSpeed ?? 3;
  const currentSpeedConfig = ANIMATION_SPEED_LEVELS.find((l) => l.level === currentSpeedLevel) || ANIMATION_SPEED_LEVELS[3];

  const currentStyleId = settings.animationStyle || 'smooth';
  const currentStyleConfig = ANIMATION_STYLES.find((s) => s.id === currentStyleId) || ANIMATION_STYLES[0];

  const handleSpeedChange = useCallback((newLevel) => {
    const safeLevel = Math.max(0, Math.min(6, newLevel));
    updateSetting('animationSpeed', safeLevel);
    updateSetting('animationsEnabled', safeLevel > 0);
    const targetConfig = ANIMATION_SPEED_LEVELS.find((l) => l.level === safeLevel) || ANIMATION_SPEED_LEVELS[3];
    if (safeLevel === 0) {
      showToast('Animations disabled (Instant mode)', 'info');
    } else {
      showToast(`Motion set to ${targetConfig.label} (${targetConfig.speedText})`, 'success');
    }
  }, [updateSetting, showToast]);

  const handleStyleChange = useCallback((styleId) => {
    updateSetting('animationStyle', styleId);
    const targetStyle = ANIMATION_STYLES.find((s) => s.id === styleId) || ANIMATION_STYLES[0];
    showToast(`Motion style set to ${targetStyle.name} (${targetStyle.subtitle}) ✨`, 'success');
  }, [updateSetting, showToast]);

  const handleDecrease = useCallback(() => {
    if (currentSpeedLevel > 0) {
      handleSpeedChange(currentSpeedLevel - 1);
    }
  }, [currentSpeedLevel, handleSpeedChange]);

  const handleIncrease = useCallback(() => {
    if (currentSpeedLevel < 6) {
      handleSpeedChange(currentSpeedLevel + 1);
    }
  }, [currentSpeedLevel, handleSpeedChange]);

  const handleResetSpeed = useCallback(() => {
    handleSpeedChange(3);
    handleStyleChange('smooth');
  }, [handleSpeedChange, handleStyleChange]);

  const handleTriggerPreview = useCallback(() => {
    if (previewing) return;
    setPreviewing(true);
    triggerMotionDemo(
      previewCardRef.current,
      previewBadgesRef.current,
      previewProgressRef.current,
      () => setPreviewing(false),
      currentStyleId
    );
  }, [previewing, currentStyleId]);

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

  const handleUnarchivePlan = useCallback((plan) => {
    dispatch({
      type: 'UPDATE_PLAN',
      payload: { id: plan.id, updates: { archived: false } },
    });
    showToast(`"${plan.name}" removed from archive and restored!`, 'success');
  }, [dispatch, showToast]);

  const handleDeleteArchivedPlan = useCallback((plan) => {
    if (window.confirm(`Permanently delete "${plan.name}"? This cannot be undone.`)) {
      dispatch({ type: 'DELETE_PLAN', payload: plan.id });
      showToast(`"${plan.name}" permanently deleted`, 'info');
    }
  }, [dispatch, showToast]);

  // Motivation Quotes Settings & Custom Quotes State
  const dailyQuoteChangeEnabled = settings.dailyQuoteChangeEnabled !== false;
  const userCustomQuotes = Array.isArray(settings.userCustomQuotes) ? settings.userCustomQuotes : [];

  // 600 Quotes Search, Category Filter & Pagination
  const [quoteSearch, setQuoteSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quotePage, setQuotePage] = useState(1);
  const quotesPerPage = 12;

  const filtered600Quotes = useMemo(() => {
    let list = SIX_HUNDRED_QUOTES;
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter((q) => q.category === selectedCategory);
    }
    if (quoteSearch.trim()) {
      const qLower = quoteSearch.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.text.toLowerCase().includes(qLower) ||
          (q.index && q.index.toString() === qLower) ||
          q.category.toLowerCase().includes(qLower)
      );
    }
    return list;
  }, [selectedCategory, quoteSearch]);

  const totalPages = Math.ceil(filtered600Quotes.length / quotesPerPage) || 1;
  const paginatedQuotes = useMemo(() => {
    const start = (quotePage - 1) * quotesPerPage;
    return filtered600Quotes.slice(start, start + quotesPerPage);
  }, [filtered600Quotes, quotePage, quotesPerPage]);

  const handleCategorySelect = useCallback((cat) => {
    setSelectedCategory(cat);
    setQuotePage(1);
  }, []);

  const handleSearchChange = useCallback((val) => {
    setQuoteSearch(val);
    setQuotePage(1);
  }, []);

  // Action: Set any quote active
  const handleSetActiveQuote = useCallback((quote) => {
    updateSetting('activeQuoteId', quote.id);
    updateSetting('activeQuoteText', quote.text);
    updateSetting('activeQuoteAuthor', quote.author || quote.category || '');
    updateSetting('activeQuoteCategory', quote.category || '');
    showToast(`Active quote set to: "${quote.text.slice(0, 35)}..." ✨`, 'success');
  }, [updateSetting, showToast]);

  // Action: Toggle Daily Auto-Change ON / OFF
  const handleToggleDailyChange = useCallback(() => {
    const nextVal = !dailyQuoteChangeEnabled;
    updateSetting('dailyQuoteChangeEnabled', nextVal);
    showToast(
      nextVal
        ? 'Daily auto-change is ON: Quotes change automatically every day ✨'
        : 'Daily auto-change is OFF: Quote locked and will not change daily 🔒',
      nextVal ? 'success' : 'info'
    );
  }, [dailyQuoteChangeEnabled, updateSetting, showToast]);

  // Action: Pick Random Quote from 600
  const handlePickRandomQuote = useCallback(() => {
    const random = getRandomQuote(SIX_HUNDRED_QUOTES, settings.activeQuoteId);
    if (random) {
      handleSetActiveQuote(random);
      showToast(`Random Quote #${random.index}: "${random.text}" (${random.category}) ✨`, 'success');
    }
  }, [settings.activeQuoteId, handleSetActiveQuote, showToast]);

  // Custom Quotes: Add form state
  const [customQuoteText, setCustomQuoteText] = useState('');
  const [customQuoteAuthor, setCustomQuoteAuthor] = useState('');

  // Custom Quotes: Inline edit state
  const [editingCustomId, setEditingCustomId] = useState(null);
  const [editCustomText, setEditCustomText] = useState('');
  const [editCustomAuthor, setEditCustomAuthor] = useState('');

  const handleAddCustomQuote = useCallback((e) => {
    if (e) e.preventDefault();
    if (!customQuoteText.trim()) {
      showToast('Please enter your motivational quote', 'error');
      return;
    }
    const newQuote = {
      id: `custom_${Date.now()}`,
      text: customQuoteText.trim(),
      author: customQuoteAuthor.trim() || state.profile?.name || 'Personal Mantra',
      category: 'Custom Quote',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newQuote, ...userCustomQuotes];
    updateSetting('userCustomQuotes', updated);
    // Set as active quote on Dashboard
    updateSetting('activeQuoteId', newQuote.id);
    updateSetting('activeQuoteText', newQuote.text);
    updateSetting('activeQuoteAuthor', newQuote.author);
    updateSetting('activeQuoteCategory', 'Custom Quote');
    setCustomQuoteText('');
    setCustomQuoteAuthor('');
    showToast('Your custom quote has been added & set active on your Dashboard! 🎉', 'success');
  }, [customQuoteText, customQuoteAuthor, userCustomQuotes, state.profile?.name, updateSetting, showToast]);

  const handleStartEditCustom = useCallback((quote) => {
    setEditingCustomId(quote.id);
    setEditCustomText(quote.text);
    setEditCustomAuthor(quote.author || '');
  }, []);

  const handleCancelEditCustom = useCallback(() => {
    setEditingCustomId(null);
    setEditCustomText('');
    setEditCustomAuthor('');
  }, []);

  const handleSaveEditCustom = useCallback((quoteId) => {
    if (!editCustomText.trim()) {
      showToast('Quote text cannot be empty', 'error');
      return;
    }
    const updated = userCustomQuotes.map((q) => {
      if (q.id === quoteId) {
        return {
          ...q,
          text: editCustomText.trim(),
          author: editCustomAuthor.trim() || 'Personal Mantra',
        };
      }
      return q;
    });
    updateSetting('userCustomQuotes', updated);
    if (settings.activeQuoteId === quoteId) {
      updateSetting('activeQuoteText', editCustomText.trim());
      updateSetting('activeQuoteAuthor', editCustomAuthor.trim() || 'Personal Mantra');
    }
    setEditingCustomId(null);
    showToast('Custom quote updated ✨', 'success');
  }, [editCustomText, editCustomAuthor, userCustomQuotes, settings.activeQuoteId, updateSetting, showToast]);

  const handleDeleteCustomQuote = useCallback((quoteId) => {
    const updated = userCustomQuotes.filter((q) => q.id !== quoteId);
    updateSetting('userCustomQuotes', updated);
    if (settings.activeQuoteId === quoteId) {
      const fallback = SIX_HUNDRED_QUOTES[0];
      updateSetting('activeQuoteId', fallback.id);
      updateSetting('activeQuoteText', fallback.text);
      updateSetting('activeQuoteAuthor', fallback.category);
      updateSetting('activeQuoteCategory', fallback.category);
    }
    showToast('Custom quote deleted', 'info');
  }, [userCustomQuotes, settings.activeQuoteId, updateSetting, showToast]);

  const handleResetToFirstQuote = useCallback(() => {
    const first = SIX_HUNDRED_QUOTES[0];
    handleSetActiveQuote(first);
    showToast('Reset active quote to #1 ✨', 'info');
  }, [handleSetActiveQuote, showToast]);

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
            {/* Top-Left: Study Goals & Timer Settings */}
            <div className="notebook-settings-card p-6 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="notebook-header-line">
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent-primary" /> Study Goals & Timer
                  </h3>
                </div>
                <div className="space-y-4">
                  {/* Daily Study Hours Goal */}
                  <div>
                    <label className="text-xs text-muted block mb-1.5 font-medium">Daily Study Hours Goal (hrs/day)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={settings.dailyStudyHours ?? settings.dailyGoal ?? state.profile?.dailyGoal ?? 6}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(24, parseInt(e.target.value) || 1));
                          updateSetting('dailyStudyHours', val);
                          updateSetting('dailyGoal', val);
                          showToast(`Daily study goal set to ${val} hours 🎯`, 'success');
                        }}
                        className="w-20 px-3 py-2 rounded-xl text-main text-sm font-semibold focus:outline-none"
                        style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)', border: '1px solid var(--neu-border)', color: 'var(--neu-text-main)' }}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {[2, 3, 4, 6, 8, 10].map((hrs) => {
                          const currentGoal = settings.dailyStudyHours ?? settings.dailyGoal ?? state.profile?.dailyGoal ?? 6;
                          const isSelected = currentGoal === hrs;
                          return (
                            <button
                              key={hrs}
                              type="button"
                              onClick={() => {
                                updateSetting('dailyStudyHours', hrs);
                                updateSetting('dailyGoal', hrs);
                                showToast(`Daily study goal set to ${hrs} hours 🎯`, 'success');
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                isSelected ? 'bg-accent-primary text-white shadow-sm' : 'text-muted hover:text-main'
                              }`}
                              style={!isSelected ? { background: 'var(--neu-card-bg)', boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)', border: '1px solid var(--neu-border)' } : {}}
                            >
                              {hrs}h
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted mt-1.5">Set your daily target study hours for Dashboard & Analytics progress</p>
                  </div>

                  {/* Timer Duration */}
                  <div>
                    <label className="text-xs text-muted block mb-1.5 font-medium">Timer Duration (min)</label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={settings.timerDuration || settings.pomodoroWork || 25}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 25;
                        updateSetting('timerDuration', val);
                        updateSetting('pomodoroWork', val);
                      }}
                      className="w-full max-w-[200px] px-3 py-2 rounded-xl text-main text-sm focus:outline-none"
                      style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)', border: '1px solid var(--neu-border)', color: 'var(--neu-text-main)' }}
                    />
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

          {/* SECTION 1: Motivation Quotes */}
          <div className="notebook-settings-card p-6">
            <div className="notebook-header-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Quote className="w-5 h-5 text-accent-primary" />
                <div>
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    Motivation Quotes
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: 'var(--neu-inset-bg)',
                        color: 'var(--accent-orange-bright, var(--accent-orange))',
                        border: '1px solid var(--neu-border)',
                      }}
                    >
                      600 Powerful Quotes
                    </span>
                  </h3>
                  <p className="text-xs text-muted">
                    Curated motivational quotes with adaptive font sizing, daily auto-rotation, and glowing theme banner
                  </p>
                </div>
              </div>

              {/* Action Buttons: Daily Toggle & Random Quote */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleDailyChange}
                  title={
                    dailyQuoteChangeEnabled
                      ? 'Daily auto-change is ON (quotes change daily). Click to lock.'
                      : 'Daily auto-change is OFF (quote is locked). Click to enable daily quotes.'
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                  style={{
                    background: dailyQuoteChangeEnabled
                      ? 'color-mix(in srgb, var(--accent-orange) 18%, var(--neu-card-bg))'
                      : 'var(--neu-card-bg)',
                    border: dailyQuoteChangeEnabled
                      ? '1px solid color-mix(in srgb, var(--accent-orange) 50%, transparent)'
                      : '1px solid var(--neu-border)',
                    color: dailyQuoteChangeEnabled
                      ? 'var(--accent-orange-bright, var(--accent-orange))'
                      : 'var(--neu-text-muted)',
                    boxShadow: dailyQuoteChangeEnabled
                      ? '0 0 10px color-mix(in srgb, var(--accent-orange) 20%, transparent)'
                      : 'var(--neu-shadow-raised)',
                  }}
                >
                  {dailyQuoteChangeEnabled ? (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                      <span>Daily Rotation: ON</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 opacity-70" />
                      <span>Daily Rotation: OFF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePickRandomQuote}
                  title="Pick a random quote from 600 quotes"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-accent-primary hover:brightness-110 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Random Quote
                </button>

                <button
                  type="button"
                  onClick={handleResetToFirstQuote}
                  title="Reset to Quote #1"
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-main cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                  style={{
                    background: 'var(--neu-card-bg)',
                    boxShadow: 'var(--neu-shadow-raised)',
                    border: '1px solid var(--neu-border)',
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                  #1
                </button>
              </div>
            </div>

            {/* Live Dashboard Preview */}
            <div className="mb-6 pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
                  Live Dashboard Preview (Theme Glow & Adaptive Sizing)
                </span>
                <span className="text-[11px] text-muted">
                  Displays full quote with soft glow & theme border
                </span>
              </div>
              <div
                className="p-3 sm:p-4 rounded-2xl transition-all duration-300"
                style={{
                  background: 'var(--neu-inset-bg)',
                  border: '1px dashed var(--neu-border)',
                }}
              >
                <MotivationQuoteBanner isPreview={true} />
              </div>
            </div>

            {/* Curated Quote Display on Dashboard Toggle */}
            <div
              className="mb-4 p-3.5 rounded-xl flex items-center justify-between gap-3"
              style={{
                background: 'var(--neu-inset-bg)',
                border: '1px solid var(--neu-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: (settings.showCuratedQuoteBanner !== false)
                      ? 'color-mix(in srgb, var(--accent-orange) 20%, transparent)'
                      : 'var(--neu-card-bg)',
                    color: (settings.showCuratedQuoteBanner !== false)
                      ? 'var(--accent-orange)'
                      : 'var(--neu-text-muted)',
                  }}
                >
                  <Quote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-main">
                    {(settings.showCuratedQuoteBanner !== false)
                      ? 'Curated Quote Banner is Visible on Dashboard'
                      : 'Curated Quote Banner is Hidden on Dashboard'}
                  </h4>
                  <p className="text-[11px] text-muted">
                    {(settings.showCuratedQuoteBanner !== false)
                      ? 'Displaying the 600-quote motivation card on your dashboard.'
                      : 'Turned off. This quote is currently hidden on your dashboard.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = settings.showCuratedQuoteBanner === false;
                  setSettings((prev) => ({ ...prev, showCuratedQuoteBanner: nextVal }));
                  dispatch({
                    type: 'UPDATE_SETTINGS',
                    payload: { showCuratedQuoteBanner: nextVal },
                  });
                  showToast(nextVal ? 'Curated Quote banner enabled ✨' : 'Curated Quote banner hidden', 'info');
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-300 active:scale-95"
                style={{
                  background: (settings.showCuratedQuoteBanner !== false)
                    ? 'color-mix(in srgb, var(--accent-orange) 18%, var(--neu-card-bg))'
                    : 'var(--neu-card-bg)',
                  border: (settings.showCuratedQuoteBanner !== false)
                    ? '1.5px solid var(--accent-orange)'
                    : '1px solid var(--neu-border)',
                  color: (settings.showCuratedQuoteBanner !== false)
                    ? 'var(--accent-orange-bright, var(--accent-orange))'
                    : 'var(--neu-text-muted)',
                  boxShadow: (settings.showCuratedQuoteBanner !== false)
                    ? '0 0 14px color-mix(in srgb, var(--accent-orange) 35%, transparent)'
                    : 'none',
                }}
              >
                {(settings.showCuratedQuoteBanner !== false) ? 'Display: ON' : 'Display: OFF'}
              </button>
            </div>

            {/* Daily Auto-Change Setting Explanation */}
            <div
              className="mb-6 p-3.5 rounded-xl flex items-center justify-between gap-3"
              style={{
                background: 'var(--neu-inset-bg)',
                border: '1px solid var(--neu-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: dailyQuoteChangeEnabled
                      ? 'color-mix(in srgb, var(--accent-orange) 20%, transparent)'
                      : 'var(--neu-card-bg)',
                    color: dailyQuoteChangeEnabled
                      ? 'var(--accent-orange)'
                      : 'var(--neu-text-muted)',
                  }}
                >
                  {dailyQuoteChangeEnabled ? <Calendar className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-main">
                    {dailyQuoteChangeEnabled
                      ? 'Daily Quote Auto-Change is Active'
                      : 'Daily Quote Auto-Change is Turned Off'}
                  </h4>
                  <p className="text-[11px] text-muted">
                    {dailyQuoteChangeEnabled
                      ? 'A fresh inspirational quote will automatically greet you on the Dashboard every day.'
                      : 'Your current quote is locked and will stay fixed on the Dashboard.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleDailyChange}
                className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shrink-0"
                style={{
                  background: dailyQuoteChangeEnabled ? 'var(--accent-orange)' : 'var(--neu-card-bg)',
                  color: dailyQuoteChangeEnabled ? '#fff' : 'var(--neu-text-main)',
                  border: '1px solid var(--neu-border)',
                  boxShadow: 'var(--neu-shadow-raised)',
                }}
              >
                {dailyQuoteChangeEnabled ? 'Turn Off' : 'Turn On'}
              </button>
            </div>

            {/* 600 Quotes Explorer */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    Browse All 600 Quotes
                  </h4>
                  <p className="text-[11px] text-muted">
                    Showing {filtered600Quotes.length} matching quotes. Click any quote to display it immediately on your dashboard.
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={quoteSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by keyword or #..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs text-main focus:outline-none"
                    style={{
                      background: 'var(--neu-inset-bg)',
                      boxShadow: 'var(--neu-shadow-inset)',
                      border: '1px solid var(--neu-border)',
                      color: 'var(--neu-text-main)',
                    }}
                  />
                  {quoteSearch && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin">
                {MOTIVATION_CATEGORIES.map((cat) => {
                  const isCatActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                        isCatActive
                          ? 'bg-accent-primary text-white shadow-sm'
                          : 'text-muted hover:text-main'
                      }`}
                      style={
                        !isCatActive
                          ? {
                              background: 'var(--neu-card-bg)',
                              boxShadow: 'var(--neu-shadow-raised)',
                              border: '1px solid var(--neu-border)',
                            }
                          : {}
                      }
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Quotes Grid / List */}
              <div className="space-y-2">
                {paginatedQuotes.length === 0 ? (
                  <div
                    className="py-8 text-center rounded-xl"
                    style={{ background: 'var(--neu-inset-bg)', border: '1px dashed var(--neu-border)' }}
                  >
                    <Quote className="w-6 h-6 text-muted mx-auto mb-1 opacity-50" />
                    <p className="text-xs text-muted font-medium">No quotes found for "{quoteSearch}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuoteSearch('');
                        setSelectedCategory('All');
                      }}
                      className="mt-2 text-xs text-accent-primary font-bold underline"
                    >
                      Clear search filters
                    </button>
                  </div>
                ) : (
                  paginatedQuotes.map((q) => {
                    const isActive = settings.activeQuoteText === q.text || settings.activeQuoteId === q.id;
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleSetActiveQuote(q)}
                        className={`group flex items-start justify-between p-3 rounded-xl gap-3 transition-all cursor-pointer ${
                          isActive ? 'border-[1.5px]' : 'hover:border-[var(--accent-orange)]'
                        }`}
                        style={{
                          background: 'var(--neu-card-bg)',
                          boxShadow: isActive
                            ? '0 0 14px color-mix(in srgb, var(--accent-orange) 22%, transparent), var(--neu-shadow-raised)'
                            : 'var(--neu-shadow-raised)',
                          borderColor: isActive
                            ? 'color-mix(in srgb, var(--accent-orange) 65%, var(--neu-border))'
                            : 'var(--neu-border)',
                        }}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5"
                            style={{
                              background: isActive ? 'var(--accent-orange)' : 'var(--neu-inset-bg)',
                              color: isActive ? '#fff' : 'var(--neu-text-muted)',
                              border: '1px solid var(--neu-border)',
                            }}
                          >
                            #{q.index}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs sm:text-sm font-semibold whitespace-normal break-words leading-snug"
                              style={{
                                color: isActive
                                  ? 'var(--accent-orange-bright, var(--accent-orange))'
                                  : 'var(--neu-text-main)',
                              }}
                            >
                              {q.text}
                            </p>
                            <span
                              className="inline-block text-[10px] font-medium text-muted mt-0.5 tracking-wider uppercase"
                            >
                              {q.category}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 self-center">
                          {isActive ? (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
                              style={{
                                background: 'color-mix(in srgb, var(--accent-orange) 18%, transparent)',
                                color: 'var(--accent-orange-bright, var(--accent-orange))',
                                border: '1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)',
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetActiveQuote(q);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-muted hover:text-accent-primary transition-all opacity-75 group-hover:opacity-100"
                              style={{
                                background: 'var(--neu-inset-bg)',
                                border: '1px solid var(--neu-border)',
                              }}
                            >
                              Set Active
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--neu-border)] text-xs text-muted">
                  <span>
                    Page {quotePage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={quotePage <= 1}
                      onClick={() => setQuotePage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        background: 'var(--neu-card-bg)',
                        border: '1px solid var(--neu-border)',
                        boxShadow: 'var(--neu-shadow-raised)',
                      }}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <button
                      type="button"
                      disabled={quotePage >= totalPages}
                      onClick={() => setQuotePage((p) => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        background: 'var(--neu-card-bg)',
                        border: '1px solid var(--neu-border)',
                        boxShadow: 'var(--neu-shadow-raised)',
                      }}
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Add Your Own Motivational Quote */}
          <div className="notebook-settings-card p-6">
            <div className="notebook-header-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PenLine className="w-5 h-5 text-accent-primary" />
                <div>
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    Add Your Own Motivational Quote
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: 'var(--neu-inset-bg)',
                        color: 'var(--accent-orange-bright, var(--accent-orange))',
                        border: '1px solid var(--neu-border)',
                      }}
                    >
                      {userCustomQuotes.length} Custom
                    </span>
                  </h3>
                  <p className="text-xs text-muted">
                    Write your personal study mantras and display them directly on your dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Live Dashboard Preview for User Custom Quote */}
            <div className="mb-6 pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
                  Live Dashboard Preview (Personal Quote Banner)
                </span>
                <span className="text-[11px] text-muted">
                  Displays at the top of your dashboard quotes section
                </span>
              </div>
              <div
                className="p-3 sm:p-4 rounded-2xl transition-all duration-300"
                style={{
                  background: 'var(--neu-inset-bg)',
                  border: '1px dashed var(--neu-border)',
                }}
              >
                <UserMotivationQuoteBanner isPreview={true} />
              </div>
            </div>

            {/* User Quote Display on Dashboard Toggle */}
            <div
              className="mb-6 p-3.5 rounded-xl flex items-center justify-between gap-3"
              style={{
                background: 'var(--neu-inset-bg)',
                border: '1px solid var(--neu-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: (settings.showUserQuoteBanner !== false)
                      ? 'color-mix(in srgb, var(--accent-orange) 20%, transparent)'
                      : 'var(--neu-card-bg)',
                    color: (settings.showUserQuoteBanner !== false)
                      ? 'var(--accent-orange)'
                      : 'var(--neu-text-muted)',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-main">
                    {(settings.showUserQuoteBanner !== false)
                      ? 'User Quote Banner is Visible on Dashboard'
                      : 'User Quote Banner is Hidden on Dashboard'}
                  </h4>
                  <p className="text-[11px] text-muted">
                    {(settings.showUserQuoteBanner !== false)
                      ? 'Displaying your personal custom motivation card on your dashboard.'
                      : 'Turned off. This quote is currently hidden on your dashboard.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = settings.showUserQuoteBanner === false;
                  setSettings((prev) => ({ ...prev, showUserQuoteBanner: nextVal }));
                  dispatch({
                    type: 'UPDATE_SETTINGS',
                    payload: { showUserQuoteBanner: nextVal },
                  });
                  showToast(nextVal ? 'User Quote banner enabled ✨' : 'User Quote banner hidden', 'info');
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-300 active:scale-95"
                style={{
                  background: (settings.showUserQuoteBanner !== false)
                    ? 'color-mix(in srgb, var(--accent-orange) 18%, var(--neu-card-bg))'
                    : 'var(--neu-card-bg)',
                  border: (settings.showUserQuoteBanner !== false)
                    ? '1.5px solid var(--accent-orange)'
                    : '1px solid var(--neu-border)',
                  color: (settings.showUserQuoteBanner !== false)
                    ? 'var(--accent-orange-bright, var(--accent-orange))'
                    : 'var(--neu-text-muted)',
                  boxShadow: (settings.showUserQuoteBanner !== false)
                    ? '0 0 14px color-mix(in srgb, var(--accent-orange) 35%, transparent)'
                    : 'none',
                }}
              >
                {(settings.showUserQuoteBanner !== false) ? 'Display: ON' : 'Display: OFF'}
              </button>
            </div>

            {/* Add Custom Quote Form */}
            <form
              onSubmit={handleAddCustomQuote}
              className="p-4 rounded-2xl space-y-3 mb-6 transition-all"
              style={{
                background: 'var(--neu-inset-bg)',
                border: '1.5px solid color-mix(in srgb, var(--accent-orange) 45%, var(--neu-border))',
                boxShadow: '0 0 16px color-mix(in srgb, var(--accent-orange) 14%, transparent)',
              }}
            >
              <div>
                <label className="text-xs font-bold text-main block mb-1">
                  Your Motivational Quote *
                </label>
                <textarea
                  rows={2}
                  value={customQuoteText}
                  onChange={(e) => setCustomQuoteText(e.target.value)}
                  placeholder="e.g. Master the fundamentals and the complex becomes simple."
                  className="w-full px-3 py-2 rounded-xl text-main text-xs sm:text-sm focus:outline-none resize-none font-medium"
                  style={{
                    background: 'var(--neu-card-bg)',
                    boxShadow: 'var(--neu-shadow-inset)',
                    border: '1px solid var(--neu-border)',
                    color: 'var(--neu-text-main)',
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-medium text-muted block mb-1">
                    Author / Attribution (Optional)
                  </label>
                  <input
                    type="text"
                    value={customQuoteAuthor}
                    onChange={(e) => setCustomQuoteAuthor(e.target.value)}
                    placeholder="e.g. Aditya, Marcus Aurelius, Unknown"
                    className="w-full px-3 py-2 rounded-xl text-main text-xs focus:outline-none"
                    style={{
                      background: 'var(--neu-card-bg)',
                      boxShadow: 'var(--neu-shadow-inset)',
                      border: '1px solid var(--neu-border)',
                      color: 'var(--neu-text-main)',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold text-white bg-accent-primary hover:brightness-110 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add & Set Active on Dashboard
                </button>
              </div>
            </form>

            {/* User Custom Quotes List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Your Custom Motivation Quotes ({userCustomQuotes.length})
                </span>
                <span className="text-[11px] text-muted">
                  Click any quote to set it as active on your dashboard
                </span>
              </div>

              {userCustomQuotes.length === 0 ? (
                <div
                  className="py-8 text-center rounded-xl"
                  style={{ background: 'var(--neu-inset-bg)', border: '1px dashed var(--neu-border)' }}
                >
                  <PenLine className="w-7 h-7 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted font-medium">No custom quotes created yet</p>
                  <p className="text-[11px] text-muted opacity-75 mt-0.5">
                    Write your favorite quote above to store it and display it on your Dashboard
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userCustomQuotes.map((quote) => {
                    const isActive = settings.activeQuoteId === quote.id || settings.activeQuoteText === quote.text;
                    const isEditing = editingCustomId === quote.id;

                    if (isEditing) {
                      return (
                        <div
                          key={quote.id}
                          className="p-3.5 rounded-xl space-y-3"
                          style={{
                            background: 'var(--neu-card-bg)',
                            border: '1.5px solid var(--accent-orange)',
                            boxShadow: '0 0 14px color-mix(in srgb, var(--accent-orange) 22%, transparent)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-accent-primary">Editing Custom Quote</span>
                            <button
                              type="button"
                              onClick={handleCancelEditCustom}
                              className="p-1 text-muted hover:text-main"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={editCustomText}
                            onChange={(e) => setEditCustomText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-main text-xs sm:text-sm focus:outline-none resize-none font-medium"
                            style={{
                              background: 'var(--neu-inset-bg)',
                              boxShadow: 'var(--neu-shadow-inset)',
                              border: '1px solid var(--neu-border)',
                              color: 'var(--neu-text-main)',
                            }}
                          />
                          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                            <input
                              type="text"
                              value={editCustomAuthor}
                              onChange={(e) => setEditCustomAuthor(e.target.value)}
                              placeholder="Author / Attribution..."
                              className="w-full sm:max-w-xs px-3 py-1.5 rounded-xl text-main text-xs focus:outline-none"
                              style={{
                                background: 'var(--neu-inset-bg)',
                                boxShadow: 'var(--neu-shadow-inset)',
                                border: '1px solid var(--neu-border)',
                                color: 'var(--neu-text-main)',
                              }}
                            />
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleSaveEditCustom(quote.id)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-accent-primary hover:brightness-110 cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <Save className="w-3.5 h-3.5" /> Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditCustom}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-main cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={quote.id}
                        onClick={() => handleSetActiveQuote(quote)}
                        className={`group flex items-start justify-between p-3.5 rounded-xl gap-3 transition-all cursor-pointer ${
                          isActive ? 'border-[1.5px]' : 'hover:border-[var(--accent-orange)]'
                        }`}
                        style={{
                          background: 'var(--neu-card-bg)',
                          boxShadow: isActive
                            ? '0 0 16px color-mix(in srgb, var(--accent-orange) 24%, transparent), var(--neu-shadow-raised)'
                            : 'var(--neu-shadow-raised)',
                          borderColor: isActive
                            ? 'color-mix(in srgb, var(--accent-orange) 65%, var(--neu-border))'
                            : 'var(--neu-border)',
                        }}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isActive
                                ? 'bg-accent-primary text-white shadow-sm'
                                : 'text-muted group-hover:text-accent-primary'
                            }`}
                            style={{
                              background: isActive ? 'var(--accent-orange)' : 'var(--neu-inset-bg)',
                              border: '1px solid var(--neu-border)',
                            }}
                          >
                            <Quote className="w-3 h-3" />
                          </div>

                          <div className="min-w-0 flex-1">
                            {isActive && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1"
                                style={{
                                  background: 'color-mix(in srgb, var(--accent-orange) 18%, transparent)',
                                  color: 'var(--accent-orange-bright, var(--accent-orange))',
                                  border: '1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)',
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                                Active on Dashboard
                              </span>
                            )}
                            <p
                              className="text-xs sm:text-sm font-semibold whitespace-normal break-words leading-relaxed"
                              style={{
                                color: isActive
                                  ? 'var(--accent-orange-bright, var(--accent-orange))'
                                  : 'var(--neu-text-main)',
                              }}
                            >
                              {quote.text}
                            </p>
                            {quote.author && (
                              <p className="text-[11px] text-muted mt-1 font-medium">
                                — {quote.author}
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleSetActiveQuote(quote)}
                              title="Set as active on Dashboard"
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-muted hover:text-accent-primary transition-all opacity-80 group-hover:opacity-100"
                              style={{
                                background: 'var(--neu-inset-bg)',
                                border: '1px solid var(--neu-border)',
                              }}
                            >
                              Set Active
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEditCustom(quote)}
                            title="Edit this custom quote"
                            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-inset-bg)] cursor-pointer transition-all active:scale-95"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCustomQuote(quote.id)}
                            title="Delete custom quote"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Archived Plans Section */}
          {(() => {
            const archivedPlans = (state.plans || []).filter((p) => p.archived);
            return (
              <div className="notebook-settings-card p-6">
                <div className="notebook-header-line flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Archive className="w-5 h-5 text-accent-primary" />
                    <div>
                      <h3 className="text-sm font-bold text-main flex items-center gap-2">
                        Archived Plans
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--neu-inset-bg)', color: 'var(--neu-text-muted)', border: '1px solid var(--neu-border)' }}>
                          {archivedPlans.length}
                        </span>
                      </h3>
                      <p className="text-xs text-muted">View plans you've archived and restore or permanently remove them</p>
                    </div>
                  </div>
                </div>

                {archivedPlans.length === 0 ? (
                  <div className="py-8 text-center rounded-xl" style={{ background: 'var(--neu-inset-bg)', border: '1px dashed var(--neu-border)' }}>
                    <Archive className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted font-medium">No archived plans</p>
                    <p className="text-[11px] text-muted opacity-75 mt-0.5">Plans you archive from the Study Plans page will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {archivedPlans.map((plan) => {
                      const totalTasks = (plan.months || []).reduce((acc, m) =>
                        acc + (m.weeks || []).reduce((wAcc, w) =>
                          wAcc + (w.days || []).reduce((dAcc, d) => dAcc + (d.tasks || []).length, 0), 0), 0);

                      return (
                        <div
                          key={plan.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl gap-3 transition-all"
                          style={{
                            background: 'var(--neu-card-bg)',
                            boxShadow: 'var(--neu-shadow-raised)',
                            border: '1px solid var(--neu-border)',
                          }}
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div
                              className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 sm:mt-0"
                              style={{ background: plan.color || 'var(--accent-primary)' }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-main truncate">{plan.name}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-medium text-muted uppercase tracking-wider" style={{ background: 'var(--neu-inset-bg)' }}>
                                  {plan.category || 'general'}
                                </span>
                              </div>
                              {plan.description && (
                                <p className="text-xs text-muted truncate mt-0.5 max-w-md">{plan.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted">
                                <span>{plan.months?.length || 0} Months</span>
                                <span>•</span>
                                <span>{totalTasks} Tasks</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleUnarchivePlan(plan)}
                              title="Remove from archived and restore to active plans"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-accent-primary hover:brightness-110 cursor-pointer transition-all active:scale-95"
                              style={{
                                background: 'var(--neu-card-bg)',
                                boxShadow: '2px 2px 5px rgba(163, 177, 198, 0.4), -2px -2px 5px rgba(255, 255, 255, 0.8)',
                                border: '1px solid var(--neu-border)'
                              }}
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" />
                              Remove from Archive
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteArchivedPlan(plan)}
                              title="Delete plan permanently"
                              className="flex items-center justify-center p-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-all active:scale-95"
                              style={{
                                background: 'var(--neu-card-bg)',
                                boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.7)',
                                border: '1px solid var(--neu-border)'
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Right Column: Animations, Data Management, Danger Zone (Notebook Ruled Sidebar) */}
        <div className="w-full xl:w-96 space-y-6 shrink-0">
          {/* Animation & Motion */}
          <div className="notebook-settings-card p-6">
            <div className="notebook-header-line">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-accent-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-main">Animation & Motion</h3>
                    <p className="text-xs text-muted">Customize how fast interface animations and transitions feel throughout Study Flow.</p>
                  </div>
                </div>
                <button
                  type="button"
                  title={currentSpeedLevel > 0 ? 'Turn animations off' : 'Turn animations on'}
                  onClick={() => handleSpeedChange(currentSpeedLevel > 0 ? 0 : 3)}
                  className="w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors shrink-0"
                  style={{
                    background: 'var(--neu-card-bg)',
                    boxShadow: currentSpeedLevel > 0
                      ? 'inset 2px 2px 4px rgba(163, 177, 198, 0.6), inset -2px -2px 4px rgba(255, 255, 255, 0.9)'
                      : '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded-full transition-transform ${
                      currentSpeedLevel > 0 ? 'translate-x-5 bg-[#38a169]' : 'bg-[#a0aec0]'
                    }`}
                    style={{ boxShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Animation Speed Status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Animation Speed</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-bold text-main">
                      {currentSpeedConfig.label}
                    </span>
                    <span
                      className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md text-accent-primary"
                      style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)' }}
                    >
                      {currentSpeedConfig.speedText}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-muted">
                  Level {currentSpeedLevel} / 6
                </span>
              </div>

              {/* Stepper Controls: [ - ] Decrease | Current Speed | [ + ] Increase */}
              <div
                className="flex items-center justify-between gap-2 p-1.5 rounded-2xl"
                style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)' }}
              >
                <button
                  type="button"
                  disabled={currentSpeedLevel <= 0}
                  onClick={handleDecrease}
                  title="Decrease animation speed"
                  aria-label="Decrease animation speed"
                  className="precision-press-btn w-9 h-9 rounded-xl flex items-center justify-center text-main cursor-pointer"
                  style={{
                    background: 'var(--neu-card-bg)',
                    boxShadow: currentSpeedLevel <= 0 ? 'none' : '2px 2px 5px rgba(163, 177, 198, 0.5), -2px -2px 5px rgba(255, 255, 255, 0.85)',
                    border: '1px solid var(--neu-border)'
                  }}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 text-center py-0.5 px-2">
                  <div className="text-xs font-bold text-main">
                    {currentSpeedConfig.label}
                  </div>
                  <div className="text-[10px] text-muted truncate">
                    {currentSpeedConfig.description}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={currentSpeedLevel >= 6}
                  onClick={handleIncrease}
                  title="Increase animation speed"
                  aria-label="Increase animation speed"
                  className="precision-press-btn w-9 h-9 rounded-xl flex items-center justify-center text-main cursor-pointer"
                  style={{
                    background: 'var(--neu-card-bg)',
                    boxShadow: currentSpeedLevel >= 6 ? 'none' : '2px 2px 5px rgba(163, 177, 198, 0.5), -2px -2px 5px rgba(255, 255, 255, 0.85)',
                    border: '1px solid var(--neu-border)'
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Visual Motion Dial / Step Indicators */}
              <div className="pt-0.5">
                <div className="flex justify-between items-center mb-1 px-1">
                  <span className="text-[10px] text-muted font-medium">Off</span>
                  <span className="text-[10px] text-muted font-medium">Fast</span>
                  <span className="text-[10px] text-muted font-medium">Normal</span>
                  <span className="text-[10px] text-muted font-medium">Slow</span>
                  <span className="text-[10px] text-muted font-medium">V.Slow</span>
                </div>
                <div className="relative flex items-center justify-between p-1.5 rounded-xl motion-dial-track">
                  {ANIMATION_SPEED_LEVELS.map((lvl) => {
                    const isCurrent = lvl.level === currentSpeedLevel;
                    return (
                      <button
                        key={lvl.level}
                        type="button"
                        onClick={() => handleSpeedChange(lvl.level)}
                        title={`${lvl.label} (${lvl.speedText})`}
                        className={`group relative flex items-center justify-center w-6 h-6 rounded-lg cursor-pointer transition-all duration-150 ${
                          isCurrent ? 'scale-110 font-bold' : 'text-muted hover:text-main'
                        }`}
                        style={
                          isCurrent
                            ? {
                                background: 'var(--accent-primary)',
                                color: '#ffffff',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                              }
                            : {}
                        }
                      >
                        <span className={`text-[10px] ${isCurrent ? 'text-white' : ''}`}>
                          {lvl.level}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Animation Style Selector */}
              <div className="pt-2 border-t border-[var(--neu-border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Animation Style</span>
                    <span className="text-[10px] text-muted">Behavior, easing & visual character</span>
                  </div>
                  <span
                    className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md text-accent-primary"
                    style={{ background: 'var(--neu-card-bg)', boxShadow: 'var(--neu-shadow-inset)' }}
                  >
                    {currentStyleConfig.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ANIMATION_STYLES.map((style) => {
                    const isSelected = style.id === currentStyleId;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => handleStyleChange(style.id)}
                        className={`p-2.5 rounded-xl flex flex-col text-left transition-all cursor-pointer border relative ${
                          isSelected
                            ? 'border-accent-primary'
                            : 'border-[var(--neu-border-subtle)] hover:border-[var(--accent-primary)]/40'
                        }`}
                        style={{
                          background: 'var(--neu-card-bg)',
                          boxShadow: isSelected
                            ? 'inset 2px 2px 4px rgba(163, 177, 198, 0.6), inset -2px -2px 4px rgba(255, 255, 255, 0.9)'
                            : '2px 2px 4px rgba(163, 177, 198, 0.35), -2px -2px 4px rgba(255, 255, 255, 0.75)',
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-0.5">
                          <span className={`text-xs font-bold ${isSelected ? 'text-accent-primary' : 'text-main'}`}>
                            {style.name}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded font-medium bg-black/5 dark:bg-white/10 text-muted">
                            {style.badge}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-accent-primary/90 mb-1">
                          {style.subtitle}
                        </span>
                        <span className="text-[9px] text-muted leading-tight line-clamp-2">
                          {style.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Reset & Preview */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetSpeed}
                  disabled={currentSpeedLevel === 3 && currentStyleId === 'smooth'}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs text-muted hover:text-main cursor-pointer precision-press-btn font-medium transition-all"
                  style={{
                    background: 'var(--neu-card-bg)',
                    boxShadow: (currentSpeedLevel === 3 && currentStyleId === 'smooth') ? 'none' : '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)',
                    border: '1px solid var(--neu-border)'
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleTriggerPreview}
                  disabled={previewing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs text-accent-primary hover:brightness-110 cursor-pointer precision-press-btn font-semibold transition-all"
                  style={{
                    background: 'var(--neu-card-bg)',
                    boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)',
                    border: '1px solid var(--neu-border)'
                  }}
                >
                  <Play className={`w-3.5 h-3.5 ${previewing ? 'animate-spin' : ''}`} />
                  {previewing ? 'Playing...' : 'Preview'}
                </button>
              </div>

              {/* Interactive Motion Sample Box */}
              <div
                ref={previewCardRef}
                className="p-3 rounded-xl border border-[var(--neu-border-subtle)] transition-all"
                style={{
                  background: 'var(--neu-inset-bg)',
                  boxShadow: 'var(--neu-shadow-inset)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-muted flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-accent-primary" /> Live Motion Sample
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-accent-primary">
                      {currentStyleConfig.subtitle}
                    </span>
                    <span className="text-[10px] font-mono text-muted">
                      ({currentSpeedConfig.speedText})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2.5">
                  <div
                    ref={(el) => (previewBadgesRef.current[0] = el)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                  >
                    {currentStyleConfig.name} Flow
                  </div>
                  <div
                    ref={(el) => (previewBadgesRef.current[1] = el)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    {currentStyleConfig.enterOffset > 0 ? `${currentStyleConfig.enterOffset}px Move` : 'Pure Fade'}
                  </div>
                  <div
                    ref={(el) => (previewBadgesRef.current[2] = el)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                  >
                    {currentStyleConfig.blurAmount !== '0px' ? `${currentStyleConfig.blurAmount} Blur` : `${currentStyleConfig.scaleFactor}x Scale`}
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                  <div
                    ref={previewProgressRef}
                    className="h-full rounded-full bg-accent-primary"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
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
