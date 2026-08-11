import React, { useEffect, useRef, useState } from 'react';
import { Globe, Zap, RefreshCw, Search, Smartphone, MapPin, Utensils, Megaphone } from 'lucide-react';

interface PlanetData {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  imgSrc: string;
  orbitRadiusRatio: number;
  size: number;
  color: string;
  orbitSpeed: number; // Monotonic speed factor
  selfSpinSpeed: number;
}

const initialPlanetsData: PlanetData[] = [
  { id: 'web', name: 'Kurumsal Web Sitesi', shortName: 'Dünya • Web Sitesi', icon: Globe, imgSrc: '/images/planets/earth.jpg', orbitRadiusRatio: 0.16, size: 16, color: '#3B82F6', orbitSpeed: 0.008, selfSpinSpeed: 0.03 },
  { id: 'landing', name: 'Landing Page Tasarımı', shortName: 'Merkür • Landing Page', icon: Zap, imgSrc: '/images/planets/venus.jpg', orbitRadiusRatio: 0.22, size: 14, color: '#F59E0B', orbitSpeed: 0.0065, selfSpinSpeed: 0.04 },
  { id: 'redesign', name: 'Web Sitesi Yenileme', shortName: 'Venüs • Site Yenileme', icon: RefreshCw, imgSrc: '/images/planets/venus.jpg', orbitRadiusRatio: 0.27, size: 15, color: '#EAB308', orbitSpeed: 0.005, selfSpinSpeed: 0.025 },
  { id: 'seo', name: 'SEO & Görünürlük', shortName: 'Mars • SEO & Arama', icon: Search, imgSrc: '/images/planets/mars.jpg', orbitRadiusRatio: 0.32, size: 15, color: '#EF4444', orbitSpeed: 0.004, selfSpinSpeed: 0.035 },
  { id: 'mobile', name: 'Mobil Uygulama', shortName: 'Jüpiter • Mobil App', icon: Smartphone, imgSrc: '/images/planets/jupiter.jpg', orbitRadiusRatio: 0.37, size: 18, color: '#F97316', orbitSpeed: 0.0032, selfSpinSpeed: 0.02 },
  { id: 'maps', name: 'Google Maps & Yerel SEO', shortName: 'Satürn • Google Maps', icon: MapPin, imgSrc: '/images/planets/saturn.jpg', orbitRadiusRatio: 0.42, size: 17, color: '#EAB308', orbitSpeed: 0.0026, selfSpinSpeed: 0.03 },
  { id: 'food', name: 'Yemeksepeti & Trendyol Panel', shortName: 'Uranüs • Yemek Paneli', icon: Utensils, imgSrc: '/images/planets/neptune.jpg', orbitRadiusRatio: 0.46, size: 15, color: '#06B6D4', orbitSpeed: 0.0021, selfSpinSpeed: 0.025 },
  { id: 'social', name: 'Instagram & Meta Reklamları', shortName: 'Neptün • Instagram Reklam', icon: Megaphone, imgSrc: '/images/planets/neptune.jpg', orbitRadiusRatio: 0.49, size: 16, color: '#3B82F6', orbitSpeed: 0.0017, selfSpinSpeed: 0.04 },
];

