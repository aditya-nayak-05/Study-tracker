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
  const trimmed = url.trim();

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

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
  if (!duration || duration <= 0) return 0;
  return Math.min(100, Math.round(((currentTime || 0) / duration) * 10000) / 100);
}
