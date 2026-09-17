import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import gsap from 'gsap';

/**
 * ═══════════════════════════════════════════════════════════════════
 *  STUDY FLOW — CENTRAL MOTION CONFIGURATION & ANIMATION UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const ANIMATION_SPEED_LEVELS = [
  { level: 0, label: 'Off', multiplier: 0, speedText: '0x', description: 'Instantaneous UI responses with zero transitions' },
  { level: 1, label: 'Very Fast', multiplier: 0.5, speedText: '0.5x', description: 'Rapid, ultra-responsive transitions' },
  { level: 2, label: 'Fast', multiplier: 0.75, speedText: '0.75x', description: 'Snappy and crisp motion' },
  { level: 3, label: 'Normal', multiplier: 1.0, speedText: '1.0x', description: 'Balanced, standard smooth motion (Default)' },
  { level: 4, label: 'Relaxed', multiplier: 1.25, speedText: '1.25x', description: 'Gentle, calm and smooth pace' },
  { level: 5, label: 'Slow', multiplier: 1.6, speedText: '1.6x', description: 'Pronounced, deliberate easing' },
  { level: 6, label: 'Very Slow', multiplier: 2.0, speedText: '2.0x', description: 'Maximum visual duration and flow' },
];

export const ANIMATION_STYLES = [
  {
    id: 'smooth',
    name: 'Smooth',
    subtitle: 'Smooth Flow',
    description: 'Balanced easing, subtle translation, and gentle scale. Ideal for everyday productivity.',
    badge: 'Default',
    ease: 'power3.out',
    enterOffset: 14,
    scaleFactor: 0.985,
    blurAmount: '0px',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    subtitle: 'Elegant Reveal',
    description: 'Poised and refined entrance with soft fade, micro-blur dissolve, and gentle elevation.',
    badge: 'Refined',
    ease: 'power3.out',
    enterOffset: 8,
    scaleFactor: 0.99,
    blurAmount: '2px',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    subtitle: 'Minimal Motion',
    description: 'Ultra-subtle displacement and mostly pure opacity fade. Fast feedback for high-speed focus.',
    badge: 'Subtle',
    ease: 'power2.out',
    enterOffset: 4,
    scaleFactor: 1.0,
    blurAmount: '0px',
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    subtitle: 'Dynamic Flow',
    description: 'Crisp, punchy visual feedback with controlled scale and distinct motion presence.',
    badge: 'Responsive',
    ease: 'expo.out',
    enterOffset: 18,
    scaleFactor: 0.97,
    blurAmount: '0px',
  },
  {
    id: 'slide',
    name: 'Slide',
    subtitle: 'Directional Slide',
    description: 'Clear directional movement reflecting depth, hierarchy, and back-navigation reversals.',
    badge: 'Directional',
    ease: 'power2.out',
    enterOffset: 24,
    scaleFactor: 1.0,
    blurAmount: '0px',
  },
  {
    id: 'depth',
    name: 'Depth',
    subtitle: 'Depth Elevation',
    description: 'Focused on elevation, layering, and tactile card rises that feel closer to the user.',
    badge: 'Elevated',
    ease: 'power3.out',
    enterOffset: 12,
    scaleFactor: 0.96,
    blurAmount: '0px',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    subtitle: 'Cinematic Reveal',
    description: 'Silky smooth presentation with soft blur dissolve, wide easing, and layered cascades.',
    badge: 'Cinematic',
    ease: 'power4.out',
    enterOffset: 16,
    scaleFactor: 0.98,
    blurAmount: '4px',
  },
  {
    id: 'fade',
    name: 'Fade',
    subtitle: 'Pure Fade',
    description: 'Clean, distraction-free opacity transitions without displacement or scale changes.',
    badge: 'Pure',
    ease: 'power2.out',
    enterOffset: 0,
    scaleFactor: 1.0,
    blurAmount: '0px',
  },
];

export const MOTION_STORAGE_KEY = 'studyflow-animation-speed';
export const STYLE_STORAGE_KEY = 'studyflow-animation-style';

/**
 * Retrieve the active animation speed level (0 to 6)
 */
export const getStoredSpeedLevel = () => {
  if (typeof window === 'undefined') return 3;
  try {
    const raw = localStorage.getItem(MOTION_STORAGE_KEY);
    if (raw === null) return 3;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) return parsed;
  } catch (e) {
    // fallback
  }
  return 3;
};

/**
 * Retrieve the active animation style ('smooth', 'elegant', etc.)
 */
export const getStoredStyle = () => {
  if (typeof window === 'undefined') return 'smooth';
  try {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY);
    if (raw && ANIMATION_STYLES.some((s) => s.id === raw)) {
      return raw;
    }
  } catch (e) {}
  return 'smooth';
};

/**
 * Apply the motion scale and style variables and data attributes to the document
 */
