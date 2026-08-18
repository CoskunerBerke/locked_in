import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import planetServicesData from '../../data/planetServices';
import type { PlanetServiceStage } from '../../data/planetServices';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Globe,
  Search,
  Smartphone,
  MapPin,
  Utensils,
  Megaphone,
  Zap,
  RefreshCw,
  FolderGit2
} from 'lucide-react';

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

const STAGE_ANCHORS = [
  'dunya',
  'merkur',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptun',
];

// Transition variant: true = Warm Flame / Solar Plasma, false = Cool Fluid / Cyan Energy
const TRANSITION_VARIANTS: boolean[] = [
  false, // 0 -> 1: Dünya -> Merkür (Cool Fluid)
  true,  // 1 -> 2: Merkür -> Venüs (Warm Flame)
  true,  // 2 -> 3: Venüs -> Mars (Warm Flame)
  false, // 3 -> 4: Mars -> Jüpiter (Cool Fluid)
  true,  // 4 -> 5: Jüpiter -> Satürn (Warm Flame)
  false, // 5 -> 6: Satürn -> Uranüs (Cool Fluid)
  false, // 6 -> 7: Uranüs -> Neptün (Cool Fluid)
];

// VFX Overlay Video URLs (Clean extracted volumetric corona without UI leaks)
const VFX_VIDEOS = {
  warmForward: '/videos/planet-vfx/warm-clean-forward.mp4',
  warmReverse: '/videos/planet-vfx/warm-clean-reverse.mp4',
  coolForward: '/videos/planet-vfx/cool-clean-forward.mp4',
  coolReverse: '/videos/planet-vfx/cool-clean-reverse.mp4',
};

