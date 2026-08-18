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

// Transition variant: true = Hot Flame/Plasma (Variant A), false = Cold Fluid/Cyan Energy (Variant B)
const TRANSITION_VARIANTS: boolean[] = [
  false, // 0 -> 1: Dünya -> Merkür (Cold Fluid / Liquid Electric Energy)
  true,  // 1 -> 2: Merkür -> Venüs (Hot Flame / Solar Plasma)
  true,  // 2 -> 3: Venüs -> Mars (Hot Flame / Solar Plasma)
  false, // 3 -> 4: Mars -> Jüpiter (Cold Fluid / Electric Energy)
  true,  // 4 -> 5: Jüpiter -> Satürn (Hot Flame / Solar Plasma)
  false, // 5 -> 6: Satürn -> Uranüs (Cold Fluid / Ice Energy)
  false, // 6 -> 7: Uranüs -> Neptün (Cold Fluid / Deep Ocean Energy)
];

// Soft glowing circular alpha texture for particle embers (prevents square artifacts)
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

  for (let i = 0; i < 8; i++) {
    const bx = Math.random() * 2048;
    const by = Math.random() * 1024;
    const br = Math.random() * 45 + 30;

    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br * 3);
    grad.addColorStop(0, 'rgba(240, 245, 250, 0.35)');
    grad.addColorStop(0.4, 'rgba(180, 185, 190, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, br * 3, 0, Math.PI * 2);
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
// CINEMATIC FLUID / FLAME TRANSITION SHADER
// Smooth Wave Front + Controlled Hot Core + Fluid/Flame Plasma Shading
// ============================================================================
const CinematicFluidFlameShader = {
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
    uniform int uVariant;          // 0 = Cold Fluid Energy (Cyan), 1 = Hot Flame Plasma (Gold/Orange)
    uniform vec3 uLightDir;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // 3D Simplex & FBM Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * snoise(p); p *= 2.02;
      f += 0.2500 * snoise(p); p *= 2.03;
      f += 0.1250 * snoise(p);
      return f;
    }

    void main() {
      vec2 uv = vec2(fract(vUv.x + uUvOffset), vUv.y);

      vec4 texFrom = texture2D(uTexFrom, uv);
      vec4 texTo = texture2D(uTexTo, uv);

      float diffuse = max(0.22, dot(vNormal, normalize(uLightDir)));
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.4);

      if (uProgress <= 0.001) {
        vec3 finalCol = texFrom.rgb * diffuse + vec3(0.1, 0.45, 0.85) * (fresnel * 0.3);
        gl_FragColor = vec4(finalCol, 1.0);
        return;
      }
      if (uProgress >= 0.999) {
        vec3 finalCol = texTo.rgb * diffuse + vec3(0.3, 0.3, 0.3) * (fresnel * 0.25);
        gl_FragColor = vec4(finalCol, 1.0);
        return;
      }

      // Smooth flowing wave front sweeping diagonally across sphere
      vec3 flowPos = vPosition * 1.5 + vec3(uTime * 0.3, uTime * 0.2, uTime * 0.15);
      float flowNoise = fbm(flowPos);

      float sweepCoord = (vPosition.x * 0.75 + vPosition.y * 0.65 - vPosition.z * 0.3) / 1.8;
      float waveFront = sweepCoord + flowNoise * 0.45;

      float threshold = mix(-1.2, 1.2, uProgress);
      float dist = waveFront - threshold;

      float blendFactor = smoothstep(-0.15, 0.15, dist);
      vec3 blendedTex = mix(texTo.rgb, texFrom.rgb, blendFactor);

      // Controlled color palettes (no full-screen blinding whiteout)
      vec3 coreWhite = vec3(1.0, 0.98, 0.92);
      vec3 energyPrimary = (uVariant == 1)
        ? vec3(1.0, 0.42, 0.05)   // Flame Orange / Solar Gold
        : vec3(0.05, 0.75, 1.0);  // Cyan / Electric Blue Fluid

      vec3 energySecondary = (uVariant == 1)
        ? vec3(1.0, 0.85, 0.2)    // Warm Yellow
        : vec3(0.4, 0.95, 1.0);   // Bright Cyan

      vec3 energyDeep = (uVariant == 1)
        ? vec3(0.75, 0.12, 0.02)  // Crimson Plasma
        : vec3(0.0, 0.2, 0.65);   // Indigo Fluid

      // 1. Hot Energy Core Line (Clean, high-contrast, non-blinding)
      float coreIntensity = exp(-abs(dist) * 20.0) * sin(uProgress * 3.14159) * 2.2;

      // 2. Volumetric Fluid / Flame Wave Body
      float waveBody = exp(-max(0.0, dist) * 5.5) * exp(-max(0.0, -dist) * 3.0) * sin(uProgress * 3.14159) * 1.6;

      // 3. Subtle ambient plasma aura
      float activeDispersal = sin(uProgress * 3.14159) * 0.25 * (flowNoise * 0.5 + 0.5);

      vec3 waveGlow = coreWhite * coreIntensity
                    + energySecondary * (waveBody * 0.7)
                    + energyPrimary * (waveBody * 1.0 + activeDispersal)
                    + energyDeep * (fresnel * sin(uProgress * 3.14159) * 1.2);

      vec3 finalColor = blendedTex * diffuse + waveGlow;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// ============================================================================
// VOLUMETRIC OUTER FLAME / CORONA SHADER (Layer 3)
// ============================================================================
const OuterCoronaShader = {
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
    uniform float uProgress;
    uniform float uTime;
    uniform int uVariant;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
      rim = pow(rim, 2.0);

      vec3 noisePos = vPosition * 2.2 + vec3(uTime * 0.4, uTime * 0.3, uTime * 0.2);
      float flameNoise = snoise(noisePos) * 0.5 + 0.5;

      float activity = sin(uProgress * 3.14159);
      float alpha = rim * flameNoise * activity * 0.75;

      vec3 flameColor = (uVariant == 1)
        ? mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.85, 0.2), flameNoise)
        : mix(vec3(0.05, 0.6, 1.0), vec3(0.4, 0.95, 1.0), flameNoise);

      gl_FragColor = vec4(flameColor * 1.5, alpha);
    }
  `
};

export const PlanetServicesExperience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const activeStageIndexRef = useRef<number>(0);

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);

  // Transition animation refs
  const transitionAnimRef = useRef<{
    fromIndex: number;
    toIndex: number;
    startTime: number;
    duration: number;
  } | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean>(true);

  // Active stage data
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

  // Three.js Scene References
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const coronaMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const ringMeshRef = useRef<THREE.Mesh | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);

  // Smooth easeInOutCubic function
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Trigger Complete Single-Click Animated Transition (1500ms)
  const startTransitionTo = useCallback((targetIndex: number) => {
    if (isTransitioningRef.current || targetIndex === activeStageIndexRef.current) return;
    if (targetIndex < 0 || targetIndex >= planetServicesData.length) return;

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const fromIdx = activeStageIndexRef.current;
    const duration = prefersReducedMotion ? 300 : 1500;

    transitionAnimRef.current = {
      fromIndex: fromIdx,
      toIndex: targetIndex,
      startTime: performance.now(),
      duration,
    };

    // Update target uniforms immediately
    if (shaderMaterialRef.current && texturesRef.current.length > 0) {
      shaderMaterialRef.current.uniforms.uTexFrom.value = texturesRef.current[fromIdx];
      shaderMaterialRef.current.uniforms.uTexTo.value = texturesRef.current[targetIndex];
      const variantIdx = Math.min(fromIdx, targetIndex);
      shaderMaterialRef.current.uniforms.uVariant.value = TRANSITION_VARIANTS[variantIdx] ? 1 : 0;
    }
    if (coronaMaterialRef.current) {
      const variantIdx = Math.min(fromIdx, targetIndex);
      coronaMaterialRef.current.uniforms.uVariant.value = TRANSITION_VARIANTS[variantIdx] ? 1 : 0;
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
          if (coronaMaterialRef.current) {
            coronaMaterialRef.current.uniforms.uProgress.value = 0.0;
          }
        } finally {
          transitionAnimRef.current = null;
          isTransitioningRef.current = false;
          setIsTransitioning(false);
        }
      }
    }, duration + 60);
  }, [prefersReducedMotion]);

  // Arrow Navigation Handlers
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
      // Neptune final action -> Scroll down to Projects section
      const projSec = document.getElementById('portfolyo-section') || document.getElementById('projeler');
      if (projSec) {
        projSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [startTransitionTo]);

  // 3D Three.js WebGL Engine (Single Fullscreen Section)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let composer: EffectComposer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    } catch {
      setIsWebGLAvailable(false);
    }

    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let sphereGeometry: THREE.SphereGeometry | null = null;
    let planetMesh: THREE.Mesh | null = null;
    let coronaMesh: THREE.Mesh | null = null;
    let ringMesh: THREE.Mesh | null = null;
    let particleSystem: THREE.Points | null = null;
    let shaderMaterial: THREE.ShaderMaterial | null = null;
    let coronaMaterial: THREE.ShaderMaterial | null = null;
    const textures: THREE.Texture[] = [];

    if (renderer) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, (canvas.clientWidth || 800) / (canvas.clientHeight || 600), 0.1, 100);
      camera.position.z = 6.0;

      try {
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(canvas.clientWidth || 800, canvas.clientHeight || 600),
          0.75, // Bloom Strength
          0.35, // Bloom Radius
          0.7   // Bloom Threshold
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

      // Layer 1: Base Planet Mesh (Radius 1.8, 64x64 segments)
      sphereGeometry = new THREE.SphereGeometry(1.8, 64, 64);

      shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: CinematicFluidFlameShader.vertexShader,
        fragmentShader: CinematicFluidFlameShader.fragmentShader,
        uniforms: {
          uTexFrom: { value: textures[0] },
          uTexTo: { value: textures[1] || textures[0] },
          uProgress: { value: 0.0 },
          uUvOffset: { value: 0.0 },
          uTime: { value: 0.0 },
          uVariant: { value: 0 },
          uLightDir: { value: new THREE.Vector3(5.0, 3.0, 5.0).normalize() },
        },
      });
      shaderMaterialRef.current = shaderMaterial;

      planetMesh = new THREE.Mesh(sphereGeometry, shaderMaterial);
      scene.add(planetMesh);

      // Layer 3: Outer Volumetric Corona / Flame Mesh (Radius 1.96)
      const coronaGeo = new THREE.SphereGeometry(1.96, 48, 48);
      coronaMaterial = new THREE.ShaderMaterial({
        vertexShader: OuterCoronaShader.vertexShader,
        fragmentShader: OuterCoronaShader.fragmentShader,
        uniforms: {
          uProgress: { value: 0.0 },
          uTime: { value: 0.0 },
          uVariant: { value: 0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      });
      coronaMaterialRef.current = coronaMaterial;
      coronaMesh = new THREE.Mesh(coronaGeo, coronaMaterial);
      scene.add(coronaMesh);

      // Saturn Ring Mesh
      const ringGeo = new THREE.RingGeometry(2.3, 3.7, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xEAB308,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
        roughness: 0.5,
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.3;
      ringMesh.rotation.y = 0.2;
      ringMeshRef.current = ringMesh;
      scene.add(ringMesh);

      // Layer 4: Soft Glowing Circular Particle Embers
      const particleCount = 320;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const radius = 1.85 + Math.random() * 0.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const glowParticleTex = createGlowParticleTexture();

      const particleMat = new THREE.PointsMaterial({
        map: glowParticleTex,
        size: 0.18,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      particleSystem = new THREE.Points(particleGeo, particleMat);
      particleSystemRef.current = particleSystem;
      scene.add(particleSystem);
    }

    let animationFrameId: number;
    let lastTime = performance.now();
    let uvRotation = 0;
    let totalTime = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement || !camera || !renderer) return;
      const width = canvas.parentElement.clientWidth || 800;
      const height = canvas.parentElement.clientHeight || 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (composer) composer.setSize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      totalTime += delta;

      // Continuous Y-axis rotation (spin)
      if (!prefersReducedMotion) {
        uvRotation += delta * 0.07;
        const angleDeg = Math.round(((uvRotation * 360) % 360));
        if (canvas) {
          canvas.setAttribute('data-rotation-angle', String(angleDeg));
        }
        if (fallbackRef.current) {
          fallbackRef.current.setAttribute('data-rotation-angle', String(angleDeg));
        }
      }

      // Handle animated transition progress
      let currentProgress = 0.0;
      if (transitionAnimRef.current) {
        const anim = transitionAnimRef.current;
        const elapsed = now - anim.startTime;
        const rawT = Math.min(1.0, Math.max(0.0, elapsed / anim.duration));
        currentProgress = easeInOutCubic(rawT);

        if (rawT >= 1.0) {
          // Transition finished!
          try {
            const targetIdx = anim.toIndex;
            setActiveStageIndex(targetIdx);
            activeStageIndexRef.current = targetIdx;
            if (shaderMaterial) {
              shaderMaterial.uniforms.uTexFrom.value = textures[targetIdx] || textures[0];
              shaderMaterial.uniforms.uTexTo.value = textures[targetIdx] || textures[0];
              shaderMaterial.uniforms.uProgress.value = 0.0;
            }
            if (coronaMaterial) {
              coronaMaterial.uniforms.uProgress.value = 0.0;
            }
          } finally {
            transitionAnimRef.current = null;
            isTransitioningRef.current = false;
            setIsTransitioning(false);
          }
        }
      }

      if (renderer && scene && camera && shaderMaterial && planetMesh) {
        const isMobile = window.innerWidth < 768;
        const targetX = isMobile ? 0 : 1.7;
        const targetY = isMobile ? 0.9 : 0;
        const targetScale = isMobile ? 0.78 : 1.0;

        planetMesh.position.set(targetX, targetY, 0);
        planetMesh.scale.set(targetScale, targetScale, targetScale);

        if (coronaMesh) {
          coronaMesh.position.set(targetX, targetY, 0);
          coronaMesh.scale.set(targetScale, targetScale, targetScale);
        }
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

        if (coronaMaterial) {
          coronaMaterial.uniforms.uProgress.value = currentProgress;
          coronaMaterial.uniforms.uTime.value = totalTime;
        }

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

        // Particle System Dynamics (Embers active during transition)
        if (particleSystem) {
          const particleIntensity = Math.sin(currentProgress * Math.PI);
          (particleSystem.material as THREE.PointsMaterial).opacity = particleIntensity * 0.85;
          const activeVariantIdx = transitionAnimRef.current ? Math.min(transitionAnimRef.current.fromIndex, transitionAnimRef.current.toIndex) : activeStageIndexRef.current;
          (particleSystem.material as THREE.PointsMaterial).color.setHex(
            TRANSITION_VARIANTS[activeVariantIdx] ? 0xF59E0B : 0x38BDF8
          );
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
      if (coronaMaterial) coronaMaterial.dispose();
      textures.forEach((t) => t.dispose());
      if (ringMesh) {
        ringMesh.geometry.dispose();
        (ringMesh.material as THREE.Material).dispose();
      }
      if (renderer) renderer.dispose();
    };
  }, [prefersReducedMotion]);

  // Planet Navigation Pill Click
  const handlePillClick = (index: number) => {
    if (isTransitioningRef.current || index === activeStageIndexRef.current) return;
    startTransitionTo(index);
  };

  return (
    <section
      ref={containerRef}
      id="gezegen-seruveni"
      aria-label="Tam Ekran Gezegen Hizmet Serüveni"
      data-testid="planet-experience"
      data-active-index={activeStageIndex}
      data-transitioning={isTransitioning ? 'true' : 'false'}
      data-planet-id={activeStage.id}
      className="relative w-full min-h-[calc(100svh-5rem)] min-h-[90vh] bg-slate-950 border-t border-b border-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12 select-none overflow-hidden"
    >
      {/* 8 Fullscreen Anchor Targets for URL Hash Direct Navigation */}
      <span id="hizmetlerimiz" className="absolute top-0 left-0" aria-hidden="true" />
      {STAGE_ANCHORS.map((anchor) => (
        <span key={anchor} id={anchor} className="absolute top-0 left-0" aria-hidden="true" />
      ))}

      {/* Background 3D WebGL Canvas Layer (Fixed Perfect Sphere) */}
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
        className="absolute inset-0 pointer-events-none z-0 transition-colors duration-700 opacity-20"
        style={{
          background: `radial-gradient(circle at 65% 50%, ${activeStage.accentColor}35, transparent 70%)`,
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
            Yön Tuşlarıyla Keşfedin
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

      {/* Middle Main Content Grid (Service Card on Left, 3D Planet on Right with Safe Clearance) */}
      <main className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-4">
        
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

        {/* Reserved Space for 3D Planet on Desktop */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 pointer-events-none" aria-hidden="true" />
      </main>

      {/* Bottom Navigation Controls: Pills on Left, Directional Arrow Controls on Right */}
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
                disabled={isTransitioning}
                onClick={() => handlePillClick(idx)}
                aria-label={`${stage.sequence}. Aşama: ${stage.planetName} - ${stage.serviceName}`}
                aria-current={isActive ? 'step' : undefined}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
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

        {/* Directional Arrow Controls (Prev / Next Buttons) */}
        <div className="flex items-center gap-3">
          {/* Previous Planet Button (Up Arrow) */}
          <button
            type="button"
            data-testid="planet-prev"
            disabled={activeStageIndex === 0 || isTransitioning}
            onClick={handlePrev}
            aria-label="Önceki Gezegen"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900/90 focus-visible:ring-2 focus-visible:ring-sky-400 focus:outline-none active:scale-95"
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
              className="h-11 min-h-[44px] px-4 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-400 focus:outline-none active:scale-95"
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
              className="h-11 min-h-[44px] px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none active:scale-95"
            >
              <span>Projelerimizi Keşfet</span>
              <FolderGit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </section>
  );
};

export default PlanetServicesExperience;
