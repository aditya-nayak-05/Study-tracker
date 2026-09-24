import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';
import { DEFAULT_MOTIVATION_QUOTES } from '../context/StudyContext';
import { Sparkles, Shuffle, Settings, Quote } from 'lucide-react';

export default function MotivationQuoteBanner({ isPreview = false }) {
  const { state, dispatch, showToast } = useStudy();
  const navigate = useNavigate();
  const [isRotating, setIsRotating] = useState(false);

  const quotes = state.settings?.motivationalQuotes && state.settings.motivationalQuotes.length > 0
    ? state.settings.motivationalQuotes
    : DEFAULT_MOTIVATION_QUOTES;

  const activeText = state.settings?.activeQuoteText || quotes[0]?.text || 'Small daily improvements over time lead to stunning results.';
  const activeAuthor = state.settings?.activeQuoteAuthor || quotes[0]?.author || '';

  const handleShuffle = useCallback((e) => {
    e.stopPropagation();
    if (quotes.length <= 1) {
      if (showToast) showToast('Add more quotes in Settings to shuffle!', 'info');
      return;
    }

    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 400);

    const currentIdx = quotes.findIndex((q) => q.text === activeText);
    let nextIdx = (currentIdx + 1) % quotes.length;
    // If still same index (e.g. single quote or not found), pick random
    if (nextIdx === currentIdx && quotes.length > 1) {
      nextIdx = (currentIdx + 1) % quotes.length;
    }
    const nextQuote = quotes[nextIdx];

    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        activeQuoteId: nextQuote.id,
        activeQuoteText: nextQuote.text,
        activeQuoteAuthor: nextQuote.author || '',
      },
    });

    if (showToast) {
      showToast('Switched to next motivation quote ✨', 'info');
    }
  }, [quotes, activeText, dispatch, showToast]);

  const handleGoToSettings = useCallback((e) => {
    e.stopPropagation();
    navigate('/settings');
  }, [navigate]);

  return (
    <div
      className="group relative flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300 w-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--neu-card-bg) 0%, color-mix(in srgb, var(--accent-orange) 8%, var(--neu-card-bg)) 100%)',
        border: '1.5px solid color-mix(in srgb, var(--accent-orange) 55%, var(--neu-border))',
        boxShadow: '0 0 20px color-mix(in srgb, var(--accent-orange) 22%, transparent), 0 4px 14px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
      }}
    >
      {/* Soft Ambient Inner Glow Accent */}
      <div
        className="absolute -right-8 -top-8 w-28 h-28 rounded-full pointer-events-none opacity-40 blur-2xl transition-opacity group-hover:opacity-75"
        style={{
          background: 'var(--accent-orange)',
        }}
      />

      <div className="flex items-center gap-3 min-w-0 flex-1 z-10">
        {/* Glowing Sparkles / Quote Pill Icon */}
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{
            background: 'color-mix(in srgb, var(--accent-orange) 16%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)',
            color: 'var(--accent-orange)',
            boxShadow: '0 0 12px color-mix(in srgb, var(--accent-orange) 25%, transparent)',
          }}
        >
          <Quote className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>

        {/* Motivation Text */}
        <div className="min-w-0 flex-1">
          <p
            className="text-xs sm:text-sm font-semibold tracking-wide leading-snug truncate sm:whitespace-normal line-clamp-1 sm:line-clamp-2"
            style={{
              color: 'var(--accent-orange-bright, var(--accent-orange))',
              textShadow: '0 0 14px color-mix(in srgb, var(--accent-orange) 35%, transparent)',
            }}
            title={activeText}
          >
            "{activeText}"
          </p>
          {activeAuthor && (
            <p className="text-[10px] sm:text-[11px] font-medium text-muted mt-0.5 tracking-wider truncate">
              — {activeAuthor}
            </p>
          )}
        </div>
      </div>

      {/* Actions (Shuffle & Customize) */}
      <div className="flex items-center gap-1.5 shrink-0 z-10">
        <button
          type="button"
          onClick={handleShuffle}
          title="Shuffle to next motivation quote"
          aria-label="Shuffle quote"
          className="p-1.5 sm:p-2 rounded-xl text-muted hover:text-main cursor-pointer transition-all duration-200 active:scale-90"
          style={{
            background: 'var(--neu-card-bg)',
            border: '1px solid var(--neu-border)',
            boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Shuffle
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
              isRotating ? 'rotate-180 scale-110 text-accent-primary' : ''
            }`}
            style={{ color: 'var(--accent-orange)' }}
          />
        </button>

        {!isPreview && (
          <button
            type="button"
            onClick={handleGoToSettings}
            title="Edit motivation quotes in Settings"
            aria-label="Edit quotes in Settings"
            className="p-1.5 sm:p-2 rounded-xl text-muted hover:text-main cursor-pointer transition-all duration-200 active:scale-90"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--accent-orange)' }} />
          </button>
        )}
      </div>
    </div>
  );
}