// Soft glowing circular alpha texture for particle embers
function createGlowParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.25, 'rgba(255, 210, 120, 0.85)');
  grad.addColorStop(0.6, 'rgba(255, 130, 40, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Procedural detailed texture for Mercury
function createMercuryDetailedTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6E7278';
  ctx.fillRect(0, 0, 2048, 1024);

  const imgData = ctx.getImageData(0, 0, 2048, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 35;
    data[i] = Math.min(255, Math.max(0, 110 + n));
    data[i + 1] = Math.min(255, Math.max(0, 112 + n));
    data[i + 2] = Math.min(255, Math.max(0, 116 + n));
  }
  ctx.putImageData(imgData, 0, 0);

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 1024;
    const r = Math.random() * 22 + 2;

    ctx.beginPath();
    ctx.arc(x - r * 0.15, y - r * 0.15, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(210, 215, 220, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(45, 48, 52, 0.4)';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural detailed texture for Uranus
function createUranusDetailedTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#A5F3FC');
  grad.addColorStop(0.35, '#06B6D4');
  grad.addColorStop(0.7, '#0891B2');
  grad.addColorStop(1, '#164E63');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  for (let y = 0; y < 512; y += 4) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
    ctx.fillRect(0, y, 1024, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// ============================================================================
// CINEMATIC HYBRID TRANSITION SHADER
// Texture Crossfade under VFX Overlay with Controlled Atmosphere
// ============================================================================
const PlanetTransitionShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexFrom;
    uniform sampler2D uTexTo;
    uniform float uProgress;       // 0.0 to 1.0 smooth animated transition
    uniform float uUvOffset;       // Continuous horizontal UV spin
    uniform float uTime;
    uniform int uVariant;          // 0 = Cool Fluid, 1 = Warm Flame
    uniform vec3 uLightDir;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec2 uv = vec2(fract(vUv.x + uUvOffset), vUv.y);

      // Diffuse Planet Textures
      vec4 texFrom = texture2D(uTexFrom, uv);
      vec4 texTo = texture2D(uTexTo, uv);

      // Smooth Crossfade in the peak middle of transition [0.35, 0.65] (1800ms to 3200ms)
      float blendFactor = smoothstep(0.35, 0.65, uProgress);
      vec4 blendedTex = mix(texFrom, texTo, blendFactor);

      // Spherical 3D Lighting (Rich shading and contrast)
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(uLightDir);
      float diff = max(dot(normal, lightDir), 0.0);
      float ambient = 0.30;
      float lighting = ambient + (1.0 - ambient) * diff;

      // Fresnel Rim Glow (Controlled elegant rim)
      vec3 viewDir = normalize(-vPosition);
      float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
      float rim = pow(fresnel, 3.5);

      vec3 rimColor = (uVariant == 1) ? vec3(1.0, 0.60, 0.20) : vec3(0.20, 0.65, 0.95);
      
      // Subtle edge flare during transition peak
      float transitionEnergy = sin(uProgress * 3.14159265);
      vec3 finalColor = blendedTex.rgb * lighting + rim * rimColor * (0.35 + transitionEnergy * 0.45);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

export const PlanetServicesExperience: React.FC = () => {
  // State Machine: 0 to 7
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const activeStageIndexRef = useRef<number>(0);

  // Gate Status: 'locked' | 'released'
  const [gateStatus, setGateStatus] = useState<'locked' | 'released'>('locked');
  const gateStatusRef = useRef<'locked' | 'released'>('locked');

  // Transition Lock State
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);

  // VFX Video Overlay State
  const [currentVfxSrc, setCurrentVfxSrc] = useState<string>(VFX_VIDEOS.coolForward);
  const [isVfxActive, setIsVfxActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Wheel Accumulator & Gesture Cooldown Refs
  const wheelAccumulatorRef = useRef<number>(0);
  const lastWheelEventAtRef = useRef<number>(0);
  const wheelCooldownUntilRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // Three.js Scene Refs
  const containerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);

  // Transition Animation Ref (2200ms discrete single-shot)
  const transitionAnimRef = useRef<{
    fromIndex: number;
    toIndex: number;
    startTime: number;
    duration: number;
  } | null>(null);

  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Synchronize ref states
  useEffect(() => {
    activeStageIndexRef.current = activeStageIndex;
  }, [activeStageIndex]);

  useEffect(() => {
    gateStatusRef.current = gateStatus;
  }, [gateStatus]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  // Reduced motion detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const activeStage: PlanetServiceStage = useMemo(() => {
    return planetServicesData[activeStageIndex] || planetServicesData[0];
  }, [activeStageIndex]);

  const IconComponent = useMemo(() => {
    return ICON_MAP[activeStage.id] || Globe;
  }, [activeStage.id]);

  // Trigger Discrete Single-Click Animated Transition (2200ms)
  const startTransitionTo = useCallback((targetIndex: number) => {
    if (isTransitioningRef.current || targetIndex === activeStageIndexRef.current) return;
    if (targetIndex < 0 || targetIndex >= planetServicesData.length) return;

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const fromIdx = activeStageIndexRef.current;
    const isForward = targetIndex > fromIdx;
    const variantIdx = Math.min(fromIdx, targetIndex);
    const isWarm = TRANSITION_VARIANTS[variantIdx];

    const duration = prefersReducedMotion ? 300 : 4800;
    wheelCooldownUntilRef.current = performance.now() + duration + 400;
    let vfxSrc = VFX_VIDEOS.coolForward;
    if (isWarm && isForward) vfxSrc = VFX_VIDEOS.warmForward;
    else if (isWarm && !isForward) vfxSrc = VFX_VIDEOS.warmReverse;
    else if (!isWarm && isForward) vfxSrc = VFX_VIDEOS.coolForward;
    else if (!isWarm && !isForward) vfxSrc = VFX_VIDEOS.coolReverse;

    setCurrentVfxSrc(vfxSrc);
    setIsVfxActive(true);

    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    transitionAnimRef.current = {
      fromIndex: fromIdx,
      toIndex: targetIndex,
      startTime: performance.now(),
      duration,
    };

    // Update WebGL material uniforms immediately
    if (shaderMaterialRef.current && texturesRef.current.length > 0) {
      shaderMaterialRef.current.uniforms.uTexFrom.value = texturesRef.current[fromIdx];
      shaderMaterialRef.current.uniforms.uTexTo.value = texturesRef.current[targetIndex];
      shaderMaterialRef.current.uniforms.uVariant.value = isWarm ? 1 : 0;
    }

    // Safety fallback timer to guarantee transition completion even if RAF is throttled in headless environments
    setTimeout(() => {
      if (isTransitioningRef.current && transitionAnimRef.current?.toIndex === targetIndex) {
        try {
          setActiveStageIndex(targetIndex);
          activeStageIndexRef.current = targetIndex;
          if (shaderMaterialRef.current && texturesRef.current.length > 0) {
            shaderMaterialRef.current.uniforms.uTexFrom.value = texturesRef.current[targetIndex] || texturesRef.current[0];
            shaderMaterialRef.current.uniforms.uTexTo.value = texturesRef.current[targetIndex] || texturesRef.current[0];
            shaderMaterialRef.current.uniforms.uProgress.value = 0.0;
          }
        } finally {
          setIsVfxActive(false);
          transitionAnimRef.current = null;
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          wheelCooldownUntilRef.current = performance.now() + 350;
        }
      }
    }, duration + 80);
  }, [prefersReducedMotion]);

  // Directional Navigation Handlers
  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current) return;
    const cur = activeStageIndexRef.current;
    if (cur > 0) {
      startTransitionTo(cur - 1);
    }
  }, [startTransitionTo]);

  const handleNext = useCallback(() => {
    if (isTransitioningRef.current) return;
    const cur = activeStageIndexRef.current;
    if (cur < planetServicesData.length - 1) {
      startTransitionTo(cur + 1);
    } else {
      // Neptune final action -> RELEASE Gate and Scroll down to Projects section
      setGateStatus('released');
      gateStatusRef.current = 'released';
      setTimeout(() => {
        const projSec = document.getElementById('portfolyo-section') || document.getElementById('projeler');
        if (projSec) {
          projSec.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  }, [startTransitionTo]);

  // Mandatory Body Scroll Lock & Wheel Accumulator Engine
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If gate is released and user is scrolled down below gate, let page scroll normally
      if (gateStatusRef.current === 'released') {
        // If user scrolls back up near top of page, re-lock gate to Neptune
        if (window.scrollY < 80 && e.deltaY < 0) {
          setGateStatus('locked');
          gateStatusRef.current = 'locked';
        }
        return;
      }

      // Gate is locked: prevent default document scroll
      e.preventDefault();

      const now = performance.now();
      if (now < wheelCooldownUntilRef.current || isTransitioningRef.current) {
        wheelAccumulatorRef.current = 0;
        return;
      }

      // Decay accumulator if time between wheel events is large
      if (now - lastWheelEventAtRef.current > 300) {
        wheelAccumulatorRef.current = 0;
      }
      lastWheelEventAtRef.current = now;

      wheelAccumulatorRef.current += e.deltaY;

      // Single event threshold: 50px
      if (wheelAccumulatorRef.current > 50) {
        wheelAccumulatorRef.current = 0;
        wheelCooldownUntilRef.current = now + 400;
        handleNext();
      } else if (wheelAccumulatorRef.current < -50) {
        wheelAccumulatorRef.current = 0;
        wheelCooldownUntilRef.current = now + 400;
        handlePrev();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gateStatusRef.current === 'locked') {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gateStatusRef.current !== 'locked' || isTransitioningRef.current) return;
      if (e.changedTouches.length > 0) {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartYRef.current - touchEndY;
        if (Math.abs(deltaY) > 45) {
          if (deltaY > 0) {
            handleNext(); // Swipe Up -> Next
          } else {
            handlePrev(); // Swipe Down -> Prev
          }
        }
      }
    };

    let pointerStartY = 0;
    const handlePointerDown = (e: PointerEvent) => {
      pointerStartY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (gateStatusRef.current !== 'locked' || isTransitioningRef.current) return;
      const deltaY = pointerStartY - e.clientY;
      if (Math.abs(deltaY) > 40) {
        if (deltaY > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gateStatusRef.current !== 'locked') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  // 3D Three.js WebGL Engine (Single Fullscreen Planet Gate)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let composer: EffectComposer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
    } catch {
      setIsWebGLAvailable(false);
    }

    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let sphereGeometry: THREE.SphereGeometry | null = null;
    let planetMesh: THREE.Mesh | null = null;
    let ringMesh: THREE.Mesh | null = null;
    let particleSystem: THREE.Points | null = null;
    let shaderMaterial: THREE.ShaderMaterial | null = null;
    const textures: THREE.Texture[] = [];

    if (renderer) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, (canvas.clientWidth || 800) / (canvas.clientHeight || 600), 0.1, 100);
      camera.position.z = 6.0;

      try {
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(canvas.clientWidth || 800, canvas.clientHeight || 600),
          0.30, // Controlled Bloom Strength
          0.20, // Bloom Radius
          0.92  // Bloom Threshold - prevents full whiteout
        );
        composer = new EffectComposer(renderer);
        composer.addPass(renderPass);
        composer.addPass(bloomPass);
      } catch (err) {
        console.warn('Bloom postprocessing fallback:', err);
        composer = null;
      }

      // Load all 8 planet textures
      const textureLoader = new THREE.TextureLoader();
      planetServicesData.forEach((stage) => {
        let tex: THREE.Texture;
        if (stage.id === 'mercury') {
          tex = createMercuryDetailedTexture();
        } else if (stage.id === 'uranus') {
          tex = createUranusDetailedTexture();
        } else {
          tex = textureLoader.load(stage.texture);
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
        }
        textures.push(tex);
      });
      texturesRef.current = textures;

      // Base Planet Mesh (Radius 1.8, 64x64 segments)
      sphereGeometry = new THREE.SphereGeometry(1.8, 64, 64);

      shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: PlanetTransitionShader.vertexShader,
        fragmentShader: PlanetTransitionShader.fragmentShader,
        uniforms: {
          uTexFrom: { value: textures[0] || null },
          uTexTo: { value: textures[0] || null },
          uProgress: { value: 0.0 },
          uUvOffset: { value: 0.0 },
          uTime: { value: 0.0 },
          uVariant: { value: 0 },
          uLightDir: { value: new THREE.Vector3(1.2, 0.8, 1.5).normalize() },
        },
      });
      shaderMaterialRef.current = shaderMaterial;

      planetMesh = new THREE.Mesh(sphereGeometry, shaderMaterial);
      scene.add(planetMesh);

      // Saturn Ring Mesh
      const ringGeo = new THREE.RingGeometry(2.15, 3.4, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xEAB308,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        roughness: 0.8,
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.6;
      ringMesh.rotation.y = 0.15;
      ringMesh.visible = false;
      scene.add(ringMesh);

      // Atmospheric Space Particles
      const particleCount = 200;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.4 + Math.random() * 2.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.09,
        map: createGlowParticleTexture(),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      particleSystem = new THREE.Points(particleGeo, particleMat);
      scene.add(particleSystem);
    }

    // Responsive Canvas Resize
    const handleResize = () => {
      if (!renderer || !camera || !canvas) return;
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (composer) composer.setSize(width, height);

      const isDesktop = width >= 1024;
      const offsetX = isDesktop ? 1.5 : 0.0;
      if (planetMesh) planetMesh.position.x = offsetX;
      if (ringMesh) ringMesh.position.x = offsetX;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Render Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let uvRotation = 0;
    let totalTime = 0;

    const render = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      totalTime += delta;

      // Continuous Slow Y-Axis Sphere Rotation
      uvRotation = (uvRotation + delta * 0.018) % 1.0;

      if (planetMesh && shaderMaterial && renderer && scene && camera) {
        planetMesh.rotation.y = uvRotation * Math.PI * 2 * 0.2;

        let currentProgress = 0.0;
        const anim = transitionAnimRef.current;

        if (anim) {
          const elapsed = now - anim.startTime;
          const rawT = Math.min(Math.max(elapsed / anim.duration, 0.0), 1.0);
          currentProgress = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          if (rawT >= 1.0) {
            // Transition completed!
            try {
              const targetIdx = anim.toIndex;
              setActiveStageIndex(targetIdx);
              activeStageIndexRef.current = targetIdx;
              if (shaderMaterial) {
                shaderMaterial.uniforms.uTexFrom.value = textures[targetIdx] || textures[0];
                shaderMaterial.uniforms.uTexTo.value = textures[targetIdx] || textures[0];
                shaderMaterial.uniforms.uProgress.value = 0.0;
              }
            } finally {
              setIsVfxActive(false);
              transitionAnimRef.current = null;
              isTransitioningRef.current = false;
              setIsTransitioning(false);
              wheelCooldownUntilRef.current = performance.now() + 350;
            }
          }
        }

        // Viewport Placement: Left Side Service Card, Right Side 3D Sphere
        const isMobile = window.innerWidth < 1024;
        const targetX = isMobile ? 0 : 1.7;
        const targetY = isMobile ? 0.9 : 0;
        const targetScale = isMobile ? 0.78 : 1.0;

        planetMesh.position.set(targetX, targetY, 0);
        planetMesh.scale.set(targetScale, targetScale, targetScale);

        if (ringMesh) {
          ringMesh.position.set(targetX, targetY, 0);
          ringMesh.scale.set(targetScale, targetScale, targetScale);
        }
        if (particleSystem) {
          particleSystem.position.set(targetX, targetY, 0);
          particleSystem.rotation.y += delta * 0.25;
        }

        // Update Shader Uniforms
        shaderMaterial.uniforms.uProgress.value = currentProgress;
        shaderMaterial.uniforms.uUvOffset.value = uvRotation;
        shaderMaterial.uniforms.uTime.value = totalTime;

        // Saturn Ring Visibility & Opacity
        if (ringMesh) {
          const activeIdx = transitionAnimRef.current ? transitionAnimRef.current.toIndex : activeStageIndexRef.current;
          const fromIdx = transitionAnimRef.current ? transitionAnimRef.current.fromIndex : activeStageIndexRef.current;
          let ringOpacity = 0;
          if (activeIdx === 5 && fromIdx === 5) {
            ringOpacity = 0.85;
          } else if (activeIdx === 5) {
            ringOpacity = currentProgress * 0.85;
          } else if (fromIdx === 5) {
            ringOpacity = (1.0 - currentProgress) * 0.85;
          }
          (ringMesh.material as THREE.MeshStandardMaterial).opacity = ringOpacity;
          ringMesh.visible = ringOpacity > 0.01;
        }

        if (composer) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (sphereGeometry) sphereGeometry.dispose();
      if (shaderMaterial) shaderMaterial.dispose();
      textures.forEach((t) => t.dispose());
      if (ringMesh) {
        ringMesh.geometry.dispose();
        (ringMesh.material as THREE.Material).dispose();
      }
      if (renderer) renderer.dispose();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      id="gezegen-seruveni"
      aria-label="Rent Yazılım Planet Gate - Dijital Hizmet Serüveni"
      data-testid="planet-gate"
      data-gate-status={gateStatus}
      data-active-index={activeStageIndex}
      data-active-planet={activeStage.id}
      data-transitioning={isTransitioning ? 'true' : 'false'}
      style={{
        height: 'calc(100dvh - 5rem)',
        minHeight: 'calc(100svh - 5rem)',
      }}
      className="relative w-full bg-slate-950 border-b border-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12 select-none overflow-hidden"
    >
      {/* Direct Anchor Targets for URL Navigation */}
      <span id="hizmetlerimiz" className="absolute top-0 left-0" aria-hidden="true" />
      {STAGE_ANCHORS.map((anchor) => (
        <span key={anchor} id={anchor} className="absolute top-0 left-0" aria-hidden="true" />
      ))}

      {/* Layer 1: Background 3D WebGL Canvas Layer (Fixed Perfect Sphere) */}
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

      {/* Layer 2: Real-time Clean VFX Video Overlay from Reference Flow (Screen Composited) */}
      <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[10vw] xl:pr-[13vw] pointer-events-none z-10 overflow-hidden" aria-hidden="true">
        <video
          ref={videoRef}
          src={currentVfxSrc}
          playsInline
          muted
          preload="auto"
          controls={false}
          tabIndex={-1}
          aria-hidden="true"
          className={`w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] lg:w-[600px] lg:h-[600px] object-cover transition-opacity duration-500 pointer-events-none ${
            isVfxActive ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Ambient Color Glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-colors duration-700 opacity-20"
        style={{
          background: `radial-gradient(circle at 65% 50%, ${activeStage.accentColor}35, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Top Header Bar: Integrated Hero Brand Proposition & Stage Counter */}
      <header className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-sky-950/90 border border-sky-400/30 text-sky-300 backdrop-blur-md shadow-lg w-fit">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>DİJİTAL HİZMET SERÜVENİ</span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wide">
            Tasarım, Yazılım ve Büyüme Tek Ekipte
          </span>
        </div>

        {/* 01 / 08 Stage Counter */}
        <div
          aria-live="polite"
          className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full backdrop-blur-md shadow-xl"
        >
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

      {/* Middle Main Content Grid (Service Card on Left, 3D Planet on Right) */}
      <main className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-2">
        
        {/* Active Service Card */}
        <article
          data-testid="active-service-card"
          key={activeStage.id}
          className="lg:col-span-6 xl:col-span-5 bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-slate-950/90 space-y-4 sm:space-y-5 transition-all duration-500 ease-out"
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

        {/* Reserved Clearance for 3D Planet on Desktop */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 pointer-events-none" aria-hidden="true" />
      </main>

      {/* Bottom Navigation Controls: Read-only Progress Pills on Left, Directional Controls on Right */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full pb-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Read-only Progress Indicators (Non-skipping) */}
        <div
          aria-label="Gezegen Hizmet İlerleme Durumu"
          className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-full backdrop-blur-md overflow-x-auto max-w-full"
        >
          {planetServicesData.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            const isCompleted = idx < activeStageIndex;
            return (
              <div
                key={stage.id}
                data-testid={`planet-indicator-${stage.id}`}
                aria-current={isActive ? 'step' : undefined}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/40 scale-105'
                    : isCompleted
                    ? 'bg-sky-950/60 text-sky-400 border border-sky-500/20'
                    : 'bg-slate-900/60 text-slate-500'
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">0{stage.sequence}</span>
                <span className={isActive ? 'inline' : 'hidden md:inline'}>{stage.planetName}</span>
              </div>
            );
          })}
        </div>

        {/* Directional Controls (Prev / Next Buttons & Scroll Hint) */}
        <div className="flex items-center gap-3">
          <span className="hidden xl:inline-block text-[11px] font-bold text-slate-400">
            Aşağı Kaydırın veya Ok Tuşlarını Kullanın
          </span>

          {/* Previous Planet Button (Up Arrow) */}
          <button
            type="button"
            data-testid="planet-prev"
            disabled={activeStageIndex === 0 || isTransitioning}
            onClick={handlePrev}
            aria-label="Önceki Gezegen"
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900/90 focus-visible:ring-2 focus-visible:ring-sky-400 focus:outline-none active:scale-95"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* Next Planet Button (Down Arrow) or Explore Projects Button on Neptune */}
          {activeStageIndex < planetServicesData.length - 1 ? (
            <button
              type="button"
              data-testid="planet-next"
              disabled={isTransitioning}
              onClick={handleNext}
              aria-label={`Sonraki Gezegen: ${planetServicesData[activeStageIndex + 1]?.planetName}`}
              className="h-12 min-h-[48px] px-5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-400 focus:outline-none active:scale-95"
            >
              <span>Sonraki: {planetServicesData[activeStageIndex + 1]?.planetName}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              data-testid="planet-next"
              disabled={isTransitioning}
              onClick={handleNext}
              aria-label="Projelerimizi Keşfet"
              className="h-12 min-h-[48px] px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none active:scale-95"
            >
              <span>Projelerimizi Keşfet</span>
              <FolderGit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>

      {/* No-JS Semantic Static Service Catalogue Fallback */}
      <noscript>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          {planetServicesData.map((stage) => (
            <div key={stage.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-sky-400">{stage.planetName}</span>
              <h3 className="text-sm font-bold text-white">{stage.serviceName}</h3>
              <p className="text-xs text-slate-400">{stage.description}</p>
              <a href={stage.href} className="text-xs text-sky-400 font-bold hover:underline inline-block pt-1">
                Detayları İncele →
              </a>
            </div>
          ))}
        </div>
      </noscript>
    </section>
  );
};

export default PlanetServicesExperience;
