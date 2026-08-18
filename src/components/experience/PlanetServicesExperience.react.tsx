import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  Globe,
  Search,
  Smartphone,
  MapPin,
  Utensils,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Megaphone,
  Zap,
  RefreshCw,
  Star,
  MessageCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import {
  PlanetTransitionWaveShader,
  PlanetCoronaShader,
  createMercuryTexture,
  createMarsTexture,
  createUranusTexture,
  createNeptuneTexture,
  createSaturnRingTexture,
  createGlowParticleTexture
} from './shaders/planetShaders';

export interface PlanetServiceStage {
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
  texture: string;
  fallbackImage: string;
}

export const planetServicesData: PlanetServiceStage[] = [
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
    texture: '/images/planets/earth.jpg',
    fallbackImage: '/images/planets/earth.jpg'
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
    accentColor: '#94a3b8',
    texture: '/images/planets/earth.jpg', // Procedural Mercury canvas texture used in WebGL
    fallbackImage: '/images/planets/earth.jpg'
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
    accentColor: '#eab308',
    texture: '/images/planets/venus.jpg',
    fallbackImage: '/images/planets/venus.jpg'
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
    accentColor: '#ea580c',
    texture: '/images/planets/mars.jpg',
    fallbackImage: '/images/planets/mars.jpg'
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
    accentColor: '#d97706',
    texture: '/images/planets/jupiter.jpg',
    fallbackImage: '/images/planets/jupiter.jpg'
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
    accentColor: '#ca8a04',
    texture: '/images/planets/saturn.jpg',
    fallbackImage: '/images/planets/saturn.jpg'
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
    texture: '/images/planets/neptune.jpg', // Procedural Uranus texture used in WebGL
    fallbackImage: '/images/planets/neptune.jpg'
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
    texture: '/images/planets/neptune.jpg',
    fallbackImage: '/images/planets/neptune.jpg'
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

// Transition variant: true = Warm Flame (Solar Plasma), false = Cool Fluid (Cyan Energy)
const TRANSITION_VARIANTS: boolean[] = [
  false, // 0 -> 1: Dünya -> Merkür (Cool Fluid)
  true,  // 1 -> 2: Merkür -> Venüs (Warm Flame)
  true,  // 2 -> 3: Venüs -> Mars (Warm Flame)
  false, // 3 -> 4: Mars -> Jüpiter (Cool Fluid)
  true,  // 4 -> 5: Jüpiter -> Satürn (Warm Flame)
  false, // 5 -> 6: Satürn -> Uranüs (Cool Fluid)
  false  // 6 -> 7: Uranüs -> Neptün (Cool Fluid)
];

// Customer Reviews Data for Screen 09
const customerReviewsData = [
  {
    id: 1,
    name: 'Murat K.',
    role: 'Quattro Garaj Otomotiv — Şaşmaz / Ankara',
    platform: 'WhatsApp',
    platformColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30',
    stars: 5,
    text: 'Sitemiz açıldıktan sonra Google Haritalar üzerinden gelen müşteri sayımız neredeyse üç katına çıktı. Hem hız hem de tasarım olarak çok memnun kaldık, elinize sağlık.'
  },
  {
    id: 2,
    name: 'Elif S.',
    role: 'RN Vize Danışmanlık — Çankaya / Ankara',
    platform: 'Instagram',
    platformColor: 'text-purple-400 bg-purple-950/80 border-purple-500/30',
    stars: 5,
    text: 'Vize başvuru formlarımız ve WhatsApp yönlendirmelerimiz kusursuz çalışıyor. Reklamlardan gelen dönüşüm oranı beklentimizin çok üzerinde gerçekleşti.'
  },
  {
    id: 3,
    name: 'Dt. Hakan S.',
    role: 'Özel Diş Kliniği — Kızılay / Ankara',
    platform: 'Google Maps',
    platformColor: 'text-sky-400 bg-sky-950/80 border-sky-500/30',
    stars: 5,
    text: 'Kliniğimiz için hazırladıkları web sitesi hem hastalarımızdan çok olumlu geri dönüş aldı hem de randevu taleplerimizi çok düzenli hale getirdi.'
  }
];

// FAQ Data for Screen 10
const faqItemsData = [
  {
    q: 'Web sitem ne kadar sürede tamamlanır ve yayına alınır?',
    a: 'Kurumsal web siteleri ve landing page projelerini içerik onayı sonrası ortalama 3 ile 7 iş günü içerisinde eksiksiz olarak yayına alıyoruz.'
  },
  {
    q: 'Sitem mobil cihazlarda ve Google aramalarında nasıl görünür?',
    a: 'Tüm sitelerimiz %100 mobil uyumlu, Google Core Web Vitals ve teknik SEO standartlarına tam uyumlu olarak inşa edilir.'
  },
  {
    q: 'Yemeksepeti ve Trendyol Yemek panel süreçlerinde destek veriyor musunuz?',
    a: 'Evet, restoran ve kafeler için platform başvurularından dijital menü görsel düzenine, fiyatlandırmadan panel yönetimine kadar tam kapsamlı kurulum yapıyoruz.'
  },
  {
    q: 'Proje sonrası teknik destek ve güncelleme hizmeti sağlıyor musunuz?',
    a: 'Evet, teslim ettiğimiz tüm projelerde teknik bakım, güvenlik güncellemeleri ve içerik revizyon desteğini kesintisiz sürdürüyoruz.'
  }
];

export const PlanetServicesExperience: React.FC = () => {
  // Screen Index: 0 to 9 (0..7: Planets, 8: Reviews, 9: FAQ)
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const activeScreenIndexRef = useRef<number>(0);

  // Transition Lock State
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);

  // Selected Review Carousel Index for Screen 09
  const [activeReviewIdx, setActiveReviewIdx] = useState<number>(0);
  // Open FAQ Item Index for Screen 10
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Gesture refs
  const wheelAccumulatorRef = useRef<number>(0);
  const wheelCooldownUntilRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // Three.js Scene Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const coronaMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const planetMeshRef = useRef<THREE.Mesh | null>(null);
  const ringMeshRef = useRef<THREE.Mesh | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);

  // Transition Animation Ref (4600ms discrete)
  const transitionAnimRef = useRef<{
    fromIndex: number;
    toIndex: number;
    startTime: number;
    duration: number;
  } | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    activeScreenIndexRef.current = activeScreenIndex;
  }, [activeScreenIndex]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  // Lock body scroll on homepage mount and cleanup on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100dvh';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);

  // Reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Active Planet Data
  const isPlanetScreen = activeScreenIndex <= 7;
  const activePlanetStage = isPlanetScreen ? planetServicesData[activeScreenIndex] : planetServicesData[0];
  const IconComponent = useMemo(() => {
    return ICON_MAP[activePlanetStage.id] || Globe;
  }, [activePlanetStage.id]);

  // Discrete 4600ms Single-Shot Transition
  const startTransitionTo = useCallback((targetIndex: number) => {
    if (isTransitioningRef.current || targetIndex === activeScreenIndexRef.current) return;
    if (targetIndex < 0 || targetIndex > 9) return;

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const fromIdx = activeScreenIndexRef.current;
    const duration = prefersReducedMotion ? 300 : 4600;
    wheelCooldownUntilRef.current = performance.now() + duration + 350;

    const fromPlanetIdx = Math.min(fromIdx, 7);
    const toPlanetIdx = Math.min(targetIndex, 7);
    const isWarm = TRANSITION_VARIANTS[Math.min(fromPlanetIdx, toPlanetIdx)] ?? false;

    // Configure WebGL Transition Wavefront
    if (waveMaterialRef.current && texturesRef.current.length > 0) {
      waveMaterialRef.current.uniforms.uTexFrom.value = texturesRef.current[fromPlanetIdx];
      waveMaterialRef.current.uniforms.uTexTo.value = texturesRef.current[toPlanetIdx];
      waveMaterialRef.current.uniforms.uVariant.value = isWarm ? 1 : 0;
      waveMaterialRef.current.uniforms.uProgress.value = 0.0;
    }

    if (coronaMaterialRef.current) {
      coronaMaterialRef.current.uniforms.uVariant.value = isWarm ? 1 : 0;
      coronaMaterialRef.current.uniforms.uProgress.value = 0.0;
    }

    transitionAnimRef.current = {
      fromIndex: fromIdx,
      toIndex: targetIndex,
      startTime: performance.now(),
      duration,
    };

    // Safety fallback timer
    setTimeout(() => {
      if (isTransitioningRef.current && transitionAnimRef.current?.toIndex === targetIndex) {
        try {
          setActiveScreenIndex(targetIndex);
          activeScreenIndexRef.current = targetIndex;
          if (waveMaterialRef.current && texturesRef.current.length > 0) {
            const finalTex = texturesRef.current[toPlanetIdx] || texturesRef.current[0];
            waveMaterialRef.current.uniforms.uTexFrom.value = finalTex;
            waveMaterialRef.current.uniforms.uTexTo.value = finalTex;
            waveMaterialRef.current.uniforms.uProgress.value = 0.0;
          }
          if (coronaMaterialRef.current) {
            coronaMaterialRef.current.uniforms.uProgress.value = 0.0;
          }
        } finally {
          transitionAnimRef.current = null;
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          wheelCooldownUntilRef.current = performance.now() + 350;
        }
      }
    }, duration + 80);
  }, [prefersReducedMotion]);

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
    if (cur < 9) {
      startTransitionTo(cur + 1);
    }
  }, [startTransitionTo]);

  // Input Controllers: Wheel, Touch Swipe, Pointer, Keyboard
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now < wheelCooldownUntilRef.current || isTransitioningRef.current) {
        wheelAccumulatorRef.current = 0;
        return;
      }
      wheelAccumulatorRef.current += e.deltaY;
      if (Math.abs(wheelAccumulatorRef.current) > 50) {
        if (wheelAccumulatorRef.current > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        wheelAccumulatorRef.current = 0;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioningRef.current) return;
      if (e.changedTouches.length > 0) {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartYRef.current - touchEndY;
        if (Math.abs(deltaY) > 40) {
          if (deltaY > 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
    };

    let pointerStartY = 0;
    const handlePointerDown = (e: PointerEvent) => {
      pointerStartY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isTransitioningRef.current) return;
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

  // Initialize Three.js WebGL Procedural Scene
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
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, (canvas.clientWidth || 800) / (canvas.clientHeight || 600), 0.1, 100);
    camera.position.z = 6.0;

    try {
      const renderPass = new RenderPass(scene, camera);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(canvas.clientWidth || 800, canvas.clientHeight || 600),
        0.30, // Controlled Bloom Strength
        0.20, // Bloom Radius
        0.92  // Bloom Threshold
      );
      composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
    } catch (err) {
      console.warn('Bloom fallback:', err);
      composer = null;
    }

    // Load authentic textures for all 8 planets
    const textureLoader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];

    planetServicesData.forEach((stage) => {
      let tex: THREE.Texture;
      if (stage.id === 'mercury') {
        tex = createMercuryTexture();
      } else if (stage.id === 'mars') {
        tex = createMarsTexture();
      } else if (stage.id === 'uranus') {
        tex = createUranusTexture();
      } else if (stage.id === 'neptune') {
        tex = createNeptuneTexture();
      } else {
        tex = textureLoader.load(stage.texture);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
      }
      textures.push(tex);
    });
    texturesRef.current = textures;

    // 1. Base Planet Mesh (with Sweeping Wavefront Shader)
    const sphereGeo = new THREE.SphereGeometry(1.85, 64, 64);
    const waveMat = new THREE.ShaderMaterial({
      vertexShader: PlanetTransitionWaveShader.vertexShader,
      fragmentShader: PlanetTransitionWaveShader.fragmentShader,
      uniforms: {
        uTexFrom: { value: textures[0] || null },
        uTexTo: { value: textures[0] || null },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 },
        uUvOffset: { value: 0.0 },
        uVariant: { value: 0 },
        uLightDir: { value: new THREE.Vector3(1.2, 0.8, 1.5).normalize() },
      },
    });
    waveMaterialRef.current = waveMat;

    const planetMesh = new THREE.Mesh(sphereGeo, waveMat);
    planetMeshRef.current = planetMesh;
    scene.add(planetMesh);

    // 2. Saturn Ring Mesh (with Cassini Division)
    const ringGeo = new THREE.RingGeometry(2.25, 3.6, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      map: createSaturnRingTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      roughness: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.6;
    ringMesh.rotation.y = 0.15;
    ringMesh.visible = false;
    ringMeshRef.current = ringMesh;
    scene.add(ringMesh);

    // 3. Volumetric Corona Shell (Slightly larger sphere)
    const coronaGeo = new THREE.SphereGeometry(2.12, 48, 48);
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: PlanetCoronaShader.vertexShader,
      fragmentShader: PlanetCoronaShader.fragmentShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 },
        uVariant: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    coronaMaterialRef.current = coronaMat;
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // 4. Soft Round Energy Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 2.0 + Math.random() * 2.2;
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
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    particleSystemRef.current = particleSystem;
    scene.add(particleSystem);

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
      if (coronaMesh) coronaMesh.position.x = offsetX;
      if (particleSystem) particleSystem.position.x = offsetX;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let uvOffset = 0;
    let totalTime = 0;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      totalTime += dt;
      uvOffset = (uvOffset + dt * 0.015) % 1.0;

      let currentProgress = 0.0;
      const anim = transitionAnimRef.current;

      if (anim) {
        const elapsed = now - anim.startTime;
        const t = Math.min(Math.max(elapsed / anim.duration, 0.0), 1.0);
        currentProgress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        if (t >= 1.0) {
          try {
            const targetIdx = anim.toIndex;
            setActiveScreenIndex(targetIdx);
            activeScreenIndexRef.current = targetIdx;
            if (waveMaterialRef.current && texturesRef.current.length > 0) {
              const toPlanetIdx = Math.min(targetIdx, 7);
              const finalTex = texturesRef.current[toPlanetIdx] || texturesRef.current[0];
              waveMaterialRef.current.uniforms.uTexFrom.value = finalTex;
              waveMaterialRef.current.uniforms.uTexTo.value = finalTex;
              waveMaterialRef.current.uniforms.uProgress.value = 0.0;
            }
            if (coronaMaterialRef.current) {
              coronaMaterialRef.current.uniforms.uProgress.value = 0.0;
            }
          } finally {
            transitionAnimRef.current = null;
            isTransitioningRef.current = false;
            setIsTransitioning(false);
            wheelCooldownUntilRef.current = performance.now() + 350;
          }
        }
      }

      // Update Uniforms
      waveMat.uniforms.uProgress.value = currentProgress;
      waveMat.uniforms.uTime.value = totalTime;
      waveMat.uniforms.uUvOffset.value = uvOffset;

      coronaMat.uniforms.uProgress.value = currentProgress;
      coronaMat.uniforms.uTime.value = totalTime;

      // Rotate planet and particles
      planetMesh.rotation.y = uvOffset * Math.PI * 2 * 0.2;
      particleSystem.rotation.y = totalTime * 0.05;

      // Saturn Ring Visibility: Only on Saturn stage (idx 5)
      const currentActiveIdx = activeScreenIndexRef.current;
      ringMesh.visible = Boolean((currentActiveIdx === 5 && !anim) || (anim && (anim.toIndex === 5 || anim.fromIndex === 5)));

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer?.dispose();
    };
  }, []);

  return (
    <main
      id="gezegen-seruveni"
      data-testid="home-experience"
      data-active-index={activeScreenIndex}
      data-active-scene={activeScreenIndex <= 7 ? activePlanetStage.id : activeScreenIndex === 8 ? 'reviews' : 'faq'}
      data-transitioning={isTransitioning}
      aria-label="Rent Yazılım - Tam Ekran Dijital Hizmet Serüveni"
      className="relative w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 select-none overflow-hidden"
      style={{
        height: 'calc(100dvh - 5rem)',
        minHeight: 'calc(100svh - 5rem)',
      }}
    >
      {/* 3D WebGL Canvas Layer (Pure Three.js Procedural Engine - ZERO <video> tags!) */}
      <canvas
        ref={canvasRef}
        data-testid="active-planet"
        data-planet-id={activeScreenIndex <= 7 ? activePlanetStage.id : 'none'}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Header Bar: Screen Progress Counter */}
      <header className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-sky-950/90 border border-sky-400/30 text-sky-300 backdrop-blur-md shadow-lg w-fit">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>DİJİTAL HİZMET SERÜVENİ</span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wide hidden sm:inline">
            Tasarım, Yazılım ve Büyüme Tek Ekipte
          </span>
        </div>

        {/* 01 / 10 Screen Counter */}
        <div
          aria-live="polite"
          className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full backdrop-blur-md shadow-xl"
        >
          <span className="text-xs font-black tracking-wider text-sky-400">
            0{activeScreenIndex + 1}
          </span>
          <span className="text-xs font-bold text-slate-600">/</span>
          <span className="text-xs font-bold text-slate-400">10</span>
          <span className="ml-2 pl-2 border-l border-slate-800 text-xs font-extrabold text-slate-200">
            {activeScreenIndex <= 7
              ? activePlanetStage.planetName
              : activeScreenIndex === 8
              ? 'Yorumlarımız'
              : 'Sık Sorulan Sorular'}
          </span>
        </div>
      </header>

      {/* Main Interactive Screen Viewport */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-2">
        
        {/* SCREENS 01 to 08: PLANET SERVICE CARDS */}
        {isPlanetScreen && (
          <article
            data-testid="active-service-card"
            key={activePlanetStage.id}
            className="lg:col-span-6 xl:col-span-5 bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-slate-950/90 space-y-4 sm:space-y-5 transition-all duration-500 ease-out"
          >
            {/* Category & Planet Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-950/90 border border-sky-500/30 text-sky-300 font-bold text-xs">
                <IconComponent className="w-4 h-4 text-sky-400" />
                <span>{activePlanetStage.category}</span>
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {activePlanetStage.planetName} SAHNESİ
              </span>
            </div>

            {/* H1 for Screen 01 (Earth), H2 for all subsequent screens */}
            {activeScreenIndex === 0 ? (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {activePlanetStage.serviceName}
              </h1>
            ) : (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
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
                href={activePlanetStage.href}
                className="btn-primary text-xs sm:text-sm py-3 px-6 inline-flex items-center gap-2 shadow-lg shadow-sky-950/50"
              >
                <span>{activePlanetStage.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <span className="text-[11px] font-bold text-slate-400 hidden sm:inline-block">
                Rent Yazılım Standartları
              </span>
            </div>
          </article>
        )}

        {/* SCREEN 09: CUSTOMER REVIEWS */}
        {activeScreenIndex === 8 && (
          <article
            data-testid="reviews-screen"
            className="lg:col-span-8 xl:col-span-7 bg-slate-950/90 backdrop-blur-2xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-sky-400">
                  09. EKRAN • MÜŞTERİ GERİ DÖNÜŞLERİ
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Yeni Yorumlarımız
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                Instagram & WhatsApp
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              İşletmelerini dijitale taşıdığımız mutlu müşterilerimizin Instagram ve WhatsApp üzerinden ilettiği gerçek 5 yıldızlı geri dönüşler.
            </p>

            {/* Selected Review Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(customerReviewsData[activeReviewIdx].stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-black text-white">5.0 / 5.0</span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${customerReviewsData[activeReviewIdx].platformColor}`}>
                  {customerReviewsData[activeReviewIdx].platform} Doğrulandı
                </span>
              </div>

              <blockquote className="text-sm sm:text-base text-slate-100 italic font-medium leading-relaxed">
                “{customerReviewsData[activeReviewIdx].text}”
              </blockquote>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div>
                  <div className="text-xs font-black text-white">{customerReviewsData[activeReviewIdx].name}</div>
                  <div className="text-[11px] text-slate-400">{customerReviewsData[activeReviewIdx].role}</div>
                </div>

                {/* Review Carousel Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReviewIdx((prev) => (prev > 0 ? prev - 1 : customerReviewsData.length - 1))}
                    aria-label="Önceki Yorum"
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                  >
                    ←
                  </button>
                  <span className="text-xs font-mono text-slate-400">{activeReviewIdx + 1}/{customerReviewsData.length}</span>
                  <button
                    type="button"
                    onClick={() => setActiveReviewIdx((prev) => (prev < customerReviewsData.length - 1 ? prev + 1 : 0))}
                    aria-label="Sonraki Yorum"
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* SCREEN 10: FREQUENTLY ASKED QUESTIONS (FAQ) & MINIMAL LEGAL FOOTER */}
        {activeScreenIndex === 9 && (
          <article
            data-testid="faq-screen"
            className="lg:col-span-9 xl:col-span-8 bg-slate-950/90 backdrop-blur-2xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-sky-400">
                  10. EKRAN • SIKÇA SORULAN SORULAR
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Aklınıza Takılan Soruların Yanıtları
                </h2>
              </div>
              <HelpCircle className="w-6 h-6 text-sky-400" />
            </div>

            {/* Accordion FAQ Items */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {faqItemsData.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full text-left p-3.5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-100 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-400' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2.5">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/iletisim/"
                className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2"
              >
                <span>Ücretsiz Ön Görüşme</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/905303498845"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white inline-flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp’tan Görüş</span>
              </a>

              <button
                type="button"
                onClick={() => startTransitionTo(0)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hizmetleri Yeniden İncele</span>
              </button>
            </div>

            {/* Minimal Legal Footer Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <div>© 2026 Rent Yazılım. Tüm hakları saklıdır.</div>
              <div className="flex items-center gap-3">
                <a href="/gizlilik-politikasi/" className="hover:text-slate-300 transition-colors">Gizlilik Politikası</a>
                <span>•</span>
                <a href="/kvkk-aydinlatma-metni/" className="hover:text-slate-300 transition-colors">KVKK</a>
                <span>•</span>
                <a href="/kullanim-kosullari/" className="hover:text-slate-300 transition-colors">Kullanım Koşulları</a>
                <span>•</span>
                <a href="/iletisim/" className="hover:text-slate-300 transition-colors">İletişim</a>
              </div>
            </div>
          </article>
        )}

        {/* Reserved Clearance for 3D Planet on Desktop */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 pointer-events-none" aria-hidden="true" />
      </div>

      {/* Bottom Navigation Controls: Read-only Progress Pills on Left, Directional Controls on Right */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full pb-1 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Read-only Progress Indicators (Non-skipping) */}
        <div
          aria-label="Gezegen Hizmet İlerleme Durumu"
          className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-full backdrop-blur-md overflow-x-auto max-w-full"
        >
          {Array.from({ length: 10 }).map((_, idx) => {
            const isActive = idx === activeScreenIndex;
            const isCompleted = idx < activeScreenIndex;
            const label = idx <= 7 ? planetServicesData[idx].planetName : idx === 8 ? 'Yorumlar' : 'SSS';
            return (
              <div
                key={idx}
                data-testid={`screen-indicator-${idx}`}
                aria-current={isActive ? 'step' : undefined}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/40 scale-105'
                    : isCompleted
                    ? 'bg-sky-950/60 text-sky-400 border border-sky-500/20'
                    : 'bg-slate-900/60 text-slate-500'
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">0{idx + 1}</span>
                <span className={isActive ? 'inline' : 'hidden md:inline'}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Directional Controls (Prev / Next Buttons & Scroll Hint) */}
        <div className="flex items-center gap-3">
          <span className="hidden xl:inline-block text-[11px] font-bold text-slate-400">
            Aşağı Kaydırın veya Ok Tuşlarını Kullanın
          </span>

          {/* Previous Button (Up Arrow) */}
          <button
            type="button"
            data-testid="planet-prev"
            disabled={activeScreenIndex === 0 || isTransitioning}
            onClick={handlePrev}
            aria-label="Önceki Ekran"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900/90 focus-visible:ring-2 focus-visible:ring-sky-400 focus:outline-none active:scale-95"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* Next Button (Down Arrow) */}
          <button
            type="button"
            data-testid="planet-next"
            disabled={activeScreenIndex === 9 || isTransitioning}
            onClick={handleNext}
            aria-label="Sonraki Ekran"
            className="h-11 min-h-[44px] px-5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-400 focus:outline-none active:scale-95"
          >
            <span>
              {activeScreenIndex < 7
                ? `Sonraki: ${planetServicesData[activeScreenIndex + 1]?.planetName}`
                : activeScreenIndex === 7
                ? 'Sonraki: Yorumlarımız'
                : activeScreenIndex === 8
                ? 'Sonraki: Sık Sorulan Sorular'
                : 'Tamamlandı'}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </main>
  );
};

export default PlanetServicesExperience;
