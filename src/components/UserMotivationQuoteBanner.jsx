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
    if (len <= 25) return 'text-base sm:text-lg md:text-xl font-black';
    if (len <= 55) return 'text-sm sm:text-base md:text-lg font-bold';
    if (len <= 85) return 'text-xs sm:text-sm md:text-base font-semibold';
    return 'text-xs sm:text-[13px] md:text-sm font-medium';
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
        style={{ background: 'var(--accent-orange)' }}
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
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap"
          style={{
            background: 'color-mix(in srgb, var(--accent-orange) 16%, transparent)',
            color: 'var(--accent-orange-bright, var(--accent-orange))',
            border: '1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)',
          }}
        >
          User Motivational Quote
        </span>
      </div>

      {/* Centered Quote Display Area */}
      <div className="min-w-0 flex-1 text-center px-2 z-10">
        <p
          className={`${getFontSizeClass(activeCustomText)} text-center whitespace-normal break-words leading-snug tracking-wide font-bold`}
          style={{
            color: 'var(--accent-orange-bright, var(--accent-orange))',
            textShadow: '0 0 18px color-mix(in srgb, var(--accent-orange) 45%, transparent)',
          }}
        >
          "{activeCustomText}"
        </p>

        {activeCustomAuthor && (
          <p className="text-xs sm:text-[13px] font-bold text-muted mt-1 tracking-wider uppercase text-center">
            — {activeCustomAuthor}
          </p>
        )}
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 shrink-0 z-10 self-end md:self-center">
        {userQuotes.length > 1 && (
          <button
            type="button"
            onClick={handleNextCustomQuote}
            title="Cycle to your next custom motivation quote"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold text-muted hover:text-main cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.12)',
            }}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {!isPreview && (
          <button
            type="button"
            onClick={handleGoToCustomQuotes}
            title="Add or edit your personal motivation quotes in Settings"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-muted hover:text-main cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: 'var(--neu-card-bg)',
              border: '1px solid var(--neu-border)',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.12)',
            }}
          >
            <PenLine className="w-4 h-4" style={{ color: 'var(--accent-orange)' }} />
            <span>{userQuotes.length === 0 ? 'Add Quote' : 'Edit'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
