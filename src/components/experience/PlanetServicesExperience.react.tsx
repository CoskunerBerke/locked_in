import React, { useEffect, useRef, useState, useMemo } from 'react';
import planetServicesData from '../../data/planetServices';
import type { PlanetServiceStage } from '../../data/planetServices';
import { CheckCircle2, ArrowRight, Sparkles, ChevronDown, Globe, Search, Smartphone, MapPin, Utensils, Megaphone, Zap, RefreshCw } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'web-tasarim': Globe,
  'landing-page': Zap,
  'web-yenileme': RefreshCw,
  'seo': Search,
  'mobil-uygulama': Smartphone,
  'google-maps': MapPin,
  'yemek-panelleri': Utensils,
  'instagram-reklamlari': Megaphone,
};

export const PlanetServicesExperience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [progressRatio, setProgressRatio] = useState<number>(0); // 0 to 1 across whole experience
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isCanvasSupported, setIsCanvasSupported] = useState<boolean>(true);

  // Preload textures
  const loadedImagesRef = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Preload images
    planetServicesData.forEach((stage: PlanetServiceStage) => {
      if (stage.fallbackImage) {
        const img = new Image();
        img.src = stage.fallbackImage;
        loadedImagesRef.current[stage.id] = img;
      }
    });

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Passive Scroll Progress Listener
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = containerRef.current!.getBoundingClientRect();
          const windowHeight = window.innerHeight || 800;
          const totalScrollableDistance = rect.height - windowHeight;

          if (totalScrollableDistance <= 0) {
            ticking = false;
            return;
          }

          // Top of container relative to viewport top
          const currentScroll = -rect.top;
          const rawRatio = Math.max(0, Math.min(1, currentScroll / totalScrollableDistance));

          setProgressRatio(rawRatio);

          // Calculate current stage (0 to 7)
          const stageStep = 1 / planetServicesData.length;
          const calculatedIndex = Math.min(
            planetServicesData.length - 1,
            Math.floor(rawRatio / stageStep)
          );
          
          setActiveStageIndex(calculatedIndex);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Canvas 2D Photorealistic Planet Renderer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      setIsCanvasSupported(false);
      return;
    }

    let animationFrameId: number;
    let selfSpinAngle = 0;
    let lastTime = performance.now();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Stars background
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
    }));

    const render = (now: number) => {
      const delta = Math.min(now - lastTime, 32);
      lastTime = now;

      if (!prefersReducedMotion) {
        selfSpinAngle += 0.005 * (delta / 16);
      }

      const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, w, h);

      // 1. Render soft starlight particles
      stars.forEach((star) => {
        if (!prefersReducedMotion) {
          star.alpha += star.speed;
          if (star.alpha > 0.8 || star.alpha < 0.2) star.speed = -star.speed;
        }
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.1, Math.min(0.8, star.alpha))})`;
        ctx.fill();
      });

      // 2. Compute Planet Motion based on exact continuous float stage progress
      const totalStages = planetServicesData.length; // 8
      const currentFloatStage = progressRatio * (totalStages - 1); // 0.0 to 7.0

      const isMobile = w < 768;
      // Position planet: desktop = right 65% area, mobile = top 35% area
      const planetCenterX = isMobile ? w * 0.5 : w * 0.68;
      const planetCenterY = isMobile ? h * 0.32 : h * 0.5;
      const basePlanetRadius = isMobile ? Math.min(w, h) * 0.32 : Math.min(w, h) * 0.38;

      planetServicesData.forEach((stage: PlanetServiceStage, idx: number) => {
        // Distance in stage units from current float stage
        const distFromCurrent = idx - currentFloatStage;

        // Render window: only render planets within [-1.3, 1.3] distance
        if (Math.abs(distFromCurrent) > 1.3) return;

        // Y translation: distFromCurrent = 0 -> centered (offsetY = 0)
        // distFromCurrent > 0 (future planet) -> below (offsetY > 0)
        // distFromCurrent < 0 (past planet) -> above (offsetY < 0)
        const offsetY = distFromCurrent * (h * 0.75);
        const py = planetCenterY + offsetY;

        // Scale & Opacity curves
        const absDist = Math.abs(distFromCurrent);
        const scale = Math.max(0.4, 1 - absDist * 0.35);
        const opacity = Math.max(0, 1 - absDist * 1.1);

        if (opacity <= 0.01) return;

        const currentRadius = basePlanetRadius * scale;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(planetCenterX, py);

        // Soft Radial Aura Glow behind planet
        const auraGrad = ctx.createRadialGradient(0, 0, currentRadius * 0.4, 0, 0, currentRadius * 1.8);
        auraGrad.addColorStop(0, `${stage.accentColor}40`);
        auraGrad.addColorStop(0.6, `${stage.accentColor}15`);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // Special 3D Saturn Rings for Stage 06 (Saturn)
        if (stage.id === 'google-maps') {
          ctx.save();
          ctx.rotate(0.35);
          ctx.beginPath();
          ctx.ellipse(0, 0, currentRadius * 2.3, currentRadius * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.75)';
          ctx.lineWidth = Math.max(2, currentRadius * 0.12);
          ctx.stroke();
          ctx.restore();
        }

        // Draw Planet Sphere Texture
        ctx.save();
        ctx.rotate(selfSpinAngle * 0.3); // Apply slow continuous spin
        const img = loadedImagesRef.current[stage.id];
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.clip();

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, -currentRadius, -currentRadius, currentRadius * 2, currentRadius * 2);
        } else if (stage.id === 'landing-page') {
          // Procedural Mercury (Gray Cratered)
          const mercGrad = ctx.createRadialGradient(-currentRadius * 0.3, -currentRadius * 0.3, currentRadius * 0.1, 0, 0, currentRadius);
          mercGrad.addColorStop(0, '#E5E7EB');
          mercGrad.addColorStop(0.5, '#9CA3AF');
          mercGrad.addColorStop(1, '#374151');
          ctx.fillStyle = mercGrad;
          ctx.fill();
        } else if (stage.id === 'yemek-panelleri') {
          // Procedural Uranus (Cyan Ice)
          const uranGrad = ctx.createRadialGradient(-currentRadius * 0.3, -currentRadius * 0.3, currentRadius * 0.1, 0, 0, currentRadius);
          uranGrad.addColorStop(0, '#CFFAFE');
          uranGrad.addColorStop(0.5, '#06B6D4');
          uranGrad.addColorStop(1, '#155E75');
          ctx.fillStyle = uranGrad;
          ctx.fill();
        } else {
          // Color Gradient Fallback
          const sphereGrad = ctx.createRadialGradient(-currentRadius * 0.3, -currentRadius * 0.3, currentRadius * 0.1, 0, 0, currentRadius);
          sphereGrad.addColorStop(0, '#FFFFFF');
          sphereGrad.addColorStop(0.5, stage.accentColor);
          sphereGrad.addColorStop(1, '#0F172A');
          ctx.fillStyle = sphereGrad;
          ctx.fill();
        }
        ctx.restore(); // Restore spin transform

        // 3D Sphere Shading Overlay
        const shadowGrad = ctx.createRadialGradient(
          -currentRadius * 0.3,
          -currentRadius * 0.3,
          currentRadius * 0.15,
          0,
          0,
          currentRadius
        );
        shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Rim Light Border
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${stage.accentColor}90`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [progressRatio, prefersReducedMotion]);

  const activeStage: PlanetServiceStage = useMemo(() => {
    return planetServicesData[activeStageIndex] || planetServicesData[0];
  }, [activeStageIndex]);

  const IconComponent: React.ComponentType<{ className?: string }> = useMemo(() => {
    return ICON_MAP[activeStage.id] || Globe;
  }, [activeStage.id]);

  const handleStageClick = (index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight || 800;
    const totalScrollableDistance = rect.height - windowHeight;
    const stageStep = totalScrollableDistance / (planetServicesData.length - 1);
    const targetScrollY = window.scrollY + rect.top + index * stageStep;

    window.scrollTo({
      top: targetScrollY,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      ref={containerRef}
      id="hizmetlerimiz"
      aria-label="Tam Ekran Gezegen Hizmet Yolculuğu"
      className="relative w-full h-[600vh] sm:h-[700vh] bg-slate-900 border-t border-b border-slate-800 text-slate-100"
    >
      {/* Sticky Fullscreen Viewport Container */}
      <div className="sticky top-0 w-full h-screen h-[100dvh] overflow-hidden flex flex-col justify-between p-4 sm:p-8 lg:p-12 select-none">
        
        {/* Background Cosmic Canvas Renderer */}
        {isCanvasSupported && (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />
        )}

        {/* Ambient Radial Lighting Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-colors duration-700 opacity-40"
          style={{
            background: `radial-gradient(circle at 65% 50%, ${activeStage.accentColor}33, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Top Header Bar: Experience Title & Stage Counter */}
        <div className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full pt-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-sky-400 backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Hizmet Sistemimiz</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-400">
              Scroll ile Keşfedin
            </span>
          </div>

          {/* Accessible 01 / 08 Stage Counter */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/90 px-4 py-1.5 rounded-full backdrop-blur-md shadow-xl">
            <span className="text-xs font-black tracking-wider text-sky-400">
              0{activeStage.sequence}
            </span>
            <span className="text-xs font-bold text-slate-600">/</span>
            <span className="text-xs font-bold text-slate-400">08</span>
            <span className="ml-2 pl-2 border-l border-slate-800 text-xs font-extrabold text-slate-200">
              {activeStage.planetName}
            </span>
          </div>
        </div>

        {/* Middle Main Content Area: Left Foreground Content Card (Desktop) / Bottom Card (Mobile) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          
          {/* Active Stage Service Card */}
          <article
            key={activeStage.id}
            className="lg:col-span-6 bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-slate-950/80 space-y-5 transform-gpu transition-all duration-500 ease-out"
          >
            {/* Category & Planet Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-950/80 border border-sky-500/30 text-sky-300 font-bold text-xs">
                <IconComponent className="w-4 h-4 text-sky-400" />
                <span>{activeStage.category}</span>
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {activeStage.planetName} SAHNESİ
              </span>
            </div>

            {/* H2 Service Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {activeStage.serviceName}
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base font-medium text-slate-300 leading-relaxed">
              {activeStage.description}
            </p>

            {/* 2x2 Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {activeStage.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-200 font-semibold p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-inner"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Action CTA Button */}
            <div className="pt-3 flex items-center justify-between gap-4">
              <a
                href={activeStage.href}
                className="btn-primary text-xs sm:text-sm py-3 px-6 inline-flex items-center gap-2 shadow-lg shadow-sky-950/50"
              >
                <span>{activeStage.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <span className="text-[11px] font-bold text-slate-400 hidden sm:inline-block">
                Rent Yazılım Standartları
              </span>
            </div>
          </article>

          {/* Empty Right Column reserved for 3D Planet on Desktop */}
          <div className="hidden lg:block lg:col-span-6 pointer-events-none" aria-hidden="true" />
        </div>

        {/* Bottom Bar: Accessible Stage Navigation Pills */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pb-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Stage Navigation Dots/Pills */}
          <nav
            aria-label="Hizmet Aşamaları Navigasyonu"
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 border border-slate-800 p-1.5 rounded-full backdrop-blur-md overflow-x-auto max-w-full"
          >
            {planetServicesData.map((stage: PlanetServiceStage, idx: number) => {
              const isActive = idx === activeStageIndex;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageClick(idx)}
                  aria-label={`${stage.sequence}. Sahne: ${stage.planetName} - ${stage.serviceName}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-80">0{stage.sequence}</span>
                  <span className={isActive ? 'inline' : 'hidden md:inline'}>{stage.planetName}</span>
                </button>
              );
            })}
          </nav>

          {/* Down Indicator Hint */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-950/60 border border-slate-800/80 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <span>Aşağı kaydırmaya devam edin</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-sky-400" />
          </div>
        </div>

      </div>
    </section>
  );
};

export default PlanetServicesExperience;