export const applyMotionScaleToDOM = (
  level = getStoredSpeedLevel(),
  style = getStoredStyle()
) => {
  if (typeof document === 'undefined') return;
  const config = ANIMATION_SPEED_LEVELS.find((l) => l.level === level) || ANIMATION_SPEED_LEVELS[3];
  const styleConfig = ANIMATION_STYLES.find((s) => s.id === style) || ANIMATION_STYLES[0];
  const root = document.documentElement;

  root.setAttribute('data-motion-level', String(config.level));
  root.setAttribute('data-motion-off', config.level === 0 ? 'true' : 'false');
  root.setAttribute('data-motion-style', styleConfig.id);
  root.style.setProperty('--motion-mult', String(config.multiplier));
  root.style.setProperty('--motion-scale', String(config.multiplier));
  root.style.setProperty('--motion-style-id', `"${styleConfig.id}"`);
  root.style.setProperty('--motion-style-offset', `${styleConfig.enterOffset}px`);
  root.style.setProperty('--motion-style-ease', styleConfig.ease);
};

/**
 * Persist the speed level to storage and apply CSS/DOM properties
 */
export const setStoredSpeedLevel = (level) => {
  const safeLevel = Math.max(0, Math.min(6, Math.round(level)));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MOTION_STORAGE_KEY, String(safeLevel));
    } catch (e) {}
  }
  applyMotionScaleToDOM(safeLevel, getStoredStyle());
  return safeLevel;
};

/**
 * Persist the animation style to storage and apply CSS/DOM properties
 */
export const setStoredStyle = (styleId) => {
  const valid = ANIMATION_STYLES.some((s) => s.id === styleId) ? styleId : 'smooth';
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STYLE_STORAGE_KEY, valid);
    } catch (e) {}
  }
  applyMotionScaleToDOM(getStoredSpeedLevel(), valid);
  return valid;
};

/**
 * Get active motion parameters combining Style, Speed, Off state, and Reduced Motion
 */
export const getMotionParams = (customStyle) => {
  const currentStyleId = customStyle || getStoredStyle();
  const styleConfig = ANIMATION_STYLES.find((s) => s.id === currentStyleId) || ANIMATION_STYLES[0];
  const mult = getSpeedMultiplier();
  const isOff = mult === 0 || isReducedMotion();

  return {
    style: styleConfig,
    styleId: styleConfig.id,
    multiplier: mult,
    isOff,
    ease: styleConfig.ease,
    enterOffset: styleConfig.enterOffset,
    scaleFactor: styleConfig.scaleFactor,
    blurAmount: isOff ? '0px' : styleConfig.blurAmount,
  };
};

// Auto-run once in browser
if (typeof window !== 'undefined') {
  try {
    applyMotionScaleToDOM(getStoredSpeedLevel(), getStoredStyle());
  } catch (e) {}
}

/**
 * Check if the user has requested reduced motion for accessibility
 */
export const isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Returns the current active multiplier
 */
export const getSpeedMultiplier = () => {
  if (isReducedMotion()) return 0;
  const level = getStoredSpeedLevel();
  const config = ANIMATION_SPEED_LEVELS.find((l) => l.level === level) || ANIMATION_SPEED_LEVELS[3];
  return config.multiplier;
};

/**
 * Calculate scaled motion duration with optional micro-interaction clamping
 */
export const getMotionDuration = (baseDuration, { min = 0.001, max = 4.0, isMicro = false } = {}) => {
  const mult = getSpeedMultiplier();
  if (mult === 0 || isReducedMotion()) return 0.001;

  let duration = baseDuration * mult;

  // Micro-interactions (hover, button press, toggles) stay crisp even at slower settings
  if (isMicro) {
    duration = Math.max(0.1, Math.min(duration, 0.32));
  } else {
    duration = Math.max(min, Math.min(duration, max));
  }

  return duration;
};

// ── Motion Timing Constants ──
export const MOTION = {
  duration: {
    micro: 0.18,     // 150-200ms: button hover, icon press, toggles
    fast: 0.22,      // 200-250ms: dropdowns, tooltips, small controls
    normal: 0.32,    // 250-350ms: cards, tabs, modals, state morphs
    medium: 0.45,    // 400-500ms: panel slides, collapse/expand
    page: 0.52,      // 450-550ms: route transitions
    major: 0.75,     // 600-800ms: initial dashboard sequence, charts
  },
  ease: {
    out: 'power2.out',
    outSmooth: 'power3.out',
    outExpo: 'expo.out',
    inOut: 'power2.inOut',
    in: 'power2.in',
    spring: 'back.out(1.3)',
  },
};

/**
 * PAGE ENTER: "Premium Directional Fade"
 * Adapts to selected Animation Style and Speed
 */
