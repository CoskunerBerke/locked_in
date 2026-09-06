import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  Globe,
  Zap,
  RefreshCw,
  Search,
  Smartphone,
  MapPin,
  Utensils,
  Megaphone,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import brandConfig from '../../config/brand';
import { createGlowParticleTexture } from './shaders/planetShaders';

export interface PlanetStage {
  id: string;
  sequence: number;
  planetName: string;
  category: string;
  serviceName: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  href: string;
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  starColorHex: number;
  texture: string;
  fallbackImage: string;
  telemetry: {
    orbitalSpeed: string;
    distance: string;
    atmosphere: string;
    sector: string;
    coreTemp: string;
  };
}

// 8 Primary Planetary Service Stages with Rich, Bespoke Cosmic Atmospheres & Sci-Fi Telemetry
export const planetServicesData: PlanetStage[] = [
  {
    id: 'earth',
    sequence: 1,
    planetName: 'Dünya',
    category: 'Web Çözümleri',
    serviceName: 'Web Tasarım ve Kurumsal Web Sitesi',
    description: 'Müşterilerinizin telefondan ve bilgisayardan kolayca ulaşabileceği hızlı, şık ve güvenli kurumsal web siteleri tasarlıyoruz.',
    benefits: [
      'Telefon ve bilgisayarda hızlı açılan modern tasarım',
      'Google aramaları için SEO uyumlu içerik ve teknik altyapı',
      'Güvenlik odaklı, güncel ve sürdürülebilir statik altyapı',
      'Arama, WhatsApp, sipariş ve teklif alma butonları'
    ],
    ctaLabel: 'Web Sitesi Hizmetini İncele',
    href: '/hizmetler/web-sitesi-tasarimi/',
    accentColor: '#0284c7',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    bgGradient: 'linear-gradient(135deg, #031e4f 0%, #0a3d82 45%, #052661 100%)',
    starColorHex: 0x38bdf8,
    texture: '/images/planets/earth.jpg',
    fallbackImage: '/images/planets/earth.jpg',
    telemetry: {
      orbitalSpeed: '29.78 KM/S',
      distance: '149.6M KM',
      atmosphere: 'N₂ / O₂ (1.0 ATM)',
      sector: 'SECTOR-03 // BLUE CORE',
      coreTemp: '5,700 K'
    }
  },
  {
    id: 'mercury',
    sequence: 2,
    planetName: 'Merkür',
    category: 'Dönüşüm Çözümleri',
    serviceName: 'Landing Page Tasarımı',
    description: 'Reklam kampanyalarınızdan en yüksek müşteri dönüşümünü elde eden özel açılış sayfaları tasarlıyoruz.',
    benefits: [
      'Doğrudan satış ve teklif odaklı yüksek dönüşüm mimarisi',
      'Hızlı yüklenen, mobil uyumlu ve dikkat çekici görsel kurgu',
      'A/B testlerine ve reklam piksellerine uygun altyapı',
      'WhatsApp, arama ve form butonları ile anında etkileşim'
    ],
    ctaLabel: 'Landing Page Hizmetini İncele',
    href: '/hizmetler/web-sitesi-tasarimi/',
    accentColor: '#38bdf8',
    glowColor: 'rgba(148, 163, 184, 0.55)',
    bgGradient: 'linear-gradient(135deg, #182234 0%, #2b3952 50%, #1c273a 100%)',
    starColorHex: 0xf1f5f9,
    texture: '/images/planets/mercury.jpg',
    fallbackImage: '/images/planets/mercury.jpg',
    telemetry: {
      orbitalSpeed: '47.36 KM/S',
      distance: '57.9M KM',
      atmosphere: 'SOLAR EXOSPHERE',
      sector: 'SECTOR-01 // TITAN CORE',
      coreTemp: '700 K'
    }
  },
  {
    id: 'venus',
    sequence: 3,
    planetName: 'Venüs',
    category: 'Yenileme & Modernizasyon',
    serviceName: 'Web Sitesi Yenileme',
    description: 'Eski, yavaş veya mobil uyumu olmayan web sitenizi modern standartlara taşıyarak prestijinizi artırıyoruz.',
    benefits: [
      'Eski kod yapısını güncel ve hızlı teknolojilerle değiştirme',
      'Mobil ve tablet cihazlarında kusursuz görünüm',
      'Arama motoru sıralamalarını koruyarak SEO iyileştirmesi',
      'Görsel tasarımın ve kullanıcı deneyiminin modernizasyonu'
    ],
    ctaLabel: 'Site Yenileme Hizmetini İncele',
    href: '/hizmetler/web-sitesi-tasarimi/',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    bgGradient: 'linear-gradient(135deg, #3d2107 0%, #703c0c 50%, #422408 100%)',
    starColorHex: 0xfde047,
    texture: '/images/planets/venus.jpg',
    fallbackImage: '/images/planets/venus.jpg',
    telemetry: {
      orbitalSpeed: '35.02 KM/S',
      distance: '108.2M KM',
      atmosphere: 'CO₂ / N₂ (92 ATM)',
      sector: 'SECTOR-02 // AMBER DOME',
      coreTemp: '737 K'
    }
  },
  {
    id: 'mars',
    sequence: 4,
    planetName: 'Mars',
    category: 'Büyüme & Görünürlük',
    serviceName: 'Google SEO ve Arama Görünürlüğü',
    description: 'İşletmenizin Google arama sonuçlarında üst sıralara çıkmasını sağlayarak organik müşteri trafiğinizi artırıyoruz.',
    benefits: [
      'Teknik SEO, hız optimizasyonu ve Core Web Vitals iyileştirmesi',
      'Sektörünüze özel anahtar kelime analizi ve içerik stratejisi',
      'Site içi başlık, meta ve şema (Schema.org) yapılandırması',
      'Aylık sıralama ve organik trafik performans raporlaması'
    ],
    ctaLabel: 'SEO Hizmetini İncele',
    href: '/hizmetler/seo/',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.65)',
    bgGradient: 'linear-gradient(135deg, #450c0c 0%, #821c1c 50%, #4d0e0e 100%)',
    starColorHex: 0xfca5a5,
    texture: '/images/planets/mars.jpg',
    fallbackImage: '/images/planets/mars.jpg',
    telemetry: {
      orbitalSpeed: '24.07 KM/S',
      distance: '227.9M KM',
      atmosphere: 'CO₂ / AR / DUST',
      sector: 'SECTOR-04 // RUBY VECTOR',
      coreTemp: '210 K'
    }
  },
  {
    id: 'jupiter',
    sequence: 5,
    planetName: 'Jüpiter',
    category: 'Özel Yazılım',
    serviceName: 'Mobil Uygulama ve İşletme Yazılımı',
    description: 'İşletmenizin operasyonlarını kolaylaştıran, müşterilerinize doğrudan ulaşan mobil uygulama ve web panelleri geliştiriyoruz.',
    benefits: [
      'iOS ve Android uyumlu modern mobil uygulama geliştirme',
      'İşletmenize özel yönetim panelleri ve sipariş takip sistemleri',
      'Güvenli veri tabanı mimarisi ve bulut sunucu entegrasyonu',
      'Kullanıcı dostu arayüz ve kesintisiz teknik destek'
    ],
    ctaLabel: 'Özel Yazılım Hizmetini İncele',
    href: '/hizmetler/mobil-uygulama/',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.65)',
    bgGradient: 'linear-gradient(135deg, #3d1c07 0%, #75380e 50%, #422008 100%)',
    starColorHex: 0xfdba74,
    texture: '/images/planets/jupiter.jpg',
    fallbackImage: '/images/planets/jupiter.jpg',
    telemetry: {
      orbitalSpeed: '13.07 KM/S',
      distance: '778.5M KM',
      atmosphere: 'H₂ / HE / STORM',
      sector: 'SECTOR-05 // BRONZE VORTEX',
      coreTemp: '24,000 K'
    }
  },
  {
    id: 'saturn',
    sequence: 6,
    planetName: 'Satürn',
    category: 'Yerel Görünürlük',
    serviceName: 'Google Maps ve Yerel SEO',
    description: 'İşletmenizi Google Haritalar’da öne çıkarıyor, yakınınızdaki potansiyel müşterilerin sizi ilk sırada bulmasını sağlıyoruz.',
    benefits: [
      'Google İşletme Profili (Maps) kurulumu ve tam optimizasyon',
      'Yerel anahtar kelimelerde harita paketi (Local Pack) görünürlüğü',
      'Müşteri yorum yönetimi ve profil güvenilirlik artışı',
      'Konum, telefon ve yol tarifi butonlarıyla anında arama'
    ],
    ctaLabel: 'Harita Optimizasyonu Hizmetini İncele',
    href: '/hizmetler/google-maps/',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    bgGradient: 'linear-gradient(135deg, #3b2e07 0%, #6d550e 50%, #3e3108 100%)',
    starColorHex: 0xfef08a,
    texture: '/images/planets/saturn.jpg',
    fallbackImage: '/images/planets/saturn.jpg',
    telemetry: {
      orbitalSpeed: '9.68 KM/S',
      distance: '1.43B KM',
      atmosphere: 'H₂ / HE / RING DISK',
      sector: 'SECTOR-06 // GOLD RING',
      coreTemp: '11,700 K'
    }
  },
  {
    id: 'uranus',
    sequence: 7,
    planetName: 'Uranüs',
    category: 'Restoran Danışmanlığı',
    serviceName: 'Yemeksepeti ve Trendyol Yemek Kurulumu',
    description: 'Restoran ve kafeler için sipariş panellerini ve menülerini eksiksiz kurup yayına alıyoruz.',
    benefits: [
      'Yemeksepeti ve Trendyol Yemek başvuru ve onay rehberliği',
      'İştah açıcı görseller ve kategorilerle dijital menü hazırlama',
      'Menü fiyatlama, indirimler ve seçenekleri yükleme',
      'Panel kullanım ve operasyonel süreç danışmanlığı'
    ],
    ctaLabel: 'Yemek Platformu Hizmetini İncele',
    href: '/hizmetler/yemeksepeti-trendyol-yemek/',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.65)',
    bgGradient: 'linear-gradient(135deg, #043344 0%, #0c5b78 50%, #063d52 100%)',
    starColorHex: 0x67e8f9,
    texture: '/images/planets/uranus.jpg',
    fallbackImage: '/images/planets/uranus.jpg',
    telemetry: {
      orbitalSpeed: '6.80 KM/S',
      distance: '2.87B KM',
      atmosphere: 'H₂ / HE / CH₄ (ICE)',
      sector: 'SECTOR-07 // CYAN GLACIER',
      coreTemp: '5,000 K'
    }
  },
  {
    id: 'neptune',
    sequence: 8,
    planetName: 'Neptün',
    category: 'Sosyal Medya & Reklam',
    serviceName: 'Instagram ve Meta Reklam Yönetimi',
    description: 'Doğru hedef kitleye ulaşan reklam stratejileriyle marka bilinirliğinizi artırıyor ve sıcak müşteri talepleri topluyoruz.',
    benefits: [
      'Hedef kitle analizi ve bütçe planlaması ile yüksek ROI',
      'Dikkat çeken görsel ve metin içerikleriyle reklam kreatifleri',
      'WhatsApp ve DM doğrudan mesajlaşma reklam kampanyaları',
      'Detaylı dönüşüm takibi ve haftalık/aylık performans raporları'
    ],
    ctaLabel: 'Sosyal Medya Hizmetini İncele',
    href: '/hizmetler/instagram-reklamlari/',
    accentColor: '#2563eb',
    glowColor: 'rgba(59, 130, 246, 0.65)',
    bgGradient: 'linear-gradient(135deg, #06235e 0%, #124497 50%, #092c73 100%)',
    starColorHex: 0x60a5fa,
    texture: '/images/planets/neptune.jpg',
    fallbackImage: '/images/planets/neptune.jpg',
    telemetry: {
      orbitalSpeed: '5.43 KM/S',
      distance: '4.50B KM',
      atmosphere: 'H₂ / HE / CH₄ (COBALT)',
      sector: 'SECTOR-08 // DEEP ABYSS',
      coreTemp: '7,200 K'
    }
  }
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  earth: Globe,
  mercury: Zap,
  venus: RefreshCw,
  mars: Search,
  jupiter: Smartphone,
  saturn: MapPin,
  uranus: Utensils,
  neptune: Megaphone
};

