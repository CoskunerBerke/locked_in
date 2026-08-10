import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Translucent Floating Glass Box
function FloatingCube({ position, rotationSpeed }: { position: [number, number, number]; rotationSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed;
      meshRef.current.rotation.y += delta * (rotationSpeed * 1.2);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.3, 1.3, 1.3]} />
      <meshPhysicalMaterial
        color="#078FEA"
        transmission={0.85}
        opacity={0.9}
        transparent
        roughness={0.1}
        ior={1.4}
        thickness={0.8}
        clearcoat={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}

// Floating Torus Ring
function FloatingTorus({ position, rotationSpeed }: { position: [number, number, number]; rotationSpeed: number }) {
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * (rotationSpeed * 0.8);
      torusRef.current.rotation.z += delta * rotationSpeed;
    }
  });

  return (
    <mesh ref={torusRef} position={position}>
      <torusGeometry args={[0.9, 0.28, 16, 32]} />
      <meshStandardMaterial color="#38BDF8" roughness={0.2} metalness={0.8} wireframe={false} />
    </mesh>
  );
}

// Glowing Connecting Path
function LightLines() {
  const points = [
    new THREE.Vector3(-3.2, -0.5, 0),
    new THREE.Vector3(0, 1.2, 0.5),
    new THREE.Vector3(3.2, -0.2, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const lineGeometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);

  return (
    <mesh geometry={lineGeometry}>
      <meshBasicMaterial color="#38BDF8" opacity={0.7} transparent />
    </mesh>
  );
}

// Main Interactive 3D Scene
function SceneContainer() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} color="#38BDF8" />
      <pointLight position={[-5, -5, -5]} intensity={1.0} color="#078FEA" />

      <FloatingCube position={[-2.4, 0.2, 0]} rotationSpeed={0.35} />
      <FloatingTorus position={[0, 0.6, 0.4]} rotationSpeed={0.4} />
      <FloatingCube position={[2.4, -0.4, -0.2]} rotationSpeed={0.3} />

      <LightLines />
    </>
  );
}

export const DigitalModulesCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGlSupported(false);
    } catch {
      setWebGlSupported(false);
    }

    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!webGlSupported || reducedMotion) {
    return (
      <div className="w-full h-72 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center p-6 border border-slate-700 shadow-xl">
        <div className="text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center mx-auto mb-3 font-extrabold text-xl shadow-lg">
            3D
          </div>
          <p className="text-base font-bold">Interaktif 3D Dijital Mimari</p>
          <p className="text-xs text-slate-300 mt-1">Görsel Modül Simülasyonu</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-80 sm:h-96 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      {isVisible ? (
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-400">
              3D Modüller Yükleniyor...
            </div>
          }
        >
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 5.5], fov: 45 }}
            gl={{ powerPreference: 'low-power', antialias: true }}
          >
            <SceneContainer />
          </Canvas>
        </Suspense>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-400">
          Interaktif 3D Sahnesi Bekleniyor...
        </div>
      )}
    </div>
  );
};

export default DigitalModulesCanvas;
