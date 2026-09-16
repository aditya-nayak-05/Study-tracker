/**
 * YouTube URL parsing and formatting utilities.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/
 */

/**
 * Extract the video ID from a YouTube URL.
 * @param {string} url
 * @returns {string|null} videoId or null if invalid
 */
export function extractVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  let trimmed = url.trim();

  // If wrapped in quotes or iframe tag
  const iframeMatch = trimmed.match(/src=["'](.*?)["']/);
  if (iframeMatch) trimmed = iframeMatch[1];

  // If user entered raw 11-char ID directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // youtu.be/<id>
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch) return youtuBeMatch[1];

  // youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) return shortsMatch[1];

  // youtube.com/live/<id>
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i);
  if (liveMatch) return liveMatch[1];

  // youtube.com/embed/<id>
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) return embedMatch[1];

  // youtube.com/v/<id>
  const vMatch = trimmed.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i);
  if (vMatch) return vMatch[1];

  // Any URL with ?v=<id> or &v=<id> (e.g. watch?v=..., watch?feature=share&v=...)
  const vParamMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vParamMatch) return vParamMatch[1];

  return null;
}

/**
 * Validate whether a URL is a valid YouTube URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidYoutubeUrl(url) {
  return extractVideoId(url) !== null;
}

/**
 * Build an embed URL for use in an iframe.
 * @param {string} videoId
 * @param {object} options
 * @returns {string}
 */
export function getEmbedUrl(videoId, options = {}) {
  if (!videoId) return '';
  const params = new URLSearchParams({
    enablejsapi: '1',
    modestbranding: '1',
    rel: '0',
    ...options,
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Get a thumbnail URL for a video.
 * @param {string} videoId
 * @param {'default'|'mqdefault'|'hqdefault'|'sddefault'|'maxresdefault'} quality
 * @returns {string}
 */
export function getThumbnailUrl(videoId, quality = 'mqdefault') {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Format a duration in seconds to HH:MM:SS or MM:SS.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '00:00';
  const s = Math.floor(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculate video progress percentage safely.
 * @param {number} currentTime
 * @param {number} duration
 * @returns {number} 0–100
 */
export function calcVideoProgress(currentTime, duration) {
  if (!duration || duration <= 0 || isNaN(duration) || isNaN(currentTime)) return 0;
  const curr = Math.max(0, Number(currentTime) || 0);
  const dur = Number(duration);
  if (dur <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((curr / dur) * 10000) / 100));
}