export const pageEnter = (element, direction = 'down', onComplete, customStyle) => {
  if (!element) return;
  const { isOff, ease, enterOffset, blurAmount } = getMotionParams(customStyle);
  if (isOff) {
    gsap.set(element, { opacity: 1, y: 0, scale: 1, filter: 'none', clearProps: 'all' });
    onComplete?.();
    return;
  }

  const yOffset = enterOffset === 0 ? 0 : (direction === 'up' ? -enterOffset : enterOffset);
  const dur = getMotionDuration(MOTION.duration.page);
  const filterStart = blurAmount && blurAmount !== '0px' ? `blur(${blurAmount})` : 'none';

  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: yOffset,
      filter: filterStart,
    },
    {
      opacity: 1,
      y: 0,
      filter: 'none',
      duration: dur,
      ease: ease || MOTION.ease.outSmooth,
      clearProps: 'opacity,transform,filter',
      onComplete,
    }
  );
};

/**
 * PAGE EXIT: Subtly fades and shifts in navigation direction
 */
export const pageExit = (element, direction = 'down', onComplete, customStyle) => {
  if (!element) {
    onComplete?.();
    return;
  }
  const { isOff, enterOffset } = getMotionParams(customStyle);
  if (isOff) {
    gsap.set(element, { opacity: 0 });
    onComplete?.();
    return;
  }

  const offset = enterOffset === 0 ? 0 : Math.round(enterOffset * 0.8);
  const yOffset = direction === 'up' ? offset : -offset;
  const dur = getMotionDuration(0.25);

  gsap.to(element, {
    opacity: 0,
    y: yOffset,
    duration: dur,
    ease: MOTION.ease.in,
    onComplete,
  });
};

/**
 * ROUTE TRANSITION WITH CONTENT STAGGER: "Soft Content Cascade"
 * Animates meaningful children sequentially
 */
export const contentCascade = (elements, stagger = 0.05, delay = 0.04, customStyle) => {
  if (!elements || elements.length === 0) return;
  const { isOff, ease, enterOffset, multiplier } = getMotionParams(customStyle);
  if (isOff) {
    gsap.set(elements, { opacity: 1, y: 0, clearProps: 'all' });
    return;
  }

  const dur = getMotionDuration(MOTION.duration.medium);

  gsap.fromTo(
    elements,
    { opacity: 0, y: enterOffset },
    {
      opacity: 1,
      y: 0,
      duration: dur,
      stagger: stagger * multiplier,
      delay: delay * multiplier,
      ease: ease || MOTION.ease.outSmooth,
      clearProps: 'opacity,transform',
    }
  );
};

/**
 * MODAL OPEN: "Focused Elevation"
 * Backdrop blur + modal elevation adhering to style scale & offset
 */
export const modalEnter = (backdropEl, modalEl, customStyle) => {
  const { isOff, ease, enterOffset, scaleFactor, blurAmount } = getMotionParams(customStyle);
  if (isOff) {
    if (backdropEl) gsap.set(backdropEl, { opacity: 1 });
    if (modalEl) gsap.set(modalEl, { opacity: 1, scale: 1, y: 0, filter: 'none', clearProps: 'transform,filter' });
    return;
  }

  const dur = getMotionDuration(MOTION.duration.normal);
  const filterStart = blurAmount && blurAmount !== '0px' ? `blur(${blurAmount})` : 'none';

  if (backdropEl) {
    gsap.fromTo(
      backdropEl,
      { opacity: 0 },
      { opacity: 1, duration: dur, ease: MOTION.ease.out }
    );
  }

  if (modalEl) {
    gsap.fromTo(
      modalEl,
      { opacity: 0, scale: scaleFactor, y: enterOffset, filter: filterStart },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'none',
        duration: dur,
        ease: ease || MOTION.ease.outSmooth,
        clearProps: 'transform,filter',
      }
    );
  }
};

/**
 * MODAL CLOSE: "Quiet Retreat"
 * Modal scale and fade retreat smoothly
 */
export const modalExit = (backdropEl, modalEl, onComplete, customStyle) => {
  const { isOff, multiplier } = getMotionParams(customStyle);
  if (isOff) {
    if (backdropEl) gsap.set(backdropEl, { opacity: 0 });
    if (modalEl) gsap.set(modalEl, { opacity: 0 });
    onComplete?.();
    return;
  }

  const dur = getMotionDuration(MOTION.duration.fast);
  const mult = multiplier;

  const tl = gsap.timeline({
    onComplete: () => {
      onComplete?.();
    },
  });

  if (modalEl) {
    tl.to(
      modalEl,
      {
        opacity: 0,
        scale: 0.97,
        y: 8,
        duration: dur,
        ease: MOTION.ease.in,
      },
      0
    );
  }

  if (backdropEl) {
    tl.to(
      backdropEl,
      {
        opacity: 0,
        duration: dur,
        ease: MOTION.ease.in,
      },
      0.04 * mult
    );
  }
};

/**
 * BUTTON ACTION: "Press & Release"
 */
