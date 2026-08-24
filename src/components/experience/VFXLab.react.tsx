import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  PlanetTransitionWaveShader,
  PlanetCoronaShader,
  createMercuryTexture,
  createGlowParticleTexture,
} from './shaders/planetShaders';

export const VFXLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [variant, setVariant] = useState<'warm' | 'cool'>('warm');
  const [bloomStrength, setBloomStrength] = useState<number>(0.35);
  const [duration, setDuration] = useState<number>(4600);

  const waveMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const coronaMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const progressRef = useRef<number>(0);
  const animRef = useRef<{ startTime: number; from: number; to: number; duration: number } | null>(null);

  useEffect(() => {
    progressRef.current = progress;
    const waveInt = Math.sin(Math.min(Math.max(progress, 0.0), 1.0) * Math.PI);
    if (waveMaterialRef.current) {
      waveMaterialRef.current.uniforms.uProgress.value = progress;
      waveMaterialRef.current.uniforms.uWaveIntensity.value = waveInt;
      waveMaterialRef.current.uniforms.uVariant.value = variant === 'warm' ? 1 : 0;
    }
    if (coronaMaterialRef.current) {
      coronaMaterialRef.current.uniforms.uProgress.value = progress;
      coronaMaterialRef.current.uniforms.uCoronaIntensity.value = waveInt;
      coronaMaterialRef.current.uniforms.uVariant.value = variant === 'warm' ? 1 : 0;
    }
  }, [progress, variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 6.0;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      bloomStrength,
      0.25,
      0.90
    );
    composer.addPass(bloomPass);

    // Textures: Earth -> Mercury
    const textureLoader = new THREE.TextureLoader();
    const texEarth = textureLoader.load('/images/planets/earth.jpg');
    texEarth.wrapS = THREE.RepeatWrapping;
    const texMercury = createMercuryTexture();

    // 1. Base Planet Mesh (with Wavefront Transition Shader)
    const sphereGeo = new THREE.SphereGeometry(1.85, 64, 64);
    const waveMat = new THREE.ShaderMaterial({
      vertexShader: PlanetTransitionWaveShader.vertexShader,
      fragmentShader: PlanetTransitionWaveShader.fragmentShader,
      uniforms: {
        uTexFrom: { value: texEarth },
        uTexTo: { value: texMercury },
        uProgress: { value: 0.0 },
        uWaveIntensity: { value: 0.0 },
        uTime: { value: 0.0 },
        uUvOffset: { value: 0.0 },
        uVariant: { value: 1 },
        uLightDir: { value: new THREE.Vector3(1.2, 0.8, 1.5).normalize() },
      },
    });
    waveMaterialRef.current = waveMat;
    const planetMesh = new THREE.Mesh(sphereGeo, waveMat);
    scene.add(planetMesh);

    // 2. Volumetric Corona Shell (Slightly larger sphere)
    const coronaGeo = new THREE.SphereGeometry(2.10, 48, 48);
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: PlanetCoronaShader.vertexShader,
      fragmentShader: PlanetCoronaShader.fragmentShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uCoronaIntensity: { value: 0.0 },
        uTime: { value: 0.0 },
        uVariant: { value: 1 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    coronaMaterialRef.current = coronaMat;
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // 3. Round Energy Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 2.0 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      map: createGlowParticleTexture(),
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const handleResize = () => {
      const width = canvas.clientWidth || 800;
      const height = canvas.clientHeight || 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let lastTime = performance.now();
    let totalTime = 0;
    let uvOffset = 0;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      totalTime += dt;
      uvOffset = (uvOffset + dt * 0.015) % 1.0;

      // Handle play animation timeline
      if (animRef.current) {
        const elapsed = now - animRef.current.startTime;
        const t = Math.min(Math.max(elapsed / animRef.current.duration, 0.0), 1.0);
        const smoothT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const currentP = animRef.current.from + (animRef.current.to - animRef.current.from) * smoothT;
        setProgress(currentP);
        if (t >= 1.0) {
          animRef.current = null;
          setIsPlaying(false);
        }
      }

      waveMat.uniforms.uTime.value = totalTime;
      waveMat.uniforms.uUvOffset.value = uvOffset;
      coronaMat.uniforms.uTime.value = totalTime;

      planetMesh.rotation.y = totalTime * 0.1;
      particles.rotation.y = totalTime * 0.08;

      composer.render();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [bloomStrength]);

  const handlePlayForward = () => {
    animRef.current = {
      startTime: performance.now(),
      from: 0,
      to: 1,
      duration,
    };
    setIsPlaying(true);
  };

  const handlePlayReverse = () => {
    animRef.current = {
      startTime: performance.now(),
      from: 1,
      to: 0,
      duration,
    };
    setIsPlaying(true);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 font-sans">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="text-sky-400">⚡</span> VFX Transition Lab
            </h1>
            <p className="text-xs text-slate-400">
              Pure WebGL Sweeping Wavefront & Volumetric Corona Prototype (Dünya → Merkür)
            </p>
          </div>
          <span className="text-xs font-mono bg-red-950/80 text-red-400 border border-red-800/60 px-3 py-1 rounded-full">
            NOINDEX • DEV ONLY
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
          {/* Controls Panel */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-sky-400">
              Parametre Kontrolleri
            </h2>

            {/* Play / Reverse Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePlayForward}
                disabled={isPlaying}
                className="btn-primary py-2.5 text-xs font-black cursor-pointer disabled:opacity-50"
              >
                ▶ İleri (4.6s)
              </button>
              <button
                type="button"
                onClick={handlePlayReverse}
                disabled={isPlaying}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-xs cursor-pointer disabled:opacity-50"
              >
                ◀ Geri (4.6s)
              </button>
            </div>

            {/* Progress Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Progress</span>
                <span className="text-white font-bold">{(progress * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={progress}
                onChange={(e) => {
                  animRef.current = null;
                  setIsPlaying(false);
                  setProgress(parseFloat(e.target.value));
                }}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Variant Switch */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">VFX Renk Varyantı</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVariant('warm')}
                  className={`py-2 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                    variant === 'warm'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  🔥 Sıcak Alev
                </button>
                <button
                  type="button"
                  onClick={() => setVariant('cool')}
                  className={`py-2 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                    variant === 'cool'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  💧 Soğuk Sıvı
                </button>
              </div>
            </div>

            {/* Bloom Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Bloom Gücü</span>
                <span className="text-white font-bold">{bloomStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={bloomStrength}
                onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Duration Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Animasyon Süresi</span>
                <span className="text-white font-bold">{duration} ms</span>
              </div>
              <input
                type="range"
                min="2000"
                max="6000"
                step="200"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          {/* 3D WebGL Canvas Preview Area */}
          <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800/80 rounded-2xl h-[520px] flex items-center justify-center relative overflow-hidden shadow-2xl">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
              {progress < 0.5 ? '01 DÜNYA (Outgoing)' : '02 MERKÜR (Incoming)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
