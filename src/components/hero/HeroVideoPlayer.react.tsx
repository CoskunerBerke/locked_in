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

  const handleVideoError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Contrast Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/80 to-slate-50/40 z-10" />

      {/* Video Element or Poster Fallback */}
      {!hasError && !prefersReducedMotion ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.svg"
          onError={handleVideoError}
          aria-hidden="true"
          tabIndex={-1}
        >
          {/* Desktop WebM / MP4 */}
          <source src="/videos/hero-desktop.webm" type="video/webm" media="(min-width: 768px)" />
          <source src="/videos/hero-desktop.mp4" type="video/mp4" media="(min-width: 768px)" />
          {/* Mobile WebM / MP4 */}
          <source src="/videos/hero-mobile.webm" type="video/webm" media="(max-width: 767px)" />
          <source src="/videos/hero-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
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
        className="pointer-events-auto absolute bottom-6 right-6 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-xs font-semibold text-slate-700 border border-slate-200/80 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label={isPlaying ? 'Arka plan videolarını durdur' : 'Arka plan videolarını oynat'}
      >
        {isPlaying ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Arka plan videosunu durdur</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Arka plan videosunu oynat</span>
          </>
        )}
      </button>
    </div>
  );
};

export default HeroVideoPlayer;