export const pressFeedback = (element) => {
  if (!element || getSpeedMultiplier() === 0 || isReducedMotion()) return;
  const dur = getMotionDuration(MOTION.duration.micro, { isMicro: true });
  gsap.fromTo(
    element,
    { scale: 0.96 },
    { scale: 1, duration: dur, ease: MOTION.ease.out }
  );
};

/**
 * DELETE ACTION: "Soft Collapse"
 * Element scales down, fades out, and height collapses smoothly
 */
export const softCollapse = (element, onComplete) => {
  if (!element) {
    onComplete?.();
    return;
  }
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    onComplete?.();
    return;
  }

  const dur = getMotionDuration(MOTION.duration.normal);

  gsap.to(element, {
    opacity: 0,
    scale: 0.97,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: 'hidden',
    duration: dur,
    ease: MOTION.ease.inOut,
    onComplete,
  });
};

/**
 * ERROR MESSAGE: "Soft Shake"
 * Subtle horizontal movement x: 0 -> -4 -> 4 -> -2 -> 0
 */
export const softShake = (element) => {
  if (!element || getSpeedMultiplier() === 0 || isReducedMotion()) return;
  const d = (base) => getMotionDuration(base, { isMicro: true });
  gsap.timeline()
    .to(element, { x: -4, duration: d(0.06), ease: 'power1.inOut' })
    .to(element, { x: 4, duration: d(0.08), ease: 'power1.inOut' })
    .to(element, { x: -2, duration: d(0.07), ease: 'power1.inOut' })
    .to(element, { x: 0, duration: d(0.06), ease: 'power1.out', clearProps: 'x' });
};

/**
 * CREATE PLAN / SUCCESS: "Plan Genesis"
 * Newly created card enters with style-driven offset, scale, and easing
 */
export const planGenesis = (element, customStyle) => {
  if (!element) return;
  const { isOff, ease, enterOffset, scaleFactor, blurAmount } = getMotionParams(customStyle);
  if (isOff) {
    gsap.set(element, { opacity: 1, y: 0, scale: 1, filter: 'none', clearProps: 'all' });
    return;
  }

  const dur = getMotionDuration(MOTION.duration.medium);
  const filterStart = blurAmount && blurAmount !== '0px' ? `blur(${blurAmount})` : 'none';

  gsap.fromTo(
    element,
    { opacity: 0, y: enterOffset, scale: scaleFactor, filter: filterStart },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'none',
      duration: dur,
      ease: ease || MOTION.ease.outSmooth,
      clearProps: 'transform,opacity,filter',
    }
  );
};

/**
 * TASK COMPLETION: "Completion Sweep"
 * Checkbox micro-scale: 0.8 -> 1.05 -> 1
 */
export const completionSweep = (checkboxEl, customStyle) => {
  if (!checkboxEl) return;
  const { isOff, ease } = getMotionParams(customStyle);
  if (isOff) return;
  const d = (base) => getMotionDuration(base, { isMicro: true });
  gsap.timeline()
    .fromTo(checkboxEl, { scale: 0.8 }, { scale: 1.05, duration: d(0.14), ease: ease || 'power2.out' })
    .to(checkboxEl, { scale: 1, duration: d(0.12), ease: ease || 'power2.out', clearProps: 'scale' });
};

/**
 * TOAST NOTIFICATION: "Floating Notification"
 */
export const toastEnter = (element, customStyle) => {
  if (!element) return;
  const { isOff, ease, enterOffset, scaleFactor } = getMotionParams(customStyle);
  if (isOff) {
    gsap.set(element, { x: 0, opacity: 1, scale: 1, clearProps: 'transform' });
    return;
  }
  const dur = getMotionDuration(MOTION.duration.normal);
  const xOffset = enterOffset === 0 ? 0 : 20;
  gsap.fromTo(
    element,
    { x: xOffset, opacity: 0, scale: scaleFactor },
    {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: dur,
      ease: ease || MOTION.ease.outSmooth,
      clearProps: 'transform',
    }
  );
};

export const toastExit = (element, onComplete) => {
  if (!element) {
    onComplete?.();
    return;
  }
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    onComplete?.();
    return;
  }
  const dur = getMotionDuration(MOTION.duration.fast);
  gsap.to(element, {
    x: 10,
    opacity: 0,
    scale: 0.98,
    duration: dur,
    ease: MOTION.ease.in,
    onComplete,
  });
};

/**
 * NUMBER COUNTER: "Count Up"
 * Animates numbers smoothly from start to target
 */
export const countUp = (element, targetValue, startValue = 0, suffix = '', duration = 0.75) => {
  if (!element) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    element.textContent = Math.round(targetValue) + suffix;
    return;
  }

  const dur = getMotionDuration(duration);
  const state = { val: startValue };
  gsap.to(state, {
    val: targetValue,
    duration: dur,
    ease: MOTION.ease.out,
    onUpdate: () => {
      if (element) {
        element.textContent = Math.round(state.val) + suffix;
      }
    },
  });
};

