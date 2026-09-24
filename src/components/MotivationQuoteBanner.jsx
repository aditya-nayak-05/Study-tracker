import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';
import { SIX_HUNDRED_QUOTES, getRandomQuote } from '../data/motivationQuotes';
import { Quote, Shuffle, Calendar, Settings, Sparkles, Lock, Check } from 'lucide-react';

export default function MotivationQuoteBanner({ isPreview = false }) {
  const { state, dispatch, showToast } = useStudy();
  const navigate = useNavigate();
  const [isRotating, setIsRotating] = useState(false);

  const settings = state.settings || {};
  const activeText = settings.activeQuoteText || SIX_HUNDRED_QUOTES[0]?.text || 'Study now. Shine later.';
  const activeAuthor = settings.activeQuoteAuthor || settings.activeQuoteCategory || 'STUDY & EDUCATION';
  const activeId = settings.activeQuoteId || SIX_HUNDRED_QUOTES[0]?.id;
  const dailyQuoteChangeEnabled = settings.dailyQuoteChangeEnabled !== false;

  // Determine dynamic font size based on text length to ensure full display on screen
  const getFontSizeClass = (text) => {
    const len = text ? text.length : 0;
    if (len <= 25) return 'text-base sm:text-lg md:text-xl font-black';
    if (len <= 55) return 'text-sm sm:text-base md:text-lg font-bold';
    if (len <= 85) return 'text-xs sm:text-sm md:text-base font-semibold';
    return 'text-xs sm:text-[13px] md:text-sm font-medium';
  };

  // Toggle Daily Quote Change ON / OFF
  const handleToggleDaily = useCallback((e) => {
    e.stopPropagation();
    const nextVal = !dailyQuoteChangeEnabled;
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { dailyQuoteChangeEnabled: nextVal },
    });
    if (showToast) {
      showToast(
        nextVal
          ? 'Daily auto-change is ON: Quotes change automatically every day ✨'
          : 'Daily auto-change is OFF: Quote locked and will not change daily 🔒',
        nextVal ? 'success' : 'info'
      );
    }
  }, [dailyQuoteChangeEnabled, dispatch, showToast]);

  // Pick a truly random quote from the 600 quotes
  const handleRandomQuote = useCallback((e) => {
    e.stopPropagation();
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 450);

    const random = getRandomQuote(SIX_HUNDRED_QUOTES, activeId);
    if (!random) return;

    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        activeQuoteId: random.id,
        activeQuoteText: random.text,
        activeQuoteAuthor: random.category || random.author || 'StudyFlow Motivation',
        activeQuoteCategory: random.category || '',
      },
    });

    if (showToast) {
      showToast(
        `Random Quote #${random.index || ''}: "${random.text}" (${random.category || 'Motivation'}) ✨`,
        'success'
      );
    }
  }, [activeId, dispatch, showToast]);

  const handleGoToSettings = useCallback((e) => {
    e.stopPropagation();
    navigate('/settings');
  }, [navigate]);

  return (
    <div
      className="group relative flex flex-col md:flex-row items-center justify-between gap-4 px-6 sm:px-10 py-5 sm:py-6.5 rounded-3xl md:rounded-full min-h-[96px] sm:min-h-[104px] transition-all duration-300 w-full"
      style={{
        background: 'linear-gradient(135deg, var(--neu-card-bg) 0%, color-mix(in srgb, var(--accent-orange) 12%, var(--neu-card-bg)) 100%)',
        border: '2.5px solid color-mix(in srgb, var(--accent-orange) 70%, var(--neu-border))',
        boxShadow: '0 0 28px color-mix(in srgb, var(--accent-orange) 28%, transparent), 0 6px 20px rgba(0, 0, 0, 0.14), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Soft Ambient Inner Glow Accent */}
      <div
        className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none opacity-45 blur-3xl transition-opacity group-hover:opacity-85"
        style={{
          background: 'var(--accent-orange)',
        }}
      />

      {/* Left Badge */}
      <div className="flex items-center gap-3 shrink-0 z-10 self-start md:self-center">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{
            background: 'color-mix(in srgb, var(--accent-orange) 18%, transparent)',
            border: '1.5px solid color-mix(in srgb, var(--accent-orange) 45%, transparent)',
            color: 'var(--accent-orange)',
            boxShadow: '0 0 14px color-mix(in srgb, var(--accent-orange) 30%, transparent)',
          }}
        >
          <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap"
            style={{
              background: 'color-mix(in srgb, var(--accent-orange) 16%, transparent)',
              color: 'var(--accent-orange-bright, var(--accent-orange))',
              border: '1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)',
            }}
          >
            Motivational Quote
          </span>
          {activeId && activeId.startsWith('q_') && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: 'var(--neu-inset-bg)',
                color: 'var(--neu-text-muted)',
                border: '1px solid var(--neu-border)',
              }}
            >
              #{activeId.replace('q_', '')}
            </span>
          )}
        </div>
      </div>

      {/* Centered Quote Display Area */}
      <div className="min-w-0 flex-1 text-center px-2 z-10">
        <p
          className={`${getFontSizeClass(activeText)} text-center whitespace-normal break-words leading-snug tracking-wide font-bold`}
          style={{
            color: 'var(--accent-orange-bright, var(--accent-orange))',
            textShadow: '0 0 18px color-mix(in srgb, var(--accent-orange) 45%, transparent)',
          }}
        >
          "{activeText}"
        </p>
        {activeAuthor && (
          <p className="text-xs sm:text-[13px] font-bold text-muted mt-1 tracking-wider uppercase text-center">
            — {activeAuthor}
          </p>
        )}
      </div>

      {/* Action Controls: Daily Toggle, Random 600 Button, Settings */}
      <div className="flex items-center gap-2 shrink-0 z-10 self-end md:self-center flex-wrap sm:flex-nowrap">
        {/* Daily Auto-Change ON / OFF Toggle */}
        <button
          type="button"
          onClick={handleToggleDaily}
          title={
            dailyQuoteChangeEnabled
              ? 'Daily Auto-Change is ON: Quote changes daily. Click to lock this quote.'
              : 'Daily Auto-Change is OFF: Quote will NOT change daily. Click to enable daily quotes.'
          }
          aria-label="Toggle daily quote change"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-95"
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
              ? '0 0 12px color-mix(in srgb, var(--accent-orange) 22%, transparent)'
              : '2px 2px 4px rgba(0, 0, 0, 0.12)',
          }}
        >
          {dailyQuoteChangeEnabled ? (
            <>
              <Calendar className="w-4 h-4 text-accent-primary" />
              <span>Daily: ON</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 opacity-70" />
              <span>Daily: OFF</span>
            </>
          )}
        </button>

        {/* Random Quote From 600 Quotes Button */}
        <button
          type="button"
          onClick={handleRandomQuote}
          title="Get a random quote from 600 powerful motivation quotes"
          aria-label="Random quote"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-muted hover:text-main cursor-pointer transition-all duration-200 active:scale-90"
          style={{
            background: 'var(--neu-card-bg)',
            border: '1px solid var(--neu-border)',
            boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Shuffle
            className={`w-4 h-4 transition-transform duration-400 ${
              isRotating ? 'rotate-180 scale-125' : ''
            }`}
            style={{ color: 'var(--accent-orange)' }}
          />
          <span className="hidden sm:inline">Random</span>
        </button>

        {/* Settings Jump Button */}
        {!isPreview && (
          <button
            type="button"
            onClick={handleGoToSettings}
            title="Browse all 600 quotes and add your own in Settings"
            aria-label="Motivation settings"
            className="p-2 sm:p-2.5 rounded-xl text-muted hover:text-main cursor-pointer transition-all duration-200 active:scale-90"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color: 'var(--accent-orange)' }} />
          </button>
        )}
      </div>
    </div>
  );
}
