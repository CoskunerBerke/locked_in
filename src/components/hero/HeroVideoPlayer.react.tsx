import React, { useState, useEffect, useRef } from 'react';

export const HeroVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.matches) {
      setIsPlaying(false);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsPlaying(false);
        videoRef.current?.pause();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Attempt playback on mount
    if (videoRef.current && !prefersReducedMotion) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Autoplay prevented or video load notice:', err);
        setIsPlaying(false);
      });
    }
  }, [prefersReducedMotion]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasError(true));
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Light Overlay for Text Readability - Translucent so Video is Clearly Visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-slate-50/40 to-slate-50/10 z-10" />

      {/* Video Element */}
      {!hasError && !prefersReducedMotion ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 z-0"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/hero-poster.svg"
          onError={() => {
            // Only trigger error if video element cannot play any source
            if (videoRef.current && videoRef.current.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
              setHasError(true);
            }
          }}
          aria-hidden="true"
          tabIndex={-1}
        >
          {/* Desktop & Mobile Video Sources */}
          <source src="/videos/hero-desktop.mp4" type="video/mp4" media="(min-width: 768px)" />
          <source src="/videos/hero-desktop.webm" type="video/webm" media="(min-width: 768px)" />
          <source src="/videos/hero-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/videos/hero-mobile.webm" type="video/webm" media="(max-width: 767px)" />
        </video>
      ) : (
        /* Poster Image or Gradient SVG Fallback */
        <img
          src="/videos/hero-poster.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          aria-hidden="true"
        />
      )}

      {/* Accessible Video Control Button */}
      <button
        type="button"
        onClick={togglePlayPause}
        className="pointer-events-auto absolute bottom-6 right-6 z-20 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-slate-800 border border-slate-300 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label={isPlaying ? 'Arka plan videosunu durdur' : 'Arka plan videosunu oynat'}
      >
        {isPlaying ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Arka plan videosunu durdur</span>
          </>
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Arka plan videosunu oynat</span>
          </>
        )}
      </button>
    </div>
  );
};

export default HeroVideoPlayer;
