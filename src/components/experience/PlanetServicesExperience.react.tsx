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

// Transition variants map: true = Hot Plasma (Variant A), false = Cold Energy (Variant B)
const TRANSITION_VARIANTS: boolean[] = [
  false, // 0 -> 1: Earth -> Mercury (Cold Energy)
  true,  // 1 -> 2: Mercury -> Venus (Hot Plasma)
  true,  // 2 -> 3: Venus -> Mars (Hot Plasma)
  false, // 3 -> 4: Mars -> Jupiter (Cold Energy)
  true,  // 4 -> 5: Jupiter -> Saturn (Hot Plasma)
  false, // 5 -> 6: Saturn -> Uranus (Cold Energy)
  false, // 6 -> 7: Uranus -> Neptune (Cold Energy)
];

// Procedural textures for Mercury and Uranus
function createProceduralCanvasTexture(type: 'mercury' | 'uranus'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (type === 'mercury') {
    ctx.fillStyle = '#6B7280';
    ctx.fillRect(0, 0, 1024, 512);

    // Realistic cratering and noise
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 16 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? '#374151' : '#9CA3AF';
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
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.18})`;
      ctx.fillRect(0, y, 1024, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Custom GLSL Shader for Real-time Sphere Texture Morph & Energy Dissolve
const PlanetMorphShader = {
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
    uniform float uProgress;       // 0.0 to 1.0 between current and next stage
    uniform float uUvOffset;       // Continuous Y-axis spin rotation
    uniform float uTime;
    uniform int uVariant;          // 0 = Cold Energy (Cyan/Blue), 1 = Hot Plasma (Gold/Orange)
    uniform vec3 uColorFrom;
    uniform vec3 uColorTo;
    uniform vec3 uLightDir;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Fast 2D Simplex-style Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Horizontal spherical UV offset for continuous Y-axis rotation
      vec2 uv = vec2(fract(vUv.x + uUvOffset), vUv.y);

      vec4 texFrom = texture2D(uTexFrom, uv);
      vec4 texTo = texture2D(uTexTo, uv);

      // Noise pattern for dissolve mask
      float noiseVal = snoise(vPosition.xy * 2.5 + vec2(uTime * 0.4, uTime * 0.2)) * 0.5 + 0.5;

      // Energy glow color depending on variant
      vec3 energyColor = (uVariant == 1)
        ? mix(vec3(1.0, 0.45, 0.1), vec3(1.0, 0.85, 0.2), noiseVal)   // Hot Plasma (Orange/Gold)
        : mix(vec3(0.1, 0.65, 1.0), vec3(0.2, 0.95, 0.95), noiseVal); // Cold Energy (Cyan/Blue)

      // Lighting calculation (Directional Light + Ambient)
      float diffuse = max(0.15, dot(vNormal, normalize(uLightDir)));
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2);

      // Morph interpolation
      vec4 finalColor;
      if (uProgress <= 0.001) {
        finalColor = texFrom;
      } else if (uProgress >= 0.999) {
        finalColor = texTo;
      } else {
        // Transition curve
        float dissolveThreshold = uProgress;
        float edge = smoothstep(dissolveThreshold - 0.15, dissolveThreshold + 0.15, noiseVal);

        // Blend textures with dissolve boundary
        vec3 blendedTex = mix(texTo.rgb, texFrom.rgb, edge);

        // Glowing edge energy burst along dissolve contour
        float glowIntensity = 1.0 - abs(edge - 0.5) * 2.0;
        glowIntensity = pow(max(0.0, glowIntensity), 1.8) * sin(uProgress * 3.14159) * 2.5;

        // Core energy shell at peak transition (uProgress ~ 0.5)
        float coreEnergy = sin(uProgress * 3.14159) * 0.6;

        vec3 surfaceColor = blendedTex + energyColor * glowIntensity + energyColor * coreEnergy * (noiseVal * 0.5 + 0.5);
        finalColor = vec4(surfaceColor, 1.0);
      }

      // Apply directional shading and subtle atmospheric rim glow
      vec3 litColor = finalColor.rgb * diffuse + energyColor * (fresnel * 0.5 * sin(uProgress * 3.14159));
      gl_FragColor = vec4(litColor, 1.0);
    }
  `
};