/**
 * PROGRESS BAR: "Progress Flow"
 * Smooth width transition with power2.out / power3.out
 */
export const progressFlow = (barElement, targetPercent, duration = 0.6) => {
  if (!barElement) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    barElement.style.width = `${targetPercent}%`;
    return;
  }

  const dur = getMotionDuration(duration);
  gsap.to(barElement, {
    width: `${targetPercent}%`,
    duration: dur,
    ease: MOTION.ease.outSmooth,
  });
};

/**
 * EMPTY STATE: "Gentle Arrival"
 * Icon scale 0.95 -> 1, text & button stagger
 */
export const gentleArrival = (containerEl) => {
  if (!containerEl) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    gsap.set(containerEl.children, { opacity: 1, y: 0, scale: 1, clearProps: 'all' });
    return;
  }

  const mult = getSpeedMultiplier();
  const dur = getMotionDuration(MOTION.duration.medium);

  gsap.fromTo(
    containerEl.children,
    { opacity: 0, y: 12, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: dur,
      stagger: 0.08 * mult,
      ease: MOTION.ease.outSmooth,
      clearProps: 'all',
    }
  );
};

/**
 * INTERACTIVE PREVIEW DEMO
 * Triggers a live motion demo on a preview card container according to active or specified style
 */
export const triggerMotionDemo = (cardEl, badgeElements, progressEl, onFinish, customStyle) => {
  if (!cardEl) {
    onFinish?.();
    return;
  }

  const { isOff, ease, enterOffset, scaleFactor, blurAmount, multiplier } = getMotionParams(customStyle);

  if (isOff) {
    gsap.set(cardEl, { scale: 1, y: 0, opacity: 1, filter: 'none', clearProps: 'all' });
    if (badgeElements && badgeElements.length) {
      gsap.set(badgeElements, { opacity: 1, y: 0, scale: 1, clearProps: 'all' });
    }
    if (progressEl) progressEl.style.width = '100%';
    onFinish?.();
    return;
  }

  const durCard = getMotionDuration(0.38);
  const durBadge = getMotionDuration(0.3);
  const durBar = getMotionDuration(0.5);
  const filterStart = blurAmount && blurAmount !== '0px' ? `blur(${blurAmount})` : 'none';

  const tl = gsap.timeline({
    onComplete: () => {
      onFinish?.();
    },
  });

  // Card elevation
  tl.fromTo(
    cardEl,
    { scale: scaleFactor, y: enterOffset, opacity: 0.6, filter: filterStart },
    { scale: 1, y: 0, opacity: 1, filter: 'none', duration: durCard, ease: ease || MOTION.ease.outSmooth, clearProps: 'filter' }
  );

  // Cascading badges
  if (badgeElements && badgeElements.length) {
    tl.fromTo(
      badgeElements,
      { opacity: 0, y: Math.max(4, Math.round(enterOffset * 0.5)), scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: durBadge,
        stagger: 0.07 * multiplier,
        ease: ease || MOTION.ease.outSmooth,
      },
      `-=${durCard * 0.5}`
    );
  }

  // Progress sweep
  if (progressEl) {
    tl.fromTo(
      progressEl,
      { width: '0%' },
      { width: '100%', duration: durBar, ease: ease || MOTION.ease.outSmooth },
      `-=${durBadge * 0.4}`
    );
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *  EXPANDED PRESETS FOR THE 40 SYSTEM REQUIREMENTS
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * DIRECTIONAL RETURN: Back Navigation ("Directional Return")
 */
export const directionalReturn = (element, onComplete) => {
  if (!element) {
    onComplete?.();
    return;
  }
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    gsap.set(element, { opacity: 0 });
    onComplete?.();
    return;
  }
  const dur = getMotionDuration(0.24);
  gsap.to(element, {
    opacity: 0,
    x: 12,
    duration: dur,
    ease: MOTION.ease.in,
    onComplete,
  });
};

/**
 * TASK STATUS CHANGE: "State Morph"
 */
export const stateMorph = (element) => {
  if (!element || getSpeedMultiplier() === 0 || isReducedMotion()) return;
  const dur = getMotionDuration(0.24, { isMicro: true });
  gsap.timeline()
    .fromTo(element, { scale: 0.88, opacity: 0.6 }, { scale: 1.06, opacity: 1, duration: dur * 0.6, ease: 'power2.out' })
    .to(element, { scale: 1, duration: dur * 0.4, ease: 'power2.out', clearProps: 'transform' });
};

/**
 * HIERARCHY NAVIGATION: "Hierarchical Zoom" (Plan -> Month -> Week -> Day)
 */
export const hierarchicalZoom = (element, direction = 'deeper', customStyle) => {
  if (!element) return;
  const { isOff, ease, enterOffset, scaleFactor } = getMotionParams(customStyle);
  if (isOff) {
    gsap.set(element, { opacity: 1, scale: 1, y: 0, clearProps: 'all' });
    return;
  }
  const startScale = direction === 'deeper' ? scaleFactor : (1 + (1 - scaleFactor));
  const startY = direction === 'deeper' ? enterOffset : -enterOffset;
  const dur = getMotionDuration(0.32);

  gsap.fromTo(
    element,
    { opacity: 0, scale: startScale, y: startY },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: dur,
      ease: ease || MOTION.ease.outSmooth,
      clearProps: 'transform,opacity',
    }
  );
};

