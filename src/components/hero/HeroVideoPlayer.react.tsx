import React, { useState, useEffect, useRef } from 'react';

export const HeroVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly set DOM properties for cross-browser autoplay compliance
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;

    const playVideo = () => {
      if (prefersReducedMotion) {
        video.pause();
        setIsPlaying(false);
        return;
      }

      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasError(false);
          })
          .catch((err) => {
            console.warn('Hero video autoplay waiting for user interaction or ready state:', err);
            setIsPlaying(false);
          });
      }
    };

    // Attempt playback if reduced motion is disabled
    if (!prefersReducedMotion) {
      playVideo();
    } else {
      video.pause();
      setIsPlaying(false);
    }

    // Re-attempt playback once media data is buffered
    const handleLoaded = () => {
      if (!prefersReducedMotion) {
        playVideo();
      }
    };

    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('canplay', handleLoaded);

    // Fallback: start playback on first user interaction if browser policy blocked initial autoplay
    const handleUserInteraction = () => {
      if (video.paused && !prefersReducedMotion) {
        playVideo();
      }
    };

    window.addEventListener('pointerdown', handleUserInteraction, { once: true });
    window.addEventListener('scroll', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('canplay', handleLoaded);
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [prefersReducedMotion]); // Only depend on prefersReducedMotion!

  const handleCanPlay = () => {
    setHasError(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Hero video error encountered:', e);
    setHasError(true);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) {
      console.warn('HeroVideoPlayer: videoRef is null during play/pause toggle.');
      return;
    }

    if (!video.paused) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = true;
      setIsPlaying(true);
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.error('Hero video manual play failed:', err);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-30">
      {/* Light Overlay for Text Readability - Translucent so Video is Clearly Visible */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-50/75 via-slate-50/30 to-slate-50/5 z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Video Element - ALWAYS in DOM */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center z-0 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/hero-poster.svg"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onCanPlay={handleCanPlay}
        onError={handleVideoError}
      >
        <source src="/videos/hero-desktop.mp4" type="video/mp4" />
      </video>

      {/* Accessible Video Control Button */}
      <button
        type="button"
        onClick={togglePlayPause}
        disabled={hasError}
        className="pointer-events-auto absolute bottom-6 right-6 z-50 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-slate-800 border border-slate-300 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={
          hasError
            ? 'Video kullanılamıyor'
            : isPlaying
              ? 'Arka plan videosunu durdur'
              : 'Arka plan videosunu oynat'
        }
      >
        {hasError ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Video kullanılamıyor</span>
          </>
        ) : isPlaying ? (
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
