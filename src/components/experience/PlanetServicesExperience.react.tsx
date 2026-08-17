import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import planetServicesData from '../../data/planetServices';
import type { PlanetServiceStage } from '../../data/planetServices';
import { CheckCircle2, ArrowRight, Sparkles, ChevronDown, Globe, Search, Smartphone, MapPin, Utensils, Megaphone, Zap, RefreshCw } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  earth: Globe,
  mercury: Zap,
  venus: RefreshCw,
  mars: Search,
  jupiter: Smartphone,
  saturn: MapPin,
  uranus: Utensils,
  neptune: Megaphone,
};

function createProceduralCanvasTexture(type: 'mercury' | 'uranus'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (type === 'mercury') {
    ctx.fillStyle = '#6B7280';
    ctx.fillRect(0, 0, 1024, 512);

    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 20 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? '#4B5563' : '#9CA3AF';
      ctx.fill();
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#A5F3FC');
    grad.addColorStop(0.3, '#06B6D4');
    grad.addColorStop(0.7, '#0891B2');
    grad.addColorStop(1, '#164E63');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    for (let y = 0; y < 512; y += 4) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
      ctx.fillRect(0, y, 1024, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export const PlanetServicesExperience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const progressRatioRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean>(true);

  const activeStage: PlanetServiceStage = useMemo(() => {
    return planetServicesData[activeStageIndex] || planetServicesData[0];
  }, [activeStageIndex]);

  const IconComponent: React.ComponentType<{ className?: string }> = useMemo(() => {
    return ICON_MAP[activeStage.id] || Globe;
  }, [activeStage.id]);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Passive Scroll Progress Calculation
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const section = containerRef.current;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight || 800;
    const totalScrollableDistance = section.offsetHeight - windowHeight;

    if (totalScrollableDistance <= 0) return;

    const currentScroll = -rect.top;
    const rawRatio = Math.max(0, Math.min(1, currentScroll / totalScrollableDistance));

    progressRatioRef.current = rawRatio;

    const calculatedIndex = Math.min(7, Math.max(0, Math.floor(rawRatio * 8)));
    setActiveStageIndex((prev) => (prev !== calculatedIndex ? calculatedIndex : prev));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  // 3D Three.js WebGL Real UV Spherical Y-Axis Rotation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      setIsWebGLAvailable(false);
    }

    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let sphereGeometry: THREE.SphereGeometry | null = null;
    const planetMeshes: Array<{ id: string; mesh: THREE.Mesh; ringMesh?: THREE.Mesh }> = [];

    if (renderer) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, (canvas.clientWidth || 800) / (canvas.clientHeight || 600), 0.1, 100);
      camera.position.z = 6.2;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
      directionalLight.position.set(5, 3, 5);
      scene.add(directionalLight);

      const textureLoader = new THREE.TextureLoader();
      sphereGeometry = new THREE.SphereGeometry(1.8, 64, 64);

      planetServicesData.forEach((stage) => {
        let texture: THREE.Texture;
        if (stage.id === 'mercury') {
          texture = createProceduralCanvasTexture('mercury');
        } else if (stage.id === 'uranus') {
          texture = createProceduralCanvasTexture('uranus');
        } else {
          texture = textureLoader.load(stage.texture);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
        }

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.65,
          metalness: 0.1,
        });

        const mesh = new THREE.Mesh(sphereGeometry!, material);
        mesh.visible = false;
        scene!.add(mesh);

        let ringMesh: THREE.Mesh | undefined;
        if (stage.id === 'saturn') {
          const ringGeo = new THREE.RingGeometry(2.2, 3.6, 64);
          const ringMat = new THREE.MeshStandardMaterial({
            color: 0xEAB308,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            roughness: 0.5,
          });
          ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.3;
          ringMesh.rotation.y = 0.2;
          mesh.add(ringMesh);
        }

        planetMeshes.push({ id: stage.id, mesh, ringMesh });
      });
    }

    let animationFrameId: number;
    let lastTime = performance.now();
    let currentYRotation = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement || !camera || !renderer) return;
      const width = canvas.parentElement.clientWidth || 800;
      const height = canvas.parentElement.clientHeight || 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Real continuous Y-axis rotation (spin)
      if (!prefersReducedMotion) {
        currentYRotation += delta * 0.6; // ~10 seconds per full revolution
        const angleDegStr = (((currentYRotation * 180) / Math.PI) % 360).toFixed(1);
        if (canvas) {
          canvas.setAttribute('data-rotation-angle', angleDegStr);
        }
        if (fallbackRef.current) {
          fallbackRef.current.setAttribute('data-rotation-angle', angleDegStr);
        }
      }

      if (renderer && scene && camera) {
        const isMobile = window.innerWidth < 768;
        const targetBaseX = isMobile ? 0 : 1.4;
        const targetBaseY = isMobile ? 1.0 : 0;
        const targetScale = isMobile ? 0.75 : 1.0;

        const currentFloatStage = progressRatioRef.current * 7;

        planetMeshes.forEach((item, idx) => {
          const dist = idx - currentFloatStage;
          const absDist = Math.abs(dist);

          if (absDist > 1.2) {
            item.mesh.visible = false;
          } else {
            item.mesh.visible = true;
            item.mesh.rotation.y = currentYRotation;

            const yOffset = -dist * 4.5;
            item.mesh.position.set(targetBaseX, targetBaseY + yOffset, 0);

            const scale = Math.max(0.3, targetScale * (1 - absDist * 0.35));
            item.mesh.scale.set(scale, scale, scale);

            const mat = item.mesh.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = Math.max(0, 1 - absDist * 1.1);
          }
        });

        renderer.render(scene, camera);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (sphereGeometry) sphereGeometry.dispose();
      planetMeshes.forEach((item) => {
        (item.mesh.material as THREE.Material).dispose();
        if (item.ringMesh) {
          item.ringMesh.geometry.dispose();
          (item.ringMesh.material as THREE.Material).dispose();
        }
      });
      if (renderer) renderer.dispose();
    };
  }, [prefersReducedMotion]);

  // Planet Navigation Button Click
  const handleStageClick = (index: number) => {
    setActiveStageIndex(index);
    progressRatioRef.current = index / 7;

    const section = containerRef.current || document.getElementById('gezegen-seruveni');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight || 800;
    const totalScrollableDistance = section.offsetHeight - windowHeight;
    const targetProgress = index / 7;
    const targetScrollY = window.scrollY + rect.top + targetProgress * totalScrollableDistance;

    window.scrollTo({
      top: targetScrollY,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      ref={containerRef}
      id="gezegen-seruveni"
      aria-label="Tam Ekran Gezegen Hizmet Serüveni"
      data-testid="planet-experience"
      data-active-index={activeStageIndex}
      data-planet-id={activeStage.id}
      className="relative w-full h-[800vh] bg-slate-950 border-t border-b border-slate-900 text-slate-100"
    >
      {/* Hidden Anchor for backwards compatibility */}
      <span id="hizmetlerimiz" className="absolute top-0 left-0" aria-hidden="true" />

      {/* Sticky Fullscreen Viewport Shell */}
      <div
        data-testid="planet-sticky-viewport"
        className="sticky top-0 w-full h-screen h-[100dvh] overflow-x-clip overflow-y-visible flex flex-col justify-between p-4 sm:p-8 lg:p-12 select-none"
      >
        {/* Background 3D WebGL Canvas Layer */}
        {isWebGLAvailable ? (
          <canvas
            ref={canvasRef}
            data-testid="active-planet"
            data-planet-id={activeStage.id}
            data-rotation-angle="0"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />
        ) : (
          /* WebGL Fallback Image Layer */
          <div
            ref={fallbackRef}
            data-testid="active-planet"
            data-planet-id={activeStage.id}
            data-rotation-angle="0"
            className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-32 pointer-events-none z-0"
          >
            <img
              src={activeStage.fallbackImage}
              alt={activeStage.planetName}
              className="w-64 h-64 sm:w-96 sm:h-96 rounded-full shadow-2xl animate-pulse-glow object-cover"
            />
          </div>
        )}

        {/* Ambient Color Glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-colors duration-700 opacity-30"
          style={{
            background: `radial-gradient(circle at 65% 50%, ${activeStage.accentColor}40, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Top Header Bar: Experience Badge & Stage Counter */}
        <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full pt-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-sky-400 backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Gezegen Hizmet Serüveni</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-400">
              Scroll ile Keşfedin
            </span>
          </div>

          {/* 01 / 08 Stage Counter */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full backdrop-blur-md shadow-xl">
            <span className="text-xs font-black tracking-wider text-sky-400">
              0{activeStage.sequence}
            </span>
            <span className="text-xs font-bold text-slate-600">/</span>
            <span className="text-xs font-bold text-slate-400">08</span>
            <span className="ml-2 pl-2 border-l border-slate-800 text-xs font-extrabold text-slate-200">
              {activeStage.planetName}
            </span>
          </div>
        </header>

        {/* Middle Main Content Grid */}
        <main className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          
          {/* Active Service Card */}
          <article
            data-testid="active-service-card"
            key={activeStage.id}
            className="lg:col-span-6 bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-slate-950/90 space-y-4 sm:space-y-5 transform-gpu transition-all duration-500 ease-out"
          >
            {/* Category & Planet Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-950/90 border border-sky-500/30 text-sky-300 font-bold text-xs">
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
            <p className="text-xs sm:text-sm md:text-base font-medium text-slate-300 leading-relaxed">
              {activeStage.description}
            </p>

            {/* 2x2 Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              {activeStage.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-200 font-semibold p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-inner"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Action CTA Button */}
            <div className="pt-2 sm:pt-3 flex items-center justify-between gap-4">
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

          {/* Reserved Space for 3D Planet on Desktop */}
          <div className="hidden lg:block lg:col-span-6 pointer-events-none" aria-hidden="true" />
        </main>

        {/* Bottom Navigation Controls */}
        <footer className="relative z-10 max-w-7xl mx-auto w-full pb-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Stage Navigation Pills */}
          <nav
            aria-label="Gezegen Hizmet Navigasyonu"
            className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-full backdrop-blur-md overflow-x-auto max-w-full"
          >
            {planetServicesData.map((stage, idx) => {
              const isActive = idx === activeStageIndex;
              return (
                <button
                  type="button"
                  key={stage.id}
                  data-testid={`planet-nav-${stage.id}`}
                  onClick={() => handleStageClick(idx)}
                  aria-label={`${stage.sequence}. Aşama: ${stage.planetName} - ${stage.serviceName}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/40 scale-105'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-80">0{stage.sequence}</span>
                  <span className={isActive ? 'inline' : 'hidden md:inline'}>{stage.planetName}</span>
                </button>
              );
            })}
          </nav>

          {/* Scroll Hint */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <span>Aşağı kaydırın</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-sky-400" />
          </div>
        </footer>

      </div>
    </section>
  );
};

export default PlanetServicesExperience;
