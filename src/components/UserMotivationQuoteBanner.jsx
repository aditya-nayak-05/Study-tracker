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
    if (len <= 30) return 'text-base sm:text-lg md:text-xl lg:text-2xl font-black';
    if (len <= 60) return 'text-sm sm:text-base md:text-lg lg:text-xl font-extrabold';
    if (len <= 90) return 'text-xs sm:text-sm md:text-base font-bold';
    return 'text-xs sm:text-[13px] md:text-sm font-semibold leading-relaxed';
  };

  // Determine dynamic min height based on text length
  const getMinHeightClass = (text) => {
    const len = text ? text.length : 0;
    if (len <= 40) return 'min-h-[74px] sm:min-h-[84px] md:min-h-[88px]';
    if (len <= 80) return 'min-h-[80px] sm:min-h-[92px] md:min-h-[96px]';
    return 'min-h-[90px] sm:min-h-[102px] md:min-h-[108px]';
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
      className={`group relative flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 px-4 py-4 sm:px-8 sm:py-5.5 rounded-2xl md:rounded-full ${getMinHeightClass(activeCustomText)} transition-all duration-300 w-full overflow-hidden`}
      style={{
        background: 'linear-gradient(135deg, var(--neu-card-bg) 0%, color-mix(in srgb, var(--accent-orange) 10%, var(--neu-card-bg)) 100%)',
        border: '2px sm:border-[2.5px] solid color-mix(in srgb, var(--accent-orange) 70%, var(--neu-border))',
        boxShadow: '0 0 24px color-mix(in srgb, var(--accent-orange) 22%, transparent), 0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.18)',
      }}
    >
      {/* Left Badge (Anchored on desktop, centered on mobile) */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 z-10 self-center md:self-auto md:absolute md:left-6 lg:md:left-8 md:top-1/2 md:-translate-y-1/2">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{
            background: 'color-mix(in srgb, var(--accent-orange) 18%, transparent)',
            border: '1.5px solid color-mix(in srgb, var(--accent-orange) 45%, transparent)',
            color: 'var(--accent-orange)',
            boxShadow: '0 0 12px color-mix(in srgb, var(--accent-orange) 28%, transparent)',
          }}
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span
          className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap"
          style={{
            background: 'color-mix(in srgb, var(--accent-orange) 16%, transparent)',
            color: 'var(--accent-orange-bright, var(--accent-orange))',
            border: '1px solid color-mix(in srgb, var(--accent-orange) 35%, transparent)',
          }}
        >
          User Motivational Quote
        </span>
      </div>

      {/* True Dead-Center Quote Display Area */}
      <div className="w-full flex items-center justify-center text-center px-1 sm:px-4 md:px-48 lg:px-56 xl:px-64 z-10 py-1 md:py-0">
        <p
          className={`${getFontSizeClass(activeCustomText)} text-center whitespace-normal break-words leading-snug tracking-wide font-bold`}
          style={{
            color: 'var(--accent-orange-bright, var(--accent-orange))',
            textShadow: '0 0 18px color-mix(in srgb, var(--accent-orange) 45%, transparent)',
          }}
        >
          {activeCustomText}
        </p>
      </div>

      {/* Right Action Controls (Anchored on desktop, centered on mobile) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 z-10 self-center md:self-auto md:absolute md:right-6 lg:md:right-8 md:top-1/2 md:-translate-y-1/2 flex-wrap sm:flex-nowrap">
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