/**
 * BREADCRUMBS: "Path Morph"
 */
export const pathMorph = (element) => {
  if (!element) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    gsap.set(element, { opacity: 1, x: 0, clearProps: 'all' });
    return;
  }
  const dur = getMotionDuration(0.22, { isMicro: true });
  gsap.fromTo(
    element,
    { opacity: 0, x: -6 },
    { opacity: 1, x: 0, duration: dur, ease: MOTION.ease.outSmooth, clearProps: 'all' }
  );
};

/**
 * DROPDOWNS: "Fluid Reveal"
 */
export const dropdownEnter = (element, customStyle) => {
  if (!element) return;
  const { isOff, ease, scaleFactor } = getMotionParams(customStyle);
  if (isOff) {
    gsap.set(element, { opacity: 1, y: 0, scale: 1, clearProps: 'all' });
    return;
  }
  const dur = getMotionDuration(MOTION.duration.fast);
  gsap.fromTo(
    element,
    { opacity: 0, y: -6, scale: scaleFactor },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: dur,
      ease: ease || MOTION.ease.outSmooth,
      clearProps: 'transform,opacity',
    }
  );
};

export const dropdownExit = (element, onComplete) => {
  if (!element) {
    onComplete?.();
    return;
  }
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    onComplete?.();
    return;
  }
  const dur = getMotionDuration(0.18, { isMicro: true });
  gsap.to(element, {
    opacity: 0,
    y: -4,
    scale: 0.98,
    duration: dur,
    ease: MOTION.ease.in,
    onComplete,
  });
};

/**
 * TABS: "Sliding Underline"
 */
export const slidingTab = (indicatorEl, { x, width } = {}, customStyle) => {
  if (!indicatorEl) return;
  const { isOff, ease } = getMotionParams(customStyle);
  if (isOff) {
    gsap.set(indicatorEl, { x, width });
    return;
  }
  const dur = getMotionDuration(0.24, { isMicro: true });
  gsap.to(indicatorEl, {
    x,
    width,
    duration: dur,
    ease: ease || MOTION.ease.outSmooth,
  });
};

/**
 * SEARCH: "Focus Expansion"
 */
export const focusExpansion = (element) => {
  if (!element || getSpeedMultiplier() === 0 || isReducedMotion()) return;
  const dur = getMotionDuration(0.2, { isMicro: true });
  gsap.fromTo(
    element,
    { scale: 0.99 },
    { scale: 1, duration: dur, ease: MOTION.ease.outSmooth }
  );
};

/**
 * YOUTUBE / VIDEO: "Media Focus"
 */
export const mediaFocus = (element) => {
  if (!element) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    gsap.set(element, { opacity: 1, scale: 1, clearProps: 'all' });
    return;
  }
  const dur = getMotionDuration(0.35);
  gsap.fromTo(
    element,
    { opacity: 0.85, scale: 0.985 },
    { opacity: 1, scale: 1, duration: dur, ease: MOTION.ease.outSmooth, clearProps: 'transform,opacity' }
  );
};

/**
 * ANALYTICS / CHARTS: "Data Draw"
 */
export const dataDraw = (element, duration = 0.75) => {
  if (!element) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    gsap.set(element, { opacity: 1, clearProps: 'all' });
    return;
  }
  const dur = getMotionDuration(duration);
  gsap.fromTo(
    element,
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: dur, ease: MOTION.ease.outSmooth, clearProps: 'all' }
  );
};

/**
 * DASHBOARD: "Premium Dashboard Reveal"
 */
export const dashboardReveal = (containerEl) => {
  if (!containerEl) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    const cards = containerEl.querySelectorAll('.dash-card, .dashboard-section');
    gsap.set(cards, { opacity: 1, y: 0, scale: 1, clearProps: 'all' });
    return;
  }
  const cards = containerEl.querySelectorAll('.dash-card, .dashboard-section');
  if (cards.length === 0) return;

  const mult = getSpeedMultiplier();
  const dur = getMotionDuration(0.38);

  gsap.fromTo(
    cards,
    { opacity: 0, y: 16, scale: 0.985 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: dur,
      stagger: 0.04 * mult,
      ease: MOTION.ease.outSmooth,
      clearProps: 'transform,opacity',
    }
  );
};

/**
 * PROFILE / SETTINGS: "Panel Slide"
 */
