import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Translucent Floating Digital Module
function ModuleBox({ position, rotationSpeed }: { position: [number, number, number]; rotationSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed;
      meshRef.current.rotation.y += delta * (rotationSpeed * 1.2);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshPhysicalMaterial
        color="#E0F2FE"
        transmission={0.85}
        opacity={1}
        transparent
        roughness={0.15}
        ior={1.4}
        thickness={0.8}
        clearcoat={0.5}
        metalness={0.2}
      />
    </mesh>
  );
}

// Glowing Connecting Light Paths
function LightLines() {
  const points = [
    new THREE.Vector3(-3, 0, 0),
    new THREE.Vector3(0, 1.5, 0),
    new THREE.Vector3(3, -0.5, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const lineGeometry = new THREE.TubeGeometry(curve, 64, 0.04, 8, false);

  return (
    <mesh geometry={lineGeometry}>
      <meshBasicMaterial color="#0EA5E9" wireframe={false} opacity={0.8} transparent />
    </mesh>
  );
}

// Main Interactive 3D Scene
function SceneContainer() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#38BDF8" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#4F46E5" />

      <ModuleBox position={[-2.5, 0, 0]} rotationSpeed={0.3} />
      <ModuleBox position={[0, 0.8, 0.5]} rotationSpeed={0.2} />
      <ModuleBox position={[2.5, -0.3, -0.5]} rotationSpeed={0.25} />

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

    // Lazy load when visible in viewport via IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!webGlSupported || reducedMotion) {
    return (
      <div className="w-full h-64 bg-slate-100 rounded-2xl flex items-center justify-center p-6 border border-slate-200">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 font-bold">
            3D
          </div>
          <p className="text-sm font-semibold text-slate-800">Luminous Digital Modules Architecture</p>
          <p className="text-xs text-slate-500 mt-1">Interaktif sistem modülleri simülasyonu</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-80 relative rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200">
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
            camera={{ position: [0, 0, 6], fov: 45 }}
            gl={{ powerPreference: 'low-power', antialias: true }}
          >
            <SceneContainer />
          </Canvas>
        </Suspense>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-400">
          Görünürlük Bekleniyor...
        </div>
      )}
    </div>
  );
};

export default DigitalModulesCanvas;
