import React from 'react';
import { X } from 'lucide-react';
import { themes } from '../data/themes';

export default function ThemePickerModal({ isOpen, onClose, currentTheme, onSelect }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 relative neu-card max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer inset-field z-10"
        >
          <X className="w-4 h-4 text-muted" />
        </button>

        {/* Header */}
        <h2 className="text-lg font-bold text-main mb-1">Color Theme</h2>
        <p className="text-xs text-muted mb-4">Select from 16 curated color themes</p>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
          {themes.map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelect(theme.id);
                  onClose();
                }}
                className={`relative p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
                  isActive
                    ? 'ring-2 ring-[var(--accent-orange)] scale-[1.02]'
                    : 'hover:scale-[1.02]'
                }`}
                style={{
                  background: theme.swatches[0],
                  border: isActive
                    ? '2px solid var(--accent-orange)'
                    : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Swatch Row */}
                <div className="flex justify-center gap-1.5 mb-3">
                  {theme.swatches.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-white/20"
                      style={{ background: color }}
                    />
                  ))}
                </div>

                {/* Label */}
                <div className="flex items-center justify-center gap-1.5 text-center">
                  <span className="text-sm">{theme.icon}</span>
                  <span
                    className="text-xs font-bold text-center"
                    style={{
                      color: theme.id === 'light' ? '#1a202c' : '#f5f5f7',
                    }}
                  >
                    {theme.name}
                  </span>
                </div>

                {/* Active Check */}
                {isActive && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: 'var(--accent-orange)',
                      color: 'var(--accent-btn-text)',
                    }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