export const panelSlide = (element, direction = 'down') => {
  if (!element) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0, clearProps: 'all' });
    return;
  }
  const yOffset = direction === 'down' ? 14 : -14;
  const dur = getMotionDuration(MOTION.duration.normal);
  gsap.fromTo(
    element,
    { opacity: 0, y: yOffset },
    { opacity: 1, y: 0, duration: dur, ease: MOTION.ease.outSmooth, clearProps: 'all' }
  );
};

/**
 * TOASTS: "Quiet Success"
 */
export const quietSuccess = (element) => {
  toastEnter(element);
};

/**
 * TOASTS: "Micro Attention"
 */
export const microAttention = (element) => {
  if (!element || getSpeedMultiplier() === 0 || isReducedMotion()) return;
  const dur = getMotionDuration(0.24, { isMicro: true });
  gsap.timeline()
    .to(element, { scale: 1.03, duration: dur * 0.5, ease: 'power2.out' })
    .to(element, { scale: 1, duration: dur * 0.5, ease: 'power2.out', clearProps: 'scale' });
};

/**
 * SCROLL REVEAL: "Viewport Reveal"
 */
export const viewportReveal = (element) => {
  if (!element) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0, clearProps: 'all' });
    return;
  }
  const dur = getMotionDuration(MOTION.duration.normal);
  gsap.fromTo(
    element,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: dur, ease: MOTION.ease.outSmooth, clearProps: 'all' }
  );
};

/**
 * NOTES / AUTO SAVE: "Silent Save"
 */
export const silentSave = (badgeEl) => {
  if (!badgeEl || getSpeedMultiplier() === 0 || isReducedMotion()) return;
  const dur = getMotionDuration(0.22, { isMicro: true });
  gsap.fromTo(
    badgeEl,
    { scale: 0.94, opacity: 0.7 },
    { scale: 1, opacity: 1, duration: dur, ease: MOTION.ease.outSmooth, clearProps: 'transform' }
  );
};

/**
 * CALENDAR: "Temporal Slide"
 */
export const temporalSlide = (containerEl, direction = 1) => {
  if (!containerEl) return;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    const cells = containerEl.querySelectorAll('.cal-cell');
    gsap.set(cells, { opacity: 1, x: 0, scale: 1, clearProps: 'all' });
    return;
  }
  const cells = containerEl.querySelectorAll('.cal-cell');
  const xOffset = direction > 0 ? 14 : -14;
  const dur = getMotionDuration(0.26);
  const mult = getSpeedMultiplier();

  gsap.fromTo(
    cells,
    { opacity: 0, x: xOffset, scale: 0.98 },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: dur,
      stagger: 0.008 * mult,
      ease: MOTION.ease.outSmooth,
      clearProps: 'all',
    }
  );
};

/**
 * SIDEBAR: "Compact Morph"
 */
export const compactMorph = (sidebarEl, collapsed) => {
  if (!sidebarEl) return;
  const targetWidth = collapsed ? 72 : 260;
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    gsap.set(sidebarEl, { width: targetWidth });
    return;
  }
  const dur = getMotionDuration(MOTION.duration.normal);
  gsap.to(sidebarEl, {
    width: targetWidth,
    duration: dur,
    ease: MOTION.ease.outSmooth,
  });
};

/**
 * SAFETY FALLBACK WRAPPER
 * Executes animation safely, immediately running fallback if anything fails
 */