export const PlanetServicesExperience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [localProgress, setLocalProgress] = useState<number>(0); // 0.0 to 1.0 between current and next
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

  // Passive High-Precision Scroll Progress Calculation
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

    // Map 0..1 to 8 equal stage intervals (0..7)
    const floatStage = rawRatio * 8;
    const stageIdx = Math.min(7, Math.max(0, Math.floor(floatStage)));
    const stageProg = Math.max(0, Math.min(1, floatStage - stageIdx));

    setActiveStageIndex((prev) => (prev !== stageIdx ? stageIdx : prev));
    setLocalProgress(stageProg);
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

  // 3D Three.js WebGL Real-time Morph Shader Engine on Fixed Perfect Sphere
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
    let planetMesh: THREE.Mesh | null = null;
    let ringMesh: THREE.Mesh | null = null;
    let particleSystem: THREE.Points | null = null;
    let shaderMaterial: THREE.ShaderMaterial | null = null;
    const textures: THREE.Texture[] = [];

    if (renderer) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, (canvas.clientWidth || 800) / (canvas.clientHeight || 600), 0.1, 100);
      camera.position.z = 6.2;

      // Load all 8 planet textures
      const textureLoader = new THREE.TextureLoader();
      planetServicesData.forEach((stage) => {
        let tex: THREE.Texture;
        if (stage.id === 'mercury') {
          tex = createProceduralCanvasTexture('mercury');
        } else if (stage.id === 'uranus') {
          tex = createProceduralCanvasTexture('uranus');
        } else {
          tex = textureLoader.load(stage.texture);
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
        }
        textures.push(tex);
      });

      // Fixed Perfect Sphere Geometry (Radius 1.8, 64x64 segments)
      sphereGeometry = new THREE.SphereGeometry(1.8, 64, 64);

      shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: PlanetMorphShader.vertexShader,
        fragmentShader: PlanetMorphShader.fragmentShader,
        uniforms: {
          uTexFrom: { value: textures[0] },
          uTexTo: { value: textures[1] || textures[0] },
          uProgress: { value: 0.0 },
          uUvOffset: { value: 0.0 },
          uTime: { value: 0.0 },
          uVariant: { value: 0 },
          uColorFrom: { value: new THREE.Color(0x3B82F6) },
          uColorTo: { value: new THREE.Color(0x9CA3AF) },
          uLightDir: { value: new THREE.Vector3(5.0, 3.0, 5.0).normalize() },
        },
      });

      planetMesh = new THREE.Mesh(sphereGeometry, shaderMaterial);
      scene.add(planetMesh);

      // Saturn Ring Mesh attached to same center
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
      scene.add(ringMesh);

      // Energy Particle System around the Sphere
      const particleCount = 200;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const radius = 2.0 + Math.random() * 0.8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x38BDF8,
        size: 0.06,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
      });
      particleSystem = new THREE.Points(particleGeo, particleMat);
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
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      totalTime += delta;

      // Continuous Y-axis rotation (spin)
      if (!prefersReducedMotion) {
        uvRotation += delta * 0.08; // Continuous horizontal UV spin
        const angleDeg = Math.round(((uvRotation * 360) % 360));
        if (canvas) {
          canvas.setAttribute('data-rotation-angle', String(angleDeg));
        }
        if (fallbackRef.current) {
          fallbackRef.current.setAttribute('data-rotation-angle', String(angleDeg));
        }
      }

      if (renderer && scene && camera && shaderMaterial && planetMesh) {
        const isMobile = window.innerWidth < 768;
        const targetX = isMobile ? 0 : 1.4;
        const targetY = isMobile ? 0.9 : 0;
        const targetScale = isMobile ? 0.78 : 1.0;

        // Keep planet in fixed central position at all times!
        planetMesh.position.set(targetX, targetY, 0);
        planetMesh.scale.set(targetScale, targetScale, targetScale);

        if (ringMesh) {
          ringMesh.position.set(targetX, targetY, 0);
          ringMesh.scale.set(targetScale, targetScale, targetScale);
        }
        if (particleSystem) {
          particleSystem.position.set(targetX, targetY, 0);
          particleSystem.rotation.y += delta * 0.3;
        }

        // Calculate exact stage transition indices and progress
        const floatStage = progressRatioRef.current * 8;
        const stageIndex = Math.min(7, Math.max(0, Math.floor(floatStage)));
        const nextStageIndex = Math.min(7, stageIndex + 1);
        const stageProgress = Math.max(0, Math.min(1, floatStage - stageIndex));

        // Update Shader Uniforms
        shaderMaterial.uniforms.uTexFrom.value = textures[stageIndex] || textures[0];
        shaderMaterial.uniforms.uTexTo.value = textures[nextStageIndex] || textures[stageIndex];
        shaderMaterial.uniforms.uProgress.value = stageProgress;
        shaderMaterial.uniforms.uUvOffset.value = uvRotation;
        shaderMaterial.uniforms.uTime.value = totalTime;
        shaderMaterial.uniforms.uVariant.value = TRANSITION_VARIANTS[stageIndex] ? 1 : 0;

        // Saturn Ring Opacity (Stage 5 = Saturn)
        if (ringMesh) {
          let ringOpacity = 0;
          if (stageIndex === 5 && stageProgress <= 0.5) {
            ringOpacity = (1.0 - stageProgress * 2.0) * 0.85;
          } else if (nextStageIndex === 5 && stageProgress > 0.5) {
            ringOpacity = ((stageProgress - 0.5) * 2.0) * 0.85;
          } else if (stageIndex === 5) {
            ringOpacity = 0.85;
          }
          (ringMesh.material as THREE.MeshStandardMaterial).opacity = ringOpacity;
          ringMesh.visible = ringOpacity > 0.01;
        }

        // Particle System Opacity during Morph
        if (particleSystem) {
          const particleIntensity = Math.sin(stageProgress * Math.PI);
          (particleSystem.material as THREE.PointsMaterial).opacity = particleIntensity * 0.7;
          (particleSystem.material as THREE.PointsMaterial).color.setHex(
            TRANSITION_VARIANTS[stageIndex] ? 0xF59E0B : 0x38BDF8
          );
        }

        renderer.render(scene, camera);
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

  // Planet Navigation Button Click
  const handleStageClick = (index: number) => {
    setActiveStageIndex(index);
    setLocalProgress(0);
    const targetProgress = (index + 0.5) / 8;
    progressRatioRef.current = targetProgress;

    const section = containerRef.current || document.getElementById('gezegen-seruveni');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight || 800;
    const totalScrollableDistance = section.offsetHeight - windowHeight;
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

        {/* Ambient Color Glow reacting to transition */}
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-colors duration-700 opacity-25"
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
          
          {/* Active Service Card with Calm Transition */}
          <article
            data-testid="active-service-card"
            key={activeStage.id}
            style={{
              opacity: Math.max(0.2, 1.0 - Math.abs(localProgress - 0.5) * 1.2),
              transform: `translateY(${ (localProgress - 0.5) * -12 }px)`,
            }}
            className="lg:col-span-6 bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-slate-950/90 space-y-4 sm:space-y-5 transition-all duration-300 ease-out"
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
