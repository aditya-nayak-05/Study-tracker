import React, { useEffect, useRef, useState, useCallback, memo } from 'react';

// --- YouTube IFrame API Loader ---
const YT_API_SRC = 'https://www.youtube.com/iframe_api';
let ytApiLoadingState = 'idle'; // 'idle' | 'loading' | 'ready'
const ytReadyCallbacks = [];

function loadYouTubeApi() {
  return new Promise((resolve) => {
    // Already loaded
    if (window.YT && window.YT.Player) {
      ytApiLoadingState = 'ready';
      resolve();
      return;
    }

    // Queue this callback if already loading
    if (ytApiLoadingState === 'loading') {
      ytReadyCallbacks.push(resolve);
      return;
    }

    ytApiLoadingState = 'loading';
    ytReadyCallbacks.push(resolve);

    // Preserve any existing callback
    const prevCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      ytApiLoadingState = 'ready';
      if (typeof prevCallback === 'function') prevCallback();
      ytReadyCallbacks.forEach((cb) => cb());
      ytReadyCallbacks.length = 0;
    };

    // Don't add the script tag twice
    if (!document.querySelector(`script[src="${YT_API_SRC}"]`)) {
      const tag = document.createElement('script');
      tag.src = YT_API_SRC;
      tag.async = true;
      document.head.appendChild(tag);
    }
  });
}

// --- Unique ID generator ---
let idCounter = 0;
function generatePlayerId(videoId) {
  idCounter += 1;
  return `yt-player-${videoId}-${idCounter}`;
}

// --- Component ---
function YouTubePlayer({
  videoId,
  onProgressUpdate,
  onPlayerReady,
  onVideoEnd,
  startAt,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const playerDivId = useRef(generatePlayerId(videoId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep latest callbacks in refs to avoid re-creating the player on prop changes
  const onProgressUpdateRef = useRef(onProgressUpdate);
  const onPlayerReadyRef = useRef(onPlayerReady);
  const onVideoEndRef = useRef(onVideoEnd);

  useEffect(() => { onProgressUpdateRef.current = onProgressUpdate; }, [onProgressUpdate]);
  useEffect(() => { onPlayerReadyRef.current = onPlayerReady; }, [onPlayerReady]);
  useEffect(() => { onVideoEndRef.current = onVideoEnd; }, [onVideoEnd]);

  // --- Progress helper ---
  const reportProgress = useCallback(() => {
    const player = playerRef.current;
    if (!player || typeof player.getCurrentTime !== 'function') return;

    try {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      if (duration > 0 && typeof onProgressUpdateRef.current === 'function') {
        onProgressUpdateRef.current({
          currentTime,
          duration,
          progress: currentTime / duration,
        });
      }
    } catch {
      // Player may have been destroyed
    }
  }, []);

  const startProgressInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(reportProgress, 5000);
  }, [reportProgress]);

  const stopProgressInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  // --- Setup / Cleanup ---
  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        await loadYouTubeApi();
        if (destroyed) return;

        playerRef.current = new window.YT.Player(playerDivId.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            ...(startAt != null ? { start: Math.floor(startAt) } : {}),
          },
          events: {
            onReady: (event) => {
              if (destroyed) return;
              setLoading(false);

              if (startAt != null) {
                event.target.seekTo(startAt, true);
              }

              if (typeof onPlayerReadyRef.current === 'function') {
                onPlayerReadyRef.current(event);
              }
            },
            onStateChange: (event) => {
              if (destroyed) return;

              switch (event.data) {
                case window.YT.PlayerState.PLAYING: // 1
                  startProgressInterval();
                  break;
                case window.YT.PlayerState.PAUSED: // 2
                  stopProgressInterval();
                  reportProgress();
                  break;
                case window.YT.PlayerState.ENDED: // 0
                  stopProgressInterval();
                  reportProgress();
                  if (typeof onVideoEndRef.current === 'function') {
                    onVideoEndRef.current();
                  }
                  break;
                default:
                  break;
              }
            },
            onError: (event) => {
              if (destroyed) return;
              setLoading(false);

              const errorMessages = {
                2: 'Invalid video ID.',
                5: 'This video cannot be played in an embedded player.',
                100: 'Video not found or has been removed.',
                101: 'The video owner does not allow embedded playback.',
                150: 'The video owner does not allow embedded playback.',
              };
              setError(
                errorMessages[event.data] ||
                  `An unexpected error occurred (code ${event.data}).`
              );
            },
          },
        });

        // Set iframe attributes after creation
        const iframe = document.querySelector(`#${CSS.escape(playerDivId.current)} iframe, #${CSS.escape(playerDivId.current)}`);
        if (iframe && iframe.tagName === 'IFRAME') {
          iframe.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          );
          iframe.setAttribute('allowfullscreen', 'true');
        }
      } catch (err) {
        if (!destroyed) {
          setLoading(false);
          setError('Failed to load the YouTube player. Please try again later.');
          console.error('YouTubePlayer init error:', err);
        }
      }
    }

    init();

    return () => {
      destroyed = true;
      stopProgressInterval();

      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch {
        // Ignore destroy errors
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // --- Post-creation: ensure iframe attributes (YT API replaces div with iframe) ---
  useEffect(() => {
    if (loading) return;

    const observer = new MutationObserver(() => {
      const el = containerRef.current;
      if (!el) return;
      const iframe = el.querySelector('iframe');
      if (iframe) {
        iframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        );
        iframe.setAttribute('allowfullscreen', 'true');
        observer.disconnect();
      }
    });

    if (containerRef.current) {
      // Check immediately
      const iframe = containerRef.current.querySelector('iframe');
      if (iframe) {
        iframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        );
        iframe.setAttribute('allowfullscreen', 'true');
      } else {
        observer.observe(containerRef.current, { childList: true, subtree: true });
      }
    }

    return () => observer.disconnect();
  }, [loading]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        background: '#0c0c18',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        ...style,
      }}
    >
      {/* Loading overlay */}
      {loading && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            background: '#0c0c18',
          }}
        >
          <div style={spinnerStyle}>
            <style>{spinnerKeyframes}</style>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            background: '#0c0c18',
            color: '#ef4444',
            padding: '2rem',
            textAlign: 'center',
            gap: '0.75rem',
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' }}>
            {error}
          </p>
        </div>
      )}

      {/* YT player target div */}
      <div
        id={playerDivId.current}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

// --- Spinner styles ---
const spinnerKeyframes = `
@keyframes yt-player-spin {
  to { transform: rotate(360deg); }
}
`;

const spinnerStyle = {
  width: 40,
  height: 40,
  border: '3px solid rgba(255,255,255,0.1)',
  borderTopColor: '#6366f1',
  borderRadius: '50%',
  animation: 'yt-player-spin 0.8s linear infinite',
};

export default memo(YouTubePlayer);