// FAQ Data for Final Stage
const faqItemsData = [
  {
    q: 'Web sitem ne kadar sürede tamamlanır ve yayına alınır?',
    a: 'Kurumsal web siteleri ve landing page projelerini içerik onayı sonrası ortalama 3 ile 7 iş günü içerisinde eksiksiz olarak yayına alıyoruz.'
  },
  {
    q: 'Sitem mobil cihazlarda ve Google aramalarında nasıl görünür?',
    a: 'Tüm projelerimiz %100 mobil uyumlu, yüksek hız puanlı ve teknik SEO altyapısı hazır olarak teslim edilir. Google arama sonuçlarında hızlı indeksleme sağlanır.'
  },
  {
    q: 'Yemeksepeti ve Trendyol Yemek panel süreçlerinde destek veriyor musunuz?',
    a: 'Evet. Restoran başvurularınız, menü ve kategori yüklemeleriniz, görsel düzenlemeleriniz ve panel onay süreçleriniz ekibimiz tarafından anahtar teslim yönetilir.'
  },
  {
    q: 'Proje sonrası teknik destek ve güncelleme hizmeti sağlıyor musunuz?',
    a: 'Evet. Web sitelerinizin sunucu güvenliği, SSL sertifikaları, yedekleme işlemleri ve düzenli teknik desteği kesintisiz olarak tarafımızdan sağlanmaktadır.'
  }
];