export const ServicesSolarSystemCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [activePlanetInfo, setActivePlanetInfo] = useState<PlanetData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    let width = (canvas.width = containerRef.current?.clientWidth || 500);
    let height = (canvas.height = containerRef.current?.clientHeight || 500);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight || 500;
    };

    window.addEventListener('resize', handleResize);

    // Preload Planet Images
    const loadedImages: Record<string, HTMLImageElement> = {};
    const sunImg = new Image();
    sunImg.src = '/images/planets/sun.jpg';
    loadedImages['sun'] = sunImg;

    initialPlanetsData.forEach((p) => {
      const img = new Image();
      img.src = p.imgSrc;
      loadedImages[p.id] = img;
    });

    // Monotonic Continuous Orbit Angles (Accumulates infinitely without resets)
    const planetsState = initialPlanetsData.map((p, idx) => ({
      ...p,
      angle: (idx * (Math.PI * 2)) / 8, // Fixed initial offset angle
      selfAngle: Math.random() * Math.PI * 2,
    }));

    let lastTime = performance.now();
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      setHoveredPlanet(null);
      setActivePlanetInfo(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = (now: number) => {
      const delta = Math.min(now - lastTime, 64); // Cap delta to prevent huge jumps on tab switch
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.92;

      // 1. Draw Central Glowing Sun (Rent Yazılım Central Core)
      const sunRadius = Math.min(width, height) * 0.085;

      // Outer Corona Glow
      const sunGlowGrad = ctx.createRadialGradient(centerX, centerY, sunRadius * 0.2, centerX, centerY, sunRadius * 2.2);
      sunGlowGrad.addColorStop(0, '#FFFBEB');
      sunGlowGrad.addColorStop(0.3, '#F59E0B');
      sunGlowGrad.addColorStop(0.7, '#D97706');
      sunGlowGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = sunGlowGrad;
      ctx.fill();

      // Sun Image or 3D Shaded Fallback
      if (sunImg.complete && sunImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(sunImg, centerX - sunRadius, centerY - sunRadius, sunRadius * 2, sunRadius * 2);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
      }

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FEF3C7';
      ctx.stroke();

      // Sun Central Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'black 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText('RENT YAZILIM', centerX, centerY - 2);
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('MERKEZ', centerX, centerY + 10);
      ctx.shadowBlur = 0;

      // 2. Draw Orbits and Planets
      let foundHover: PlanetData | null = null;

      planetsState.forEach((planet) => {
        const orbitR = baseRadius * planet.orbitRadiusRatio;

        // Orbital Line (Faint ring path)
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = hoveredPlanet === planet.id ? planet.color : 'rgba(148, 163, 184, 0.22)';
        ctx.lineWidth = hoveredPlanet === planet.id ? 2 : 1;
        if (hoveredPlanet === planet.id) {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // STRICT MONOTONIC ACCUMULATION (Continuous non-stop single-direction orbit)
        if (!hoveredPlanet || hoveredPlanet !== planet.id) {
          planet.angle += planet.orbitSpeed * (delta / 16);
        }
        planet.selfAngle += planet.selfSpinSpeed * (delta / 16);

        const px = centerX + orbitR * Math.cos(planet.angle);
        const py = centerY + orbitR * Math.sin(planet.angle);

        // Hover Detection
        const distToMouse = Math.hypot(mouseX - px, mouseY - py);
        if (distToMouse < planet.size + 12) {
          foundHover = planet;
        }

        ctx.save();
        ctx.translate(px, py);

        // Hover Glow Aura
        if (hoveredPlanet === planet.id) {
          ctx.beginPath();
          ctx.arc(0, 0, planet.size * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `${planet.color}50`;
          ctx.fill();
        }

        // Draw 3D Saturn Rings for Saturn Planet
        if (planet.id === 'maps') {
          ctx.save();
          ctx.rotate(0.35); // Tilted Saturn Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, planet.size * 2.1, planet.size * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)';
          ctx.lineWidth = 3.5;
          ctx.stroke();
          ctx.restore();
        }

        // Render Photorealistic Planet Image Sphere
        const planetImg = loadedImages[planet.id];
        if (planetImg && planetImg.complete && planetImg.naturalWidth > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(planetImg, -planet.size, -planet.size, planet.size * 2, planet.size * 2);

          // 3D Sphere Lighting Shadow Overlay
          const sphereLighting = ctx.createRadialGradient(
            -planet.size * 0.3,
            -planet.size * 0.3,
            planet.size * 0.1,
            0,
            0,
            planet.size
          );
          sphereLighting.addColorStop(0, 'rgba(255,255,255,0.3)');
          sphereLighting.addColorStop(0.7, 'rgba(0,0,0,0)');
          sphereLighting.addColorStop(1, 'rgba(0,0,0,0.5)');
          ctx.fillStyle = sphereLighting;
          ctx.beginPath();
          ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Photorealistic 3D Gradient Sphere Fallback
          const sphereGrad = ctx.createRadialGradient(-planet.size * 0.3, -planet.size * 0.3, planet.size * 0.1, 0, 0, planet.size);
          sphereGrad.addColorStop(0, '#FFFFFF');
          sphereGrad.addColorStop(0.4, planet.color);
          sphereGrad.addColorStop(1, '#0F172A');

          ctx.beginPath();
          ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.fill();
        }

        // Outer Sphere Rim Border
        ctx.beginPath();
        ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.stroke();

        ctx.restore();

        // Planet High-Contrast Bold Label
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(planet.shortName, px, py + planet.size + 8);
      });

      if (foundHover) {
        const hoverItem: PlanetData = foundHover;
        setHoveredPlanet(hoverItem.id);
        setActivePlanetInfo(hoverItem);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hoveredPlanet]);

  return (
    <div ref={containerRef} className="relative w-full h-[480px] sm:h-[550px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer z-10" />

      {/* Active Planet Detail Card Tooltip */}
      {activePlanetInfo && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-sky-400/50 flex items-center gap-3 animate-float-fast">
          <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: activePlanetInfo.color }} />
          <div>
            <span className="text-sky-300 block text-[10px] uppercase font-bold tracking-wider">Gerçek Güneş Sistemi Yörüngesi</span>
            <span className="text-white text-sm font-black">{activePlanetInfo.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesSolarSystemCanvas;
