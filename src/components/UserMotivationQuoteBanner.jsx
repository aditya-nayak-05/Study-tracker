import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';
import { Sparkles, PenLine, ChevronRight, Quote, Plus } from 'lucide-react';

export default function UserMotivationQuoteBanner({ isPreview = false }) {
  const { state, dispatch } = useStudy();
  const navigate = useNavigate();

  const settings = state.settings || {};
  const userQuotes = Array.isArray(settings.userCustomQuotes) ? settings.userCustomQuotes : [];

  // Active custom quote text & author
  const activeCustomText =
    settings.activeCustomQuoteText ||
    userQuotes[0]?.text ||
    'Master the fundamentals and the complex becomes simple.';

  const activeCustomAuthor =
    settings.activeCustomQuoteAuthor ||
    userQuotes[0]?.author ||
    state.profile?.name ||
    'Personal Mantra';

  // Adaptive font sizing based on length to ensure full display without cutoffs
  const getFontSizeClass = (text) => {
    const len = text ? text.length : 0;
    if (len <= 25) return 'text-sm sm:text-base md:text-lg font-bold';
    if (len <= 55) return 'text-xs sm:text-sm md:text-base font-semibold';
    if (len <= 85) return 'text-xs sm:text-[13px] md:text-sm font-semibold';
    return 'text-[11px] sm:text-xs md:text-[13px] font-medium';
  };

  const handleGoToCustomQuotes = useCallback((e) => {
    e.stopPropagation();
    navigate('/settings');
  }, [navigate]);

  // Cycle through custom quotes if user has more than 1
  const handleNextCustomQuote = useCallback((e) => {
    e.stopPropagation();
    if (userQuotes.length <= 1) {
      navigate('/settings');
      return;
    }
    const currentIdx = userQuotes.findIndex((q) => q.text === activeCustomText);
    const nextIdx = (currentIdx + 1) % userQuotes.length;
    const nextQuote = userQuotes[nextIdx];
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        activeCustomQuoteId: nextQuote.id,
        activeCustomQuoteText: nextQuote.text,
        activeCustomQuoteAuthor: nextQuote.author || '',
      },
    });
  }, [userQuotes, activeCustomText, dispatch, navigate]);

  return (
    <div
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl transition-all duration-300 w-full"
      style={{
        background: 'linear-gradient(135deg, var(--neu-card-bg) 0%, color-mix(in srgb, var(--accent-orange) 8%, var(--neu-card-bg)) 100%)',
        border: '1.5px solid color-mix(in srgb, var(--accent-orange) 55%, var(--neu-border))',
        boxShadow: '0 0 20px color-mix(in srgb, var(--accent-orange) 20%, transparent), 0 4px 14px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
      }}
    >
      {/* Soft Ambient Inner Glow Accent */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none opacity-35 blur-2xl transition-opacity group-hover:opacity-70"
        style={{ background: 'var(--accent-orange)' }}
      />

      {/* Quote Display Area */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 z-10">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-transform group-hover:scale-105"
          style={{
            background: 'color-mix(in srgb, var(--accent-orange) 16%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)',
            color: 'var(--accent-orange)',
            boxShadow: '0 0 12px color-mix(in srgb, var(--accent-orange) 25%, transparent)',
          }}
        >
          <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                background: 'color-mix(in srgb, var(--accent-orange) 15%, transparent)',
                color: 'var(--accent-orange-bright, var(--accent-orange))',
                border: '1px solid color-mix(in srgb, var(--accent-orange) 30%, transparent)',
              }}
            >
              My Motivation
            </span>
          </div>

          <p
            className={`${getFontSizeClass(activeCustomText)} whitespace-normal break-words leading-snug tracking-wide`}
            style={{
              color: 'var(--accent-orange-bright, var(--accent-orange))',
              textShadow: '0 0 14px color-mix(in srgb, var(--accent-orange) 35%, transparent)',
            }}
          >
            "{activeCustomText}"
          </p>

          {activeCustomAuthor && (
            <p className="text-[10px] sm:text-[11px] font-medium text-muted mt-1 tracking-wider uppercase">
              — {activeCustomAuthor}
            </p>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center z-10">
        {userQuotes.length > 1 && (
          <button
            type="button"
            onClick={handleNextCustomQuote}
            title="Cycle to your next custom motivation quote"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-main cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.12)',
            }}
          >
            <span>Next Quote</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {!isPreview && (
          <button
            type="button"
            onClick={handleGoToCustomQuotes}
            title="Add or edit your personal motivation quotes in Settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-main cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.12)',
            }}
          >
            <PenLine className="w-3.5 h-3.5" style={{ color: 'var(--accent-orange)' }} />
            <span>{userQuotes.length === 0 ? 'Add Your Quote' : 'Edit My Quote'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
