import React, { useEffect, useRef, useState } from 'react';
import { Globe, Zap, RefreshCw, Search, Smartphone, MapPin, Utensils, Megaphone } from 'lucide-react';

interface PlanetData {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  orbitRadiusRatio: number;
  size: number;
  color: string;
  orbitSpeed: number;
  selfSpinSpeed: number;
}

const initialPlanetsData: PlanetData[] = [
  { id: 'web', name: 'Kurumsal Web Sitesi', shortName: 'Web Sitesi', icon: Globe, orbitRadiusRatio: 0.16, size: 14, color: '#078FEA', orbitSpeed: 0.012, selfSpinSpeed: 0.04 },
  { id: 'landing', name: 'Landing Page Tasarımı', shortName: 'Landing Page', icon: Zap, orbitRadiusRatio: 0.22, size: 13, color: '#38BDF8', orbitSpeed: 0.009, selfSpinSpeed: 0.05 },
  { id: 'redesign', name: 'Web Sitesi Yenileme', shortName: 'Site Yenileme', icon: RefreshCw, orbitRadiusRatio: 0.27, size: 13, color: '#6366F1', orbitSpeed: 0.007, selfSpinSpeed: 0.03 },
  { id: 'seo', name: 'SEO & Görünürlük', shortName: 'SEO & Arama', icon: Search, orbitRadiusRatio: 0.32, size: 14, color: '#10B981', orbitSpeed: 0.006, selfSpinSpeed: 0.04 },
  { id: 'mobile', name: 'Mobil Uygulama', shortName: 'Mobil App', icon: Smartphone, orbitRadiusRatio: 0.37, size: 15, color: '#8B5CF6', orbitSpeed: 0.005, selfSpinSpeed: 0.035 },
  { id: 'maps', name: 'Google Maps & Yerel SEO', shortName: 'Google Maps', icon: MapPin, orbitRadiusRatio: 0.41, size: 13, color: '#F59E0B', orbitSpeed: 0.004, selfSpinSpeed: 0.045 },
  { id: 'food', name: 'Yemeksepeti & Trendyol Panel', shortName: 'Yemek Panelleri', icon: Utensils, orbitRadiusRatio: 0.45, size: 14, color: '#F43F5E', orbitSpeed: 0.0035, selfSpinSpeed: 0.03 },
  { id: 'social', name: 'Instagram & Meta Reklamları', shortName: 'Instagram Reklam', icon: Megaphone, orbitRadiusRatio: 0.48, size: 15, color: '#EC4899', orbitSpeed: 0.003, selfSpinSpeed: 0.05 },
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

    const planets = initialPlanetsData.map((p, idx) => ({
      ...p,
      angle: (idx * (Math.PI * 2)) / 8,
      selfAngle: Math.random() * Math.PI * 2,
    }));

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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.9;

      // 1. Draw Central Glowing Sun (Locked_in Merkez)
      const sunRadius = Math.min(width, height) * 0.08;
      const sunGradient = ctx.createRadialGradient(centerX, centerY, sunRadius * 0.2, centerX, centerY, sunRadius * 1.8);
      sunGradient.addColorStop(0, '#FFFBEB');
      sunGradient.addColorStop(0.4, '#F59E0B');
      sunGradient.addColorStop(0.8, '#D97706');
      sunGradient.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = sunGradient;
      ctx.fill();

      // Core Sun Sphere
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FEF3C7';
      ctx.stroke();

      // Sun Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOCKED_IN', centerX, centerY - 2);
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText('MERKEZ', centerX, centerY + 10);

      // 2. Draw Orbits and Planets
      let foundHover: PlanetData | null = null;

      planets.forEach((planet) => {
        const orbitR = baseRadius * planet.orbitRadiusRatio;

        // Draw faint orbital ring path
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = hoveredPlanet === planet.id ? planet.color : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = hoveredPlanet === planet.id ? 2 : 1;
        if (hoveredPlanet === planet.id) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Calculate planet position on orbit
        if (!hoveredPlanet || hoveredPlanet !== planet.id) {
          planet.angle += planet.orbitSpeed;
        }
        planet.selfAngle += planet.selfSpinSpeed;

        const px = centerX + orbitR * Math.cos(planet.angle);
        const py = centerY + orbitR * Math.sin(planet.angle);

        // Check mouse hover on planet
        const distToMouse = Math.hypot(mouseX - px, mouseY - py);
        if (distToMouse < planet.size + 10) {
          foundHover = planet;
        }

        // Draw Planet Body
        ctx.save();
        ctx.translate(px, py);

        if (hoveredPlanet === planet.id) {
          ctx.beginPath();
          ctx.arc(0, 0, planet.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `${planet.color}40`;
          ctx.fill();
        }

        // Main Planet Sphere
        ctx.beginPath();
        ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Self-Spinning Axis Line
        ctx.rotate(planet.selfAngle);
        ctx.beginPath();
        ctx.moveTo(-planet.size * 0.7, 0);
        ctx.lineTo(planet.size * 0.7, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Planet Label Text
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(planet.shortName, px, py + planet.size + 14);
      });

      if (foundHover) {
        const hoverItem: PlanetData = foundHover;
        setHoveredPlanet(hoverItem.id);
        setActivePlanetInfo(hoverItem);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hoveredPlanet]);

  return (
    <div ref={containerRef} className="relative w-full h-[460px] sm:h-[540px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer z-10" />

      {/* Floating Active Planet Detail Card Tooltip */}
      {activePlanetInfo && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-sky-400/50 flex items-center gap-3 animate-float-fast">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activePlanetInfo.color }} />
          <div>
            <span className="text-sky-300 block text-[10px] uppercase font-bold tracking-wider">Dijital Hizmet Yörüngesi</span>
            <span className="text-white text-sm font-black">{activePlanetInfo.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesSolarSystemCanvas;