// Custom Planet Shader: Preserves 100% of Planet Sphere, Rings & Shadows with Zero Square Artifacts
function createPlanetShader(
  texture: THREE.Texture | null,
  isRingPlanet: boolean,
  atmosphereColor: THREE.Color,
  initialOpacity = 1.0
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uOpacity: { value: initialOpacity },
      uIsRingPlanet: { value: isRingPlanet },
      uAtmosphereColor: { value: atmosphereColor },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uOpacity;
      uniform bool uIsRingPlanet;
      uniform vec3 uAtmosphereColor;
      varying vec2 vUv;

      void main() {
        vec2 center = vUv - vec2(0.5);
        float dist = length(center);
        vec4 texColor = texture2D(uTexture, vUv);
        
        float mask = 1.0;
        if (!uIsRingPlanet) {
          // Seamless soft edge feathering on spherical planets
          mask = 1.0 - smoothstep(0.482, 0.496, dist);
        } else {
          // Ring Planet (Saturn / Uranus):
          // Inside the planet sphere (dist < 0.27), sphere & shadows are 100% solid
          // Outside the planet sphere, rings are preserved by luminance while black space is discarded
          float lum = max(texColor.r, max(texColor.g, texColor.b));
          float sphereCore = 1.0 - smoothstep(0.24, 0.27, dist);
          float ringAlpha = smoothstep(0.015, 0.08, lum);
          
          float edgeX = 1.0 - smoothstep(0.470, 0.498, abs(center.x));
          float edgeY = 1.0 - smoothstep(0.470, 0.498, abs(center.y));
          float edgeMask = edgeX * edgeY;
          
          mask = max(sphereCore, ringAlpha) * edgeMask;
        }

        float alpha = mask * uOpacity;

        if (alpha <= 0.002) {
          discard;
        }

        // Soft atmospheric rim illumination for spherical planets
        float rim = 0.0;
        if (!uIsRingPlanet) {
          rim = smoothstep(0.35, 0.485, dist) * (1.0 - smoothstep(0.485, 0.496, dist)) * 0.25;
        }
        vec3 finalColor = texColor.rgb + uAtmosphereColor * rim;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

// Dynamic Header Theme Settings for each Planet (100% Seamless, Zero Dividing Line)
interface HeaderThemeConfig {
  backgroundColor: string;
}

const HEADER_PLANET_THEMES: Record<string, HeaderThemeConfig> = {
  earth: { backgroundColor: '#031e4f' },
  mercury: { backgroundColor: '#182234' },
  venus: { backgroundColor: '#3d2107' },
  mars: { backgroundColor: '#450c0c' },
  jupiter: { backgroundColor: '#3d1c07' },
  saturn: { backgroundColor: '#3b2e07' },
  uranus: { backgroundColor: '#043344' },
  neptune: { backgroundColor: '#06235e' },
  faq: { backgroundColor: '#070b14' },
};

const updateHeaderPlanetTheme = (screenIndex: number) => {
  if (typeof document === 'undefined') return;
  const header = document.getElementById('site-header');
  if (!header) return;

  const key = screenIndex <= 7 ? planetServicesData[screenIndex].id : 'faq';
  const theme = HEADER_PLANET_THEMES[key] || HEADER_PLANET_THEMES.earth;

  header.style.backgroundColor = theme.backgroundColor;
  header.style.border = 'none';
  header.style.borderBottom = 'none';
  header.style.boxShadow = 'none';
  header.style.outline = 'none';
  header.setAttribute('data-active-planet', key);
};

// Shooting Star Class for dynamic meteor trails
interface ShootingStar {
  line: THREE.Line;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  headPos: THREE.Vector3;
  velocity: THREE.Vector3;
  length: number;
  active: boolean;
  spawnTime: number;
  lifetime: number;
}

export const PlanetServicesExperience: React.FC = () => {
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [cardFade, setCardFade] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeScreenIndexRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);
  const wheelCooldownUntilRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const pointerStartYRef = useRef<number>(0);
  const wheelAccumulatorRef = useRef<number>(0);

  // Mouse Parallax & Gimbal Tracking References
  const mousePosRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  // Three.js Scene References
  const texturesRef = useRef<THREE.Texture[]>([]);
  const currentPlanetMeshRef = useRef<THREE.Mesh | null>(null);
  const nextPlanetMeshRef = useRef<THREE.Mesh | null>(null);
  const starfieldPointsRef = useRef<THREE.Points | null>(null);
  const foregroundStarsRef = useRef<THREE.Points | null>(null);
  const celestialBloomRef = useRef<THREE.Sprite | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const transitionAnimRef = useRef<{
    fromIndex: number;
    toIndex: number;
    direction: 1 | -1;
    startTime: number;
    duration: number;
  } | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Lock body scroll on homepage
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Synchronize Site Header Theme with Active Planet Screen
  useEffect(() => {
    updateHeaderPlanetTheme(activeScreenIndex);
  }, [activeScreenIndex]);

  const totalScreensCount = 9; // 8 Planets (0..7) + 1 FAQ (8)
  const isPlanetScreen = activeScreenIndex <= 7;
  const activePlanetStage = planetServicesData[Math.min(activeScreenIndex, 7)];

  const currentBgGradient = isPlanetScreen
    ? activePlanetStage.bgGradient
    : 'linear-gradient(135deg, #070b14 0%, #0f182a 50%, #090e1a 100%)';

  const currentGlowColor = isPlanetScreen
    ? activePlanetStage.glowColor
    : 'rgba(56, 189, 248, 0.25)';

  const IconComponent = useMemo(() => {
    return ICON_MAP[activePlanetStage.id] || Globe;
  }, [activePlanetStage.id]);

  // Hollywood / Cinema-Grade Fluid Orbital Transition Controller
  const startTransitionTo = useCallback((targetIndex: number) => {
    if (isTransitioningRef.current || targetIndex === activeScreenIndexRef.current) return;
    if (targetIndex < 0 || targetIndex >= totalScreensCount) return;

    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setCardFade(true);

    // Immediately start smooth color transition on the site header to match arriving destination
    updateHeaderPlanetTheme(targetIndex);

    const fromIdx = activeScreenIndexRef.current;
    const direction = targetIndex > fromIdx ? 1 : -1;
    const duration = prefersReducedMotion ? 250 : 1000; // Crisp, cinema-grade 1000ms deep space hyperjump
    wheelCooldownUntilRef.current = performance.now() + duration + 200;

    const fromPlanetIdx = Math.min(fromIdx, 7);
    const toPlanetIdx = Math.min(targetIndex, 7);

    // Trigger Celestial Atmosphere Flare on arrival
    if (celestialBloomRef.current && toPlanetIdx < 8) {
      const toStage = planetServicesData[toPlanetIdx];
      celestialBloomRef.current.material.color.setHex(toStage.starColorHex);
      celestialBloomRef.current.scale.set(3.2, 3.2, 1.0);
      celestialBloomRef.current.material.opacity = 0.0;
      celestialBloomRef.current.visible = true;
    }

    // Setup 3D mesh textures & shader uniforms
    if (currentPlanetMeshRef.current && nextPlanetMeshRef.current && texturesRef.current.length > 0) {
      const fromTex = texturesRef.current[fromPlanetIdx] || texturesRef.current[0];
      const toTex = texturesRef.current[toPlanetIdx] || texturesRef.current[0];
      const fromStage = planetServicesData[fromPlanetIdx];
      const toStage = planetServicesData[toPlanetIdx];

      const currMat = currentPlanetMeshRef.current.material as THREE.ShaderMaterial;
      if (currMat.uniforms) {
        currMat.uniforms.uTexture.value = fromTex;
        currMat.uniforms.uIsRingPlanet.value = fromPlanetIdx === 5 || fromPlanetIdx === 6;
        currMat.uniforms.uAtmosphereColor.value = new THREE.Color(fromStage.starColorHex);
        currMat.uniforms.uOpacity.value = 1.0;
      }

      const nextMat = nextPlanetMeshRef.current.material as THREE.ShaderMaterial;
      if (nextMat.uniforms) {
        nextMat.uniforms.uTexture.value = toTex;
        nextMat.uniforms.uIsRingPlanet.value = toPlanetIdx === 5 || toPlanetIdx === 6;
        nextMat.uniforms.uAtmosphereColor.value = new THREE.Color(toStage.starColorHex);
        nextMat.uniforms.uOpacity.value = 0.0;
      }

      // Update Starfield color tint smoothly
      if (starfieldPointsRef.current) {
        const starMat = starfieldPointsRef.current.material as THREE.PointsMaterial;
        starMat.color.setHex(toStage.starColorHex);
      }
    }

    transitionAnimRef.current = {
      fromIndex: fromIdx,
      toIndex: targetIndex,
      direction,
      startTime: performance.now(),
      duration,
    };

    // Swap text content at midpoint while card is completely faded out
    setTimeout(() => {
      setActiveScreenIndex(targetIndex);
      activeScreenIndexRef.current = targetIndex;
    }, duration * 0.45);

    // Fade card back in as incoming planet locks into focal orbit
    setTimeout(() => {
      setCardFade(false);
    }, duration * 0.65);

    // Finalize transition smoothly
    setTimeout(() => {
      if (isTransitioningRef.current && transitionAnimRef.current?.toIndex === targetIndex) {
        try {
          setActiveScreenIndex(targetIndex);
          activeScreenIndexRef.current = targetIndex;

          if (currentPlanetMeshRef.current && texturesRef.current.length > 0) {
            const finalTex = texturesRef.current[toPlanetIdx] || texturesRef.current[0];
            const finalStage = planetServicesData[toPlanetIdx];
            const currMat = currentPlanetMeshRef.current.material as THREE.ShaderMaterial;
            if (currMat.uniforms) {
              currMat.uniforms.uTexture.value = finalTex;
              currMat.uniforms.uIsRingPlanet.value = toPlanetIdx === 5 || toPlanetIdx === 6;
              currMat.uniforms.uAtmosphereColor.value = new THREE.Color(finalStage.starColorHex);
              currMat.uniforms.uOpacity.value = 1.0;
            }
          }
          if (nextPlanetMeshRef.current) {
            nextPlanetMeshRef.current.visible = false;
          }
        } finally {
          transitionAnimRef.current = null;
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          setCardFade(false);
          wheelCooldownUntilRef.current = performance.now() + 200;
        }
      }
    }, duration + 30);
  }, [prefersReducedMotion, totalScreensCount]);

  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current) return;
    const cur = activeScreenIndexRef.current;
    if (cur > 0) {
      startTransitionTo(cur - 1);
    }
  }, [startTransitionTo]);

  const handleNext = useCallback(() => {
    if (isTransitioningRef.current) return;
    const cur = activeScreenIndexRef.current;
    if (cur < totalScreensCount - 1) {
      startTransitionTo(cur + 1);
    }
  }, [startTransitionTo, totalScreensCount]);

  // Input Listeners: Smooth Inertia Wheel, Touch, Pointer, Keyboard & Mouse Move Parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePosRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const isModalActive = () => {
      if (typeof document === 'undefined') return false;
      return (
        document.body.dataset.modalOpen === 'true' ||
        Boolean(document.querySelector('.reviews-modal-container'))
      );
    };

    const handleWheel = (e: WheelEvent) => {
      // NEVER process wheel navigation or prevent default if a modal/dialog is open
      if (isModalActive()) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('.reviews-modal-container, #mobile-menu-drawer')) return;

      e.preventDefault();
      const now = performance.now();
      if (isTransitioningRef.current || now < wheelCooldownUntilRef.current) return;

      wheelAccumulatorRef.current += e.deltaY;
      if (wheelAccumulatorRef.current > 45) {
        wheelAccumulatorRef.current = 0;
        handleNext();
      } else if (wheelAccumulatorRef.current < -45) {
        wheelAccumulatorRef.current = 0;
        handlePrev();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isModalActive()) return;
      if (e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isModalActive()) return;
      const now = performance.now();
      if (isTransitioningRef.current || now < wheelCooldownUntilRef.current) return;
      if (e.changedTouches.length > 0 && touchStartYRef.current !== 0) {
        const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
        if (deltaY > 35) {
          handleNext();
        } else if (deltaY < -35) {
          handlePrev();
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isModalActive()) return;
      pointerStartYRef.current = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isModalActive()) return;
      const now = performance.now();
      if (isTransitioningRef.current || now < wheelCooldownUntilRef.current) return;
      if (pointerStartYRef.current !== 0) {
        const deltaY = pointerStartYRef.current - e.clientY;
        if (deltaY > 35) {
          handleNext();
        } else if (deltaY < -35) {
          handlePrev();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalActive()) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    const handleCustomNext = () => handleNext();
    const handleCustomPrev = () => handlePrev();

    (window as unknown as { __planetNext?: () => void; __planetPrev?: () => void }).__planetNext = handleCustomNext;
    (window as unknown as { __planetNext?: () => void; __planetPrev?: () => void }).__planetPrev = handleCustomPrev;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('planet-next', handleCustomNext);
    window.addEventListener('planet-prev', handleCustomPrev);

    return () => {
      delete (window as unknown as { __planetNext?: () => void; __planetPrev?: () => void }).__planetNext;
      delete (window as unknown as { __planetNext?: () => void; __planetPrev?: () => void }).__planetPrev;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('planet-next', handleCustomNext);
      window.removeEventListener('planet-prev', handleCustomPrev);
    };
  }, [handleNext, handlePrev]);

  // Three.js WebGL Scene with 3D Mouse Parallax, Hyperspace Warp Lines, Shockwave & Seamless Meshes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0); // 100% transparent canvas
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, (canvas.clientWidth || 800) / (canvas.clientHeight || 600), 0.1, 150);
    camera.position.z = 6.0;
    cameraRef.current = camera;

    // Load authentic textures for all 8 planets
    const textureLoader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];

    planetServicesData.forEach((stage) => {
      const tex = textureLoader.load(stage.texture, () => {
        if (currentPlanetMeshRef.current) {
          const mat = currentPlanetMeshRef.current.material as THREE.ShaderMaterial;
          if (mat.uniforms) mat.uniforms.uTexture.value = textures[0];
        }
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      textures.push(tex);
    });
    texturesRef.current = textures;

    const planeGeo = new THREE.PlaneGeometry(4.2, 4.2);

    // 1. Current Planet Mesh & Custom Transparent Shader
    const initialAtmosphereColor = new THREE.Color(planetServicesData[0].starColorHex);
    const currentMat = createPlanetShader(textures[0] || null, false, initialAtmosphereColor, 1.0);
    const currentPlanetMesh = new THREE.Mesh(planeGeo, currentMat);
    currentPlanetMeshRef.current = currentPlanetMesh;
    scene.add(currentPlanetMesh);

    // 2. Next Planet Mesh (Incoming from 3D Orbital Arc)
    const nextMat = createPlanetShader(textures[1] || null, false, initialAtmosphereColor, 0.0);
    const nextPlanetMesh = new THREE.Mesh(planeGeo, nextMat);
    nextPlanetMesh.visible = false;
    nextPlanetMeshRef.current = nextPlanetMesh;
    scene.add(nextPlanetMesh);

    // 3. Cinematic Celestial Atmosphere Flare & Starlight Corona Bloom
    const createCelestialBloomTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.18, 'rgba(230, 245, 255, 0.75)');
        grad.addColorStop(0.42, 'rgba(100, 180, 255, 0.28)');
        grad.addColorStop(0.72, 'rgba(30, 100, 255, 0.08)');
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const bloomTex = createCelestialBloomTexture();
    const bloomMat = new THREE.SpriteMaterial({
      map: bloomTex,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const celestialBloom = new THREE.Sprite(bloomMat);
    celestialBloom.visible = false;
    celestialBloomRef.current = celestialBloom;
    scene.add(celestialBloom);

    // 4. Background Deep Starfield (800 Luminous Stars)
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 38;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 26 - 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.075,
      map: createGlowParticleTexture(),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: planetServicesData[0].starColorHex,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    starfieldPointsRef.current = starfield;
    scene.add(starfield);

    // 5. Foreground Parallax Dust Stars (200 Floating Spangles)
    const fgStarCount = 200;
    const fgStarGeo = new THREE.BufferGeometry();
    const fgStarPositions = new Float32Array(fgStarCount * 3);
    for (let i = 0; i < fgStarCount; i++) {
      fgStarPositions[i * 3] = (Math.random() - 0.5) * 18;
      fgStarPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      fgStarPositions[i * 3 + 2] = (Math.random() - 0.5) * 4 + 2;
    }
    fgStarGeo.setAttribute('position', new THREE.BufferAttribute(fgStarPositions, 3));
    const fgStarMat = new THREE.PointsMaterial({
      size: 0.050,
      map: createGlowParticleTexture(),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffffff,
    });
    const fgStars = new THREE.Points(fgStarGeo, fgStarMat);
    foregroundStarsRef.current = fgStars;
    scene.add(fgStars);

    // 6. Dynamic Shooting Stars (Kayan Yıldızlar) System
    const shootingStarsCount = 8;
    const shootingStars: ShootingStar[] = [];

    for (let i = 0; i < shootingStarsCount; i++) {
      const lineGeo = new THREE.BufferGeometry();
      const linePositions = new Float32Array(6); // 2 vertices: head and tail
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        linewidth: 2,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      shootingStars.push({
        line,
        geometry: lineGeo,
        material: lineMat,
        headPos: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        length: 1.8 + Math.random() * 1.5,
        active: false,
        spawnTime: 0,
        lifetime: 800 + Math.random() * 600,
      });
    }

    const spawnShootingStar = (star: ShootingStar, now: number) => {
      star.active = true;
      star.spawnTime = now;
      star.lifetime = 650 + Math.random() * 550;
      star.length = 2.2 + Math.random() * 1.8;

      // Spawn from top-right or deep space background
      const startX = 2.0 + Math.random() * 10.0;
      const startY = 3.0 + Math.random() * 6.0;
      const startZ = -4.0 - Math.random() * 8.0;

      star.headPos.set(startX, startY, startZ);

      // Trajectory: fast diagonal sweep downwards to the left
      const speed = 0.024 + Math.random() * 0.018;
      star.velocity.set(-speed * 1.6, -speed * 0.9, speed * 0.3);

      const colorHex = planetServicesData[activeScreenIndexRef.current % 8]?.starColorHex || 0x60a5fa;
      star.material.color.setHex(colorHex);
    };

    let lastMeteorSpawnTime = 0;

    const handleResize = () => {
      if (!renderer || !camera || !canvas) return;
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      const isDesktop = width >= 1024;
      const offsetX = isDesktop ? 1.5 : 0.0;
      currentPlanetMesh.position.x = offsetX;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let totalTime = 0;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      totalTime += dt;

      const isDesktop = (canvas.clientWidth || window.innerWidth) >= 1024;
      const restOffsetX = isDesktop ? 1.5 : 0.0;
      const anim = transitionAnimRef.current;

      // Smooth Mouse Parallax Lerp
      const mouse = mousePosRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Ambient Planet Subtle Roll & Gimbal Mouse Tilt
      const mouseTiltX = mouse.y * 0.12;
      const mouseTiltY = mouse.x * 0.18;

      currentPlanetMesh.rotation.x = mouseTiltX;
      currentPlanetMesh.rotation.z += dt * 0.02;

      nextPlanetMesh.rotation.x = mouseTiltX;
      nextPlanetMesh.rotation.z += dt * 0.025;

      // Foreground Dust Parallax
      fgStars.position.x = mouse.x * 0.6;
      fgStars.position.y = -mouse.y * 0.4;
      fgStars.rotation.y = totalTime * 0.03;

      const curShaderMat = currentPlanetMesh.material as THREE.ShaderMaterial;
      const nextShaderMat = nextPlanetMesh.material as THREE.ShaderMaterial;

      if (anim) {
        const elapsed = now - anim.startTime;
        const rawT = Math.min(Math.max(elapsed / anim.duration, 0.0), 1.0);
        const dollyIntensity = Math.sin(rawT * Math.PI);

        // 3D Cinematic Camera Depth Dolly & Hyperspace Surge
        camera.position.z = 6.0 + dollyIntensity * 0.95;
        camera.position.x = (mouse.x * 0.25) - (anim.direction * dollyIntensity * 0.30);
        camera.position.y = -mouse.y * 0.20;
        camera.rotation.z = -anim.direction * dollyIntensity * 0.04;

        // Hyperspace starfield acceleration & stretch
        starfield.position.z = anim.direction * dollyIntensity * 5.0;
        starfield.rotation.y = totalTime * 0.015 + (anim.direction * dollyIntensity * 0.08);
        starMat.size = 0.08 + dollyIntensity * 0.06;

        // Celestial Bloom Flare Animation
        const celestialBloom = celestialBloomRef.current;
        if (celestialBloom && celestialBloom.visible) {
          const bloomMat = celestialBloom.material as THREE.SpriteMaterial;
          const bloomProgress = Math.min(Math.max((rawT - 0.30) / 0.60, 0.0), 1.0);
          const bloomCurve = Math.sin(bloomProgress * Math.PI);
          celestialBloom.position.set(restOffsetX, 0.0, -0.6);
          celestialBloom.scale.setScalar(3.5 + bloomCurve * 3.2);
          bloomMat.opacity = bloomCurve * 0.55;
          if (rawT >= 0.95) {
            celestialBloom.visible = false;
            bloomMat.opacity = 0.0;
          }
        }

        if (anim.direction === 1) {
          // FORWARD: Departing planet accelerates forward and sweeps past camera left
          const departT = Math.pow(rawT, 1.8);
          currentPlanetMesh.position.x = restOffsetX - Math.pow(rawT, 1.4) * 5.2;
          currentPlanetMesh.position.y = Math.sin(rawT * Math.PI * 0.5) * 0.35;
          currentPlanetMesh.position.z = departT * 4.5;
          currentPlanetMesh.scale.setScalar(1.0 + departT * 0.7);
          currentPlanetMesh.rotation.y = mouseTiltY - rawT * 0.8;
          if (curShaderMat.uniforms) {
            curShaderMat.uniforms.uOpacity.value = Math.max(0.0, 1.0 - Math.pow(rawT, 1.4) * 1.5);
          }

          if (anim.toIndex < 8) {
            // Arriving planet emerges from deep cosmic background into orbit
            nextPlanetMesh.visible = true;
            const arriveProgress = Math.min(Math.max((rawT - 0.20) / 0.80, 0.0), 1.0);
            const arriveSmooth = arriveProgress * arriveProgress * arriveProgress * (arriveProgress * (arriveProgress * 6 - 15) + 10);

            nextPlanetMesh.position.x = restOffsetX + (1.0 - arriveSmooth) * 3.5;
            nextPlanetMesh.position.y = -(1.0 - arriveSmooth) * 0.35;
            nextPlanetMesh.position.z = -18.0 * (1.0 - arriveSmooth);
            nextPlanetMesh.scale.setScalar(0.12 + arriveSmooth * 0.88);
            nextPlanetMesh.rotation.y = mouseTiltY + (1.0 - arriveSmooth) * 0.7;
            if (nextShaderMat.uniforms) {
              nextShaderMat.uniforms.uOpacity.value = Math.min(1.0, arriveProgress * 1.8);
            }
          } else {
            nextPlanetMesh.visible = false;
          }
        } else {
          // BACKWARD: Departing planet recedes deep into space
          const departT = Math.pow(rawT, 1.8);
          currentPlanetMesh.position.x = restOffsetX + Math.pow(rawT, 1.4) * 3.8;
          currentPlanetMesh.position.y = -Math.sin(rawT * Math.PI * 0.5) * 0.35;
          currentPlanetMesh.position.z = -departT * 18.0;
          currentPlanetMesh.scale.setScalar(Math.max(0.08, 1.0 - departT * 0.92));
          currentPlanetMesh.rotation.y = mouseTiltY + rawT * 0.8;
          if (curShaderMat.uniforms) {
            curShaderMat.uniforms.uOpacity.value = Math.max(0.0, 1.0 - Math.pow(rawT, 1.4) * 1.5);
          }

          if (anim.toIndex < 8) {
            // Arriving planet sweeps in from camera flank into orbit
            nextPlanetMesh.visible = true;
            const arriveProgress = Math.min(Math.max((rawT - 0.20) / 0.80, 0.0), 1.0);
            const arriveSmooth = arriveProgress * arriveProgress * arriveProgress * (arriveProgress * (arriveProgress * 6 - 15) + 10);

            nextPlanetMesh.position.x = restOffsetX - (1.0 - arriveSmooth) * 3.8;
            nextPlanetMesh.position.y = (1.0 - arriveSmooth) * 0.35;
            nextPlanetMesh.position.z = 4.5 * (1.0 - arriveSmooth);
            nextPlanetMesh.scale.setScalar(1.6 - arriveSmooth * 0.6);
            nextPlanetMesh.rotation.y = mouseTiltY - (1.0 - arriveSmooth) * 0.7;
            if (nextShaderMat.uniforms) {
              nextShaderMat.uniforms.uOpacity.value = Math.min(1.0, arriveProgress * 1.8);
            }
          } else {
            nextPlanetMesh.visible = false;
          }
        }
      } else {
        // Resting State: Perfectly aligned with subtle 3D parallax
        const isFaq = activeScreenIndexRef.current === 8;
        currentPlanetMesh.visible = !isFaq;
        currentPlanetMesh.position.x = restOffsetX;
        currentPlanetMesh.position.y = 0.0;
        currentPlanetMesh.position.z = 0.0;
        currentPlanetMesh.scale.setScalar(1.0);
        currentPlanetMesh.rotation.y = mouseTiltY;
        
        camera.position.z = 6.0;
        camera.position.x = mouse.x * 0.25;
        camera.position.y = -mouse.y * 0.20;
        camera.rotation.z = 0.0;
        starfield.position.z = 0.0;
        starMat.size = 0.065;

        if (curShaderMat.uniforms) {
          curShaderMat.uniforms.uOpacity.value = isFaq ? 0.0 : 1.0;
        }

        nextPlanetMesh.visible = false;
        if (nextShaderMat.uniforms) {
          nextShaderMat.uniforms.uOpacity.value = 0.0;
        }

        if (celestialBloomRef.current) {
          celestialBloomRef.current.visible = false;
        }
      }

      // Gentle ambient drift for background starlight
      starfield.rotation.y = totalTime * 0.015;

      // Shooting Stars (Kayan Yıldızlar) Update Loop
      if (now - lastMeteorSpawnTime > 850) {
        lastMeteorSpawnTime = now;
        const inactiveStar = shootingStars.find((s) => !s.active);
        if (inactiveStar) {
          spawnShootingStar(inactiveStar, now);
        }
      }

      shootingStars.forEach((star) => {
        if (!star.active) return;
        const starAge = now - star.spawnTime;
        if (starAge > star.lifetime) {
          star.active = false;
          star.material.opacity = 0.0;
          return;
        }

        // Update position
        star.headPos.add(star.velocity);

        // Calculate tail position
        const dir = star.velocity.clone().normalize();
        const tailPos = star.headPos.clone().sub(dir.multiplyScalar(star.length));

        const positions = star.geometry.attributes.position.array as Float32Array;
        positions[0] = star.headPos.x;
        positions[1] = star.headPos.y;
        positions[2] = star.headPos.z;
        positions[3] = tailPos.x;
        positions[4] = tailPos.y;
        positions[5] = tailPos.z;
        star.geometry.attributes.position.needsUpdate = true;

        // Fade in and out
        const lifeRatio = starAge / star.lifetime;
        star.material.opacity = Math.sin(lifeRatio * Math.PI) * 0.95;
      });

      // Render Frame on Transparent Canvas
      renderer.render(scene, camera);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  return (
    <main
      data-testid="home-experience"
      data-active-index={String(activeScreenIndex)}
      data-active-scene={isPlanetScreen ? activePlanetStage.id : 'faq'}
      data-transitioning={String(isTransitioning)}
      className="relative w-full h-[calc(100vh-5rem)] sm:h-[calc(100vh-5.5rem)] overflow-hidden text-white flex flex-col justify-between select-none transition-colors duration-1000 ease-out"
      style={{
        background: currentBgGradient,
      }}
    >
      {/* Dynamic Luminous Celestial Glow (Planet Aura) */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out z-0"
        style={{
          background: isPlanetScreen
            ? `radial-gradient(circle at ${
                typeof window !== 'undefined' && window.innerWidth >= 1024 ? '68%' : '50%'
              } 50%, ${currentGlowColor} 0%, rgba(0, 0, 0, 0) 65%)`
            : 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.20) 0%, rgba(0, 0, 0, 0) 65%)',
        }}
      />

      {/* Anamorphic Cinematic Lens Flare Streak (Center-Right behind planet) */}
      {isPlanetScreen && (
        <div
          className="absolute top-1/2 right-[12%] -translate-y-1/2 w-[480px] lg:w-[700px] h-[1.5px] pointer-events-none z-0 opacity-40 transition-opacity duration-1000 hidden md:block"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${activePlanetStage.accentColor}00 20%, #ffffff 50%, ${activePlanetStage.accentColor}00 80%, transparent 100%)`,
            boxShadow: `0 0 16px 2px ${activePlanetStage.accentColor}`,
          }}
        />
      )}

      {/* 3D WebGL Canvas Viewport (100% Transparent) */}
      <canvas
        ref={canvasRef}
        data-testid="active-planet"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Top Experience Sub-Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 flex items-center justify-between shrink-0">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/60 border border-white/15 backdrop-blur-md text-xs font-semibold text-white shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
          </span>
          <span className="text-sky-300 font-extrabold uppercase tracking-wider">
            DİJİTAL HİZMET SERÜVENİ
          </span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">
            Tasarım, Yazılım ve Büyüme Tek Ekipte
          </span>
        </div>

        {/* Global Sequence Tracker */}
        <div
          data-testid="experience-progress-badge"
          className="flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-mono shadow-sm text-white"
        >
          <span className="text-xs font-black tracking-wider text-sky-300">
            0{activeScreenIndex + 1}
          </span>
          <span className="text-xs font-bold text-white/40">/</span>
          <span className="text-xs font-bold text-slate-400">09</span>
          <span className="ml-2 pl-2 border-l border-white/20 text-xs font-extrabold text-white">
            {isPlanetScreen ? activePlanetStage.planetName : 'Sık Sorulan Sorular'}
          </span>
        </div>
      </header>

      {/* Main Interactive Screen Viewport */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex-1 flex items-center px-4 sm:px-6 lg:px-8 py-1 min-h-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* SCREENS 01 to 08: PLANET SERVICE CARDS */}
          {isPlanetScreen && (
            <article
              data-testid="active-service-card"
              key={activePlanetStage.id}
              className={`lg:col-span-6 xl:col-span-5 bg-slate-950/75 backdrop-blur-3xl border border-white/20 p-5 sm:p-7 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] space-y-3.5 sm:space-y-4 transition-all duration-300 ease-out text-white ${
                cardFade ? 'opacity-0 translate-y-3 blur-xs scale-[0.98]' : 'opacity-100 translate-y-0 blur-none scale-100'
              }`}
              style={{
                boxShadow: `0 25px 60px -15px rgba(0,0,0,0.9), 0 0 30px -10px ${activePlanetStage.accentColor}30`,
              }}
            >
              {/* Category & Planet Badge */}
              <div className="flex items-center justify-between gap-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-xs border shadow-xs"
                  style={{
                    backgroundColor: `${activePlanetStage.accentColor}25`,
                    borderColor: `${activePlanetStage.accentColor}70`,
                    color: '#ffffff',
                  }}
                >
                  <IconComponent className="w-4 h-4 text-white" />
                  <span>{activePlanetStage.category}</span>
                </div>
                <span className="text-xs font-black tracking-widest uppercase text-slate-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  {activePlanetStage.planetName} SAHNESİ
                </span>
              </div>

              {/* H1 for Screen 01 (Earth), H2 for subsequent screens */}
              {activeScreenIndex === 0 ? (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                  {activePlanetStage.serviceName}
                </h1>
              ) : (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                  {activePlanetStage.serviceName}
                </h2>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-base font-medium text-slate-300 leading-relaxed">
                {activePlanetStage.description}
              </p>

              {/* 2x2 Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                {activePlanetStage.benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-200 font-semibold p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 shadow-xs backdrop-blur-md hover:bg-white/10 transition-colors"
                  >
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: activePlanetStage.accentColor }}
                    />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Action CTA Button */}
              <div className="pt-2 sm:pt-3 flex items-center justify-between gap-4">
                <a
                  href={activePlanetStage.href}
                  className="btn-primary text-xs sm:text-sm py-3 px-6 inline-flex items-center gap-2 shadow-lg shadow-sky-600/40 hover:scale-[1.02] transition-transform"
                >
                  <span>{activePlanetStage.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <span className="text-[11px] font-bold text-slate-400 hidden sm:inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Rent Yazılım Standartları
                </span>
              </div>
            </article>
          )}

          {/* SCREEN 09: FAQ ACCORDION */}
          {activeScreenIndex === 8 && (
            <article
              data-testid="faq-screen"
              className="lg:col-span-10 xl:col-span-9 bg-slate-950/85 backdrop-blur-3xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-sky-400">
                    09. EKRAN • SIKÇA SORULAN SORULAR
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                    Aklınıza Takılan Soruların Yanıtları
                  </h2>
                </div>
                <HelpCircle className="w-6 h-6 text-sky-400" />
              </div>

              {/* Accordion List */}
              <div className="space-y-3">
                {faqItemsData.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white cursor-pointer hover:bg-white/5 transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-sky-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CTAs on FAQ Screen: Always Side-by-side Row */}
              <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center gap-3">
                <a href="/iletisim/" className="btn-primary text-xs sm:text-sm py-2.5 px-4 sm:px-5 shrink-0 shadow-md shadow-sky-600/40 whitespace-nowrap">
                  Ücretsiz Ön Görüşme <ArrowRight className="w-4 h-4 ml-1 inline" />
                </a>
                <a
                  href={`https://wa.me/${brandConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs sm:text-sm py-2.5 px-4 sm:px-5 shrink-0 bg-white/10 border border-white/15 text-white hover:bg-white/20 shadow-xs inline-flex items-center whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                  WhatsApp'tan Görüş
                </a>
                <button
                  type="button"
                  data-testid="restart-experience"
                  onClick={() => startTransitionTo(0)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold text-white shrink-0 inline-flex items-center gap-1.5 cursor-pointer transition-all border border-white/15 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Hizmetleri Yeniden İncele
                </button>
              </div>

              {/* Legal Links Footer */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-3">
                <span>© {new Date().getFullYear()} Rent Yazılım. Tüm hakları saklıdır.</span>
                <div className="flex items-center gap-3">
                  <a href="/gizlilik-politikasi/" className="hover:text-sky-400">Gizlilik Politikası</a>
                  <span>•</span>
                  <a href="/kvkk-aydinlatma-metni/" className="hover:text-sky-400">KVKK</a>
                  <span>•</span>
                  <a href="/kullanim-kosullari/" className="hover:text-sky-400">Kullanım Koşulları</a>
                  <span>•</span>
                  <a href="/iletisim/" className="hover:text-sky-400">İletişim</a>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>

      {/* Accessible Navigation Controls (for tests & screen readers) */}
      <div className="fixed bottom-0 right-0 opacity-0 pointer-events-auto z-0" aria-hidden="true">
        <button
          data-testid="planet-prev"
          type="button"
          onClick={handlePrev}
          disabled={activeScreenIndex === 0 || isTransitioning}
          aria-label="Önceki Gezegen"
          className="w-4 h-4 p-0 m-0 cursor-pointer"
        >
          Önceki
        </button>
        <button
          data-testid="planet-next"
          type="button"
          onClick={handleNext}
          disabled={activeScreenIndex === totalScreensCount - 1 || isTransitioning}
          aria-label="Sonraki Gezegen"
          className="w-4 h-4 p-0 m-0 cursor-pointer"
        >
          Sonraki
        </button>
      </div>
    </main>
  );
};

export default PlanetServicesExperience;