export const safeGsap = (target, animFn, onCompleteFallback) => {
  if (!target) {
    onCompleteFallback?.();
    return;
  }
  if (getSpeedMultiplier() === 0 || isReducedMotion()) {
    onCompleteFallback?.();
    return;
  }
  try {
    return animFn();
  } catch (err) {
    console.warn('GSAP animation safe fallback triggered:', err);
    onCompleteFallback?.();
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *  CENTRALIZED ALIASES
 * ═══════════════════════════════════════════════════════════════════
 */
export const animatePageEnter = pageEnter;
export const animatePageExit = pageExit;
export const animateModalOpen = modalEnter;
export const animateModalClose = modalExit;
export const animateCardEnter = planGenesis;
export const animateCardExit = softCollapse;
export const animateToast = toastEnter;
export const animateDropdown = dropdownEnter;
export const animateTabChange = slidingTab;
export const animateTaskComplete = completionSweep;
export const animateHierarchyNavigation = hierarchicalZoom;

/**
 * ═══════════════════════════════════════════════════════════════════
 *  CENTRALIZED ARCHITECTURE EXPORTS: motionConfig, motionPresets, motionUtils
 * ═══════════════════════════════════════════════════════════════════
 */

export const motionConfig = {
  duration: MOTION.duration,
  ease: MOTION.ease,
  levels: ANIMATION_SPEED_LEVELS,
  styles: ANIMATION_STYLES,
  storageKey: MOTION_STORAGE_KEY,
  speedStorageKey: MOTION_STORAGE_KEY,
  styleStorageKey: STYLE_STORAGE_KEY,
  defaultLevel: 3,
  defaultStyle: 'smooth',
};

export const motionUtils = {
  getStoredSpeedLevel,
  setStoredSpeedLevel,
  getStoredStyle,
  setStoredStyle,
  applyMotionScaleToDOM,
  isReducedMotion,
  getSpeedMultiplier,
  getMotionDuration,
  getMotionParams,
  safeGsap,
  triggerMotionDemo,
};

export const motionPresets = {
  // Style specifications
  smooth: ANIMATION_STYLES[0],
  elegant: ANIMATION_STYLES[1],
  minimal: ANIMATION_STYLES[2],
  dynamic: ANIMATION_STYLES[3],
  slide: ANIMATION_STYLES[4],
  depth: ANIMATION_STYLES[5],
  cinematic: ANIMATION_STYLES[6],
  fade: ANIMATION_STYLES[7],

  // Core motion functions
  pageEnter,
  pageExit,
  directionalReturn,
  contentCascade,
  modalEnter,
  modalExit,
  dropdownEnter,
  dropdownExit,
  pressFeedback,
  planGenesis,
  softCollapse,
  softShake,
  completionSweep,
  stateMorph,
  hierarchicalZoom,
  pathMorph,
  slidingTab,
  focusExpansion,
  mediaFocus,
  countUp,
  progressFlow,
  dataDraw,
  dashboardReveal,
  panelSlide,
  quietSuccess,
  microAttention,
  toastEnter,
  toastExit,
  gentleArrival,
  viewportReveal,
  silentSave,
  temporalSlide,
  compactMorph,

  // Named Aliases
  animatePageEnter,
  animatePageExit,
  animateModalOpen,
  animateModalClose,
  animateCardEnter,
  animateCardExit,
  animateToast,
  animateDropdown,
  animateTabChange,
  animateTaskComplete,
  animateHierarchyNavigation,
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *  REACT INTEGRATION: MotionContext, MotionProvider, useMotion
 * ═══════════════════════════════════════════════════════════════════
 */

export const MotionContext = createContext({
  speedLevel: 3,
  setSpeedLevel: () => {},
  animationStyle: 'smooth',
  setAnimationStyle: () => {},
  styleConfig: ANIMATION_STYLES[0],
  multiplier: 1.0,
  isOff: false,
  isReduced: false,
  config: motionConfig,
  presets: motionPresets,
  utils: motionUtils,
});

export const MotionProvider = ({ children }) => {
  const [speedLevel, setSpeedLevelState] = useState(() => getStoredSpeedLevel());
  const [animationStyle, setAnimationStyleState] = useState(() => getStoredStyle());

  const setSpeedLevel = useCallback((level) => {
    const saved = setStoredSpeedLevel(level);
    setSpeedLevelState(saved);
  }, []);

  const setAnimationStyle = useCallback((styleId) => {
    const saved = setStoredStyle(styleId);
    setAnimationStyleState(saved);
  }, []);

  useEffect(() => {
    applyMotionScaleToDOM(speedLevel, animationStyle);
  }, [speedLevel, animationStyle]);

  const multiplier = useMemo(() => {
    const conf = ANIMATION_SPEED_LEVELS.find((l) => l.level === speedLevel) || ANIMATION_SPEED_LEVELS[3];
    return conf.multiplier;
  }, [speedLevel]);

  const styleConfig = useMemo(() => {
    return ANIMATION_STYLES.find((s) => s.id === animationStyle) || ANIMATION_STYLES[0];
  }, [animationStyle]);

  const isOff = speedLevel === 0;
  const isReduced = useMemo(() => isReducedMotion(), []);

  const value = useMemo(
    () => ({
      speedLevel,
      setSpeedLevel,
      animationStyle,
      setAnimationStyle,
      styleConfig,
      multiplier,
      isOff,
      isReduced,
      config: motionConfig,
      presets: motionPresets,
      utils: motionUtils,
    }),
    [speedLevel, setSpeedLevel, animationStyle, setAnimationStyle, styleConfig, multiplier, isOff, isReduced]
  );

  return React.createElement(MotionContext.Provider, { value }, children);
};

export const useMotion = () => {
  const context = useContext(MotionContext);
  if (!context) {
    const currentStyle = getStoredStyle();
    // Return safe standalone utilities if used outside provider
    return {
      speedLevel: getStoredSpeedLevel(),
      setSpeedLevel: setStoredSpeedLevel,
      animationStyle: currentStyle,
      setAnimationStyle: setStoredStyle,
      styleConfig: ANIMATION_STYLES.find((s) => s.id === currentStyle) || ANIMATION_STYLES[0],
      multiplier: getSpeedMultiplier(),
      isOff: getStoredSpeedLevel() === 0,
      isReduced: isReducedMotion(),
      config: motionConfig,
      presets: motionPresets,
      utils: motionUtils,
    };
  }
  return context;
};

