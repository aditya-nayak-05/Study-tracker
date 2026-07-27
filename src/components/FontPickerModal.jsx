import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import { availableFonts } from '../data/fonts';
import { Type, Check, X, Sparkles } from 'lucide-react';

export default function FontPickerModal({ onClose }) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const { state, dispatch, showToast } = useStudy();
  const currentFontFamily = state.settings?.fontFamily || "'Inter', sans-serif";

  useEffect(() => {
    if (modalRef.current && backdropRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.92, y: 15, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  const handleSelectFont = (font) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { fontFamily: font.family }
    });
    showToast(`Font changed to "${font.name}" ✍️`, 'success');
    handleClose();
  };

  const handleClose = () => {
    if (modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, {
        scale: 0.92,
        opacity: 0,
        duration: 0.2,
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl neu-card overflow-hidden z-10 border border-[var(--neu-border)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--neu-border-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl brass-btn flex items-center justify-center shrink-0">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-main flex items-center gap-2">
                Choose Typography Theme
              </h2>
              <p className="text-xs text-muted">14 Curated Google Fonts (including 4 Handwritten Styles)</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-muted hover:text-main hover:bg-[var(--neu-border-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Font List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Handwritten Category Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-primary">
                Handwritten & Script (4 Fonts)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableFonts.filter(f => f.isHandwritten).map((font) => {
                const isSelected = currentFontFamily === font.family;
                return (
                  <button
                    key={font.name}
                    onClick={() => handleSelectFont(font)}
                    className={`p-4 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected ? 'binder-tab active' : 'neu-card hover:border-[var(--accent-orange)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--accent-orange)]/10 text-accent-primary border border-[var(--accent-orange)]/20">
                          Handwritten
                        </span>
                      </div>
                      <p className="text-lg font-medium text-main" style={{ fontFamily: font.family }}>
                        {font.name}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5" style={{ fontFamily: font.family }}>
                        The quick brown fox jumps...
                      </p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-accent-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Categories */}
          {['Sans-Serif', 'Serif', 'Monospace'].map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                {cat} Typography
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableFonts.filter(f => f.category === cat).map((font) => {
                  const isSelected = currentFontFamily === font.family;
                  return (
                    <button
                      key={font.name}
                      onClick={() => handleSelectFont(font)}
                      className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected ? 'binder-tab active' : 'neu-card hover:border-[var(--accent-orange)]'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-main" style={{ fontFamily: font.family }}>
                          {font.name}
                        </p>
                        <p className="text-[11px] text-muted mt-0.5" style={{ fontFamily: font.family }}>
                          StudyFlow Notebook 123
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-accent-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
