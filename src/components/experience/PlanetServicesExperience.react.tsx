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
  texture: string;
  fallbackImage: string;
}

// 8 Primary Planetary Service Stages
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
    glowColor: 'rgba(56, 189, 248, 0.28)',
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
    accentColor: '#0369a1',
    glowColor: 'rgba(14, 165, 233, 0.25)',
    texture: '/images/planets/mercury.jpg',
    fallbackImage: '/images/planets/mercury.jpg'
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
    accentColor: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.25)',
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
    accentColor: '#dc2626',
    glowColor: 'rgba(239, 68, 68, 0.25)',
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
    accentColor: '#ea580c',
    glowColor: 'rgba(249, 115, 22, 0.25)',
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
    accentColor: '#b45309',
    glowColor: 'rgba(202, 138, 4, 0.25)',
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
    accentColor: '#0891b2',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    texture: '/images/planets/uranus.jpg',
    fallbackImage: '/images/planets/uranus.jpg'
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
    accentColor: '#1d4ed8',
    glowColor: 'rgba(37, 99, 235, 0.28)',
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

// Custom Transparent Shader Material that masks square borders and blends planet sphere onto light canvas
function createPlanetShader(texture: THREE.Texture | null, isRingPlanet: boolean, initialOpacity = 1.0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uOpacity: { value: initialOpacity },
      uIsRingPlanet: { value: isRingPlanet },
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
      varying vec2 vUv;

      void main() {
        vec2 center = vUv - vec2(0.5);
        float dist = length(center);
        
        float mask = 1.0;
        if (!uIsRingPlanet) {
          mask = 1.0 - smoothstep(0.485, 0.498, dist);
        } else {
          vec4 tex = texture2D(uTexture, vUv);
          float lum = max(tex.r, max(tex.g, tex.b));
          float edgeDist = max(abs(center.x), abs(center.y));
          float edgeMask = 1.0 - smoothstep(0.465, 0.498, edgeDist);
          mask = smoothstep(0.015, 0.08, lum) * edgeMask;
        }

        vec4 texColor = texture2D(uTexture, vUv);
        float alpha = mask * uOpacity;

        if (alpha <= 0.005) {
          discard;
        }

        gl_FragColor = vec4(texColor.rgb, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
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

  // Three.js Scene References
  const texturesRef = useRef<THREE.Texture[]>([]);
  const currentPlanetMeshRef = useRef<THREE.Mesh | null>(null);
  const nextPlanetMeshRef = useRef<THREE.Mesh | null>(null);
  const starfieldPointsRef = useRef<THREE.Points | null>(null);
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

  const totalScreensCount = 9; // 8 Planets (0..7) + 1 FAQ (8)
  const isPlanetScreen = activeScreenIndex <= 7;
  const activePlanetStage = planetServicesData[Math.min(activeScreenIndex, 7)];

  const IconComponent = useMemo(() => {
    return ICON_MAP[activePlanetStage.id] || Globe;
  }, [activePlanetStage.id]);

  // Apple-Grade Studio Orbital Transition Controller
  const startTransitionTo = useCallback((targetIndex: number) => {
    if (isTransitioningRef.current || targetIndex === activeScreenIndexRef.current) return;
    if (targetIndex < 0 || targetIndex >= totalScreensCount) return;

    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setCardFade(true);

    const fromIdx = activeScreenIndexRef.current;
    const direction = targetIndex > fromIdx ? 1 : -1;
    const duration = prefersReducedMotion ? 250 : 950;
    wheelCooldownUntilRef.current = performance.now() + duration + 150;

    const fromPlanetIdx = Math.min(fromIdx, 7);
    const toPlanetIdx = Math.min(targetIndex, 7);

    // Setup 3D mesh textures & shader uniforms
    if (currentPlanetMeshRef.current && nextPlanetMeshRef.current && texturesRef.current.length > 0) {
      const fromTex = texturesRef.current[fromPlanetIdx] || texturesRef.current[0];
      const toTex = texturesRef.current[toPlanetIdx] || texturesRef.current[0];

      const currMat = currentPlanetMeshRef.current.material as THREE.ShaderMaterial;
      if (currMat.uniforms) {
        currMat.uniforms.uTexture.value = fromTex;
        currMat.uniforms.uIsRingPlanet.value = fromPlanetIdx === 5 || fromPlanetIdx === 6;
        currMat.uniforms.uOpacity.value = 1.0;
      }

      const nextMat = nextPlanetMeshRef.current.material as THREE.ShaderMaterial;
      if (nextMat.uniforms) {
        nextMat.uniforms.uTexture.value = toTex;
        nextMat.uniforms.uIsRingPlanet.value = toPlanetIdx === 5 || toPlanetIdx === 6;
        nextMat.uniforms.uOpacity.value = 0.0;
      }
    }

    transitionAnimRef.current = {
      fromIndex: fromIdx,
      toIndex: targetIndex,
      direction,
      startTime: performance.now(),
      duration,
    };

    // Swap text content at midpoint of orbital glide
    setTimeout(() => {
      setActiveScreenIndex(targetIndex);
      activeScreenIndexRef.current = targetIndex;
      setCardFade(false);
    }, duration * 0.40);

    // Finalize transition smoothly
    setTimeout(() => {
      if (isTransitioningRef.current && transitionAnimRef.current?.toIndex === targetIndex) {
        try {
          setActiveScreenIndex(targetIndex);
          activeScreenIndexRef.current = targetIndex;

          if (currentPlanetMeshRef.current && texturesRef.current.length > 0) {
            const finalTex = texturesRef.current[toPlanetIdx] || texturesRef.current[0];
            const currMat = currentPlanetMeshRef.current.material as THREE.ShaderMaterial;
            if (currMat.uniforms) {
              currMat.uniforms.uTexture.value = finalTex;
              currMat.uniforms.uIsRingPlanet.value = toPlanetIdx === 5 || toPlanetIdx === 6;
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
          wheelCooldownUntilRef.current = performance.now() + 150;
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

  // Input Listeners: Wheel, Touch, Pointer, Keyboard
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (isTransitioningRef.current || now < wheelCooldownUntilRef.current) return;

      wheelAccumulatorRef.current += e.deltaY;
      if (wheelAccumulatorRef.current > 40) {
        wheelAccumulatorRef.current = 0;
        handleNext();
      } else if (wheelAccumulatorRef.current < -40) {
        wheelAccumulatorRef.current = 0;
        handlePrev();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = performance.now();
      if (isTransitioningRef.current || now < wheelCooldownUntilRef.current) return;
      if (e.changedTouches.length > 0 && touchStartYRef.current !== 0) {
        const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
        if (deltaY > 30) {
          handleNext();
        } else if (deltaY < -30) {
          handlePrev();
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerStartYRef.current = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      const now = performance.now();
      if (isTransitioningRef.current || now < wheelCooldownUntilRef.current) return;
      if (pointerStartYRef.current !== 0) {
        const deltaY = pointerStartYRef.current - e.clientY;
        if (deltaY > 30) {
          handleNext();
        } else if (deltaY < -30) {
          handlePrev();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  // Three.js WebGL Scene Setup with 100% Transparent Background & Smooth Orbital Choreography
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
    renderer.toneMappingExposure = 1.05;

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
    const currentMat = createPlanetShader(textures[0] || null, false, 1.0);
    const currentPlanetMesh = new THREE.Mesh(planeGeo, currentMat);
    currentPlanetMeshRef.current = currentPlanetMesh;
    scene.add(currentPlanetMesh);

    // 2. Next Planet Mesh (Incoming from 3D Orbital Arc)
    const nextMat = createPlanetShader(textures[1] || null, false, 0.0);
    const nextPlanetMesh = new THREE.Mesh(planeGeo, nextMat);
    nextPlanetMesh.visible = false;
    nextPlanetMeshRef.current = nextPlanetMesh;
    scene.add(nextPlanetMesh);

    // 3. Dynamic Luminous Starlight Dust (250 Soft Luminous Blue/White Particles)
    const starCount = 250;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 32;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.05,
      map: createGlowParticleTexture(),
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
      depthWrite: false,
      color: 0x0284c7,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    starfieldPointsRef.current = starfield;
    scene.add(starfield);

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

      // Ambient Planet Subtle Roll
      currentPlanetMesh.rotation.x = 0;
      currentPlanetMesh.rotation.y = 0;
      currentPlanetMesh.rotation.z += dt * 0.02;

      nextPlanetMesh.rotation.x = 0;
      nextPlanetMesh.rotation.y = 0;
      nextPlanetMesh.rotation.z += dt * 0.025;

      const curShaderMat = currentPlanetMesh.material as THREE.ShaderMaterial;
      const nextShaderMat = nextPlanetMesh.material as THREE.ShaderMaterial;

      if (anim) {
        const elapsed = now - anim.startTime;
        const rawT = Math.min(Math.max(elapsed / anim.duration, 0.0), 1.0);

        // Apple-style Signature Deceleration Curve: cubic-bezier(0.16, 1, 0.3, 1)
        const smoothT = 1 - Math.pow(1 - rawT, 3.2);

        if (anim.direction === 1) {
          // FORWARD (Next Planet): Current planet glides slightly left & into depth
          currentPlanetMesh.position.x = restOffsetX - smoothT * 1.8;
          currentPlanetMesh.position.y = smoothT * 0.3;
          currentPlanetMesh.position.z = -smoothT * 1.5;
          currentPlanetMesh.scale.setScalar(1.0 - smoothT * 0.20);
          if (curShaderMat.uniforms) {
            curShaderMat.uniforms.uOpacity.value = Math.max(0.0, 1.0 - smoothT * 1.6);
          }

          if (anim.toIndex < 8) {
            // Next planet smoothly swoops in from the right foreground
            nextPlanetMesh.visible = true;
            nextPlanetMesh.position.x = (restOffsetX + 2.4) - smoothT * 2.4;
            nextPlanetMesh.position.y = -0.3 + smoothT * 0.3;
            nextPlanetMesh.position.z = 0.8 - smoothT * 0.8;
            nextPlanetMesh.scale.setScalar(1.18 - smoothT * 0.18);
            if (nextShaderMat.uniforms) {
              nextShaderMat.uniforms.uOpacity.value = Math.min(1.0, smoothT * 1.6);
            }
          } else {
            nextPlanetMesh.visible = false;
          }
        } else {
          // BACKWARD (Prev Planet): Current planet glides right & into depth
          currentPlanetMesh.position.x = restOffsetX + smoothT * 1.8;
          currentPlanetMesh.position.y = -smoothT * 0.3;
          currentPlanetMesh.position.z = -smoothT * 1.5;
          currentPlanetMesh.scale.setScalar(1.0 - smoothT * 0.20);
          if (curShaderMat.uniforms) {
            curShaderMat.uniforms.uOpacity.value = Math.max(0.0, 1.0 - smoothT * 1.6);
          }

          if (anim.toIndex < 8) {
            // Prev planet swoops in from left foreground
            nextPlanetMesh.visible = true;
            nextPlanetMesh.position.x = (restOffsetX - 2.4) + smoothT * 2.4;
            nextPlanetMesh.position.y = 0.3 - smoothT * 0.3;
            nextPlanetMesh.position.z = 0.8 - smoothT * 0.8;
            nextPlanetMesh.scale.setScalar(1.18 - smoothT * 0.18);
            if (nextShaderMat.uniforms) {
              nextShaderMat.uniforms.uOpacity.value = Math.min(1.0, smoothT * 1.6);
            }
          } else {
            nextPlanetMesh.visible = false;
          }
        }
      } else {
        // Resting State: Perfectly aligned at focal position
        const isFaq = activeScreenIndexRef.current === 8;
        currentPlanetMesh.visible = !isFaq;
        currentPlanetMesh.position.x = restOffsetX;
        currentPlanetMesh.position.y = 0.0;
        currentPlanetMesh.position.z = 0.0;
        currentPlanetMesh.scale.setScalar(1.0);
        if (curShaderMat.uniforms) {
          curShaderMat.uniforms.uOpacity.value = isFaq ? 0.0 : 1.0;
        }

        nextPlanetMesh.visible = false;
        if (nextShaderMat.uniforms) {
          nextShaderMat.uniforms.uOpacity.value = 0.0;
        }
      }

      // Gentle ambient drift for background starlight
      starfield.rotation.y = totalTime * 0.015;

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
      className="relative w-full h-[calc(100vh-5rem)] sm:h-[calc(100vh-5.5rem)] overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/50 to-blue-50/30 text-slate-900 flex flex-col select-none"
    >
      {/* Dynamic Luminous Celestial Glow (Planet Aura) */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-0"
        style={{
          background: isPlanetScreen
            ? `radial-gradient(circle at ${
                typeof window !== 'undefined' && window.innerWidth >= 1024 ? '68%' : '50%'
              } 50%, ${activePlanetStage.glowColor} 0%, rgba(248, 250, 252, 0) 65%)`
            : 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, rgba(248, 250, 252, 0) 65%)',
        }}
      />

      {/* 3D WebGL Canvas Viewport (100% Transparent) */}
      <canvas
        ref={canvasRef}
        data-testid="active-planet"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Top Experience Sub-Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 flex items-center justify-between shrink-0">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 backdrop-blur-md text-xs font-semibold text-slate-700 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600" />
          </span>
          <span className="text-sky-600 font-extrabold uppercase tracking-wider">
            DİJİTAL HİZMET SERÜVENİ
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden sm:inline">
            Tasarım, Yazılım ve Büyüme Tek Ekipte
          </span>
        </div>

        {/* Global Sequence Tracker */}
        <div
          data-testid="experience-progress-badge"
          className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-mono shadow-sm text-slate-700"
        >
          <span className="text-xs font-black tracking-wider text-sky-600">
            0{activeScreenIndex + 1}
          </span>
          <span className="text-xs font-bold text-slate-400">/</span>
          <span className="text-xs font-bold text-slate-500">09</span>
          <span className="ml-2 pl-2 border-l border-slate-200 text-xs font-extrabold text-slate-800">
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
              className={`lg:col-span-6 xl:col-span-5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 p-5 sm:p-7 rounded-3xl shadow-2xl shadow-sky-950/5 space-y-3.5 sm:space-y-4 transition-all duration-300 ease-out text-slate-900 ${
                cardFade ? 'opacity-0 -translate-y-2.5 blur-xs' : 'opacity-100 translate-y-0 blur-none'
              }`}
            >
            {/* Category & Planet Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-700 font-bold text-xs">
                <IconComponent className="w-4 h-4 text-sky-600" />
                <span>{activePlanetStage.category}</span>
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-slate-500 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200/80">
                {activePlanetStage.planetName} SAHNESİ
              </span>
            </div>

            {/* H1 for Screen 01 (Earth), H2 for subsequent screens */}
            {activeScreenIndex === 0 ? (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {activePlanetStage.serviceName}
              </h1>
            ) : (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {activePlanetStage.serviceName}
              </h2>
            )}

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base font-medium text-slate-600 leading-relaxed">
              {activePlanetStage.description}
            </p>

            {/* 2x2 Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              {activePlanetStage.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold p-2.5 sm:p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Action CTA Button */}
            <div className="pt-2 sm:pt-3 flex items-center justify-between gap-4">
              <a
                href={activePlanetStage.href}
                className="btn-primary text-xs sm:text-sm py-3 px-6 inline-flex items-center gap-2 shadow-lg shadow-sky-600/20"
              >
                <span>{activePlanetStage.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <span className="text-[11px] font-bold text-slate-500 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Rent Yazılım Standartları
              </span>
            </div>
          </article>
        )}

        {/* SCREEN 09: FAQ ACCORDION */}
        {activeScreenIndex === 8 && (
          <article
            data-testid="faq-screen"
            className="lg:col-span-8 xl:col-span-7 bg-white/95 backdrop-blur-2xl border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 text-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-sky-600">
                  09. EKRAN • SIKÇA SORULAN SORULAR
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Aklınıza Takılan Soruların Yanıtları
                </h2>
              </div>
              <HelpCircle className="w-6 h-6 text-sky-600" />
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {faqItemsData.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/80 hover:bg-slate-100/60 transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 cursor-pointer hover:bg-slate-100/80 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-sky-600 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTAs on FAQ Screen */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a href="/iletisim/" className="btn-primary text-xs sm:text-sm py-2.5 px-5 shadow-md shadow-sky-600/20">
                Ücretsiz Ön Görüşme <ArrowRight className="w-4 h-4 ml-1" />
              </a>
              <a
                href={`https://wa.me/${brandConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs sm:text-sm py-2.5 px-5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
                WhatsApp'tan Görüş
              </a>
              <button
                type="button"
                data-testid="restart-experience"
                onClick={() => startTransitionTo(0)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Hizmetleri Yeniden İncele
              </button>
            </div>

            {/* Legal Links Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-3">
              <span>© {new Date().getFullYear()} Rent Yazılım. Tüm hakları saklıdır.</span>
              <div className="flex items-center gap-3">
                <a href="/gizlilik-politikasi/" className="hover:text-sky-600">Gizlilik Politikası</a>
                <span>•</span>
                <a href="/kvkk-aydinlatma-metni/" className="hover:text-sky-600">KVKK</a>
                <span>•</span>
                <a href="/kullanim-kosullari/" className="hover:text-sky-600">Kullanım Koşulları</a>
                <span>•</span>
                <a href="/iletisim/" className="hover:text-sky-600">İletişim</a>
              </div>
            </div>
          </article>
        )}
        </div>
      </div>

      {/* Bottom Sticky Navigation Bar */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-1 shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/92 backdrop-blur-xl border border-slate-200/90 p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-300/30">
          
          {/* Planet Pills Navigator */}
          <div
            role="tablist"
            aria-label="Gezegen ve Hizmet Seçici"
            className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none"
          >
            {planetServicesData.map((stage, idx) => {
              const isActive = activeScreenIndex === idx;
              return (
                <button
                  key={stage.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  disabled={isTransitioning}
                  onClick={() => startTransitionTo(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70 mr-1">0{idx + 1}</span>
                  <span>{stage.planetName}</span>
                </button>
              );
            })}

            {/* FAQ Pill */}
            <button
              role="tab"
              aria-selected={activeScreenIndex === 8}
              type="button"
              disabled={isTransitioning}
              onClick={() => startTransitionTo(8)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed ${
                activeScreenIndex === 8
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <span className="font-mono text-[10px] opacity-70 mr-1">09</span>
              <span>SSS</span>
            </button>
          </div>

          {/* Directional Prev / Next Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] text-slate-500 font-medium hidden md:inline-block mr-2">
              Aşağı Kaydırın veya Ok Tuşlarını Kullanın
            </span>

            {/* Prev Button */}
            <button
              data-testid="planet-prev"
              type="button"
              onClick={handlePrev}
              disabled={activeScreenIndex === 0 || isTransitioning}
              aria-label="Önceki Gezegen"
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>

            {/* Next Button */}
            <button
              data-testid="planet-next"
              type="button"
              onClick={handleNext}
              disabled={activeScreenIndex === totalScreensCount - 1 || isTransitioning}
              aria-label="Sonraki Gezegen"
              className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-sky-600/20"
            >
              <span>
                {activeScreenIndex < 7
                  ? `Sonraki: ${planetServicesData[activeScreenIndex + 1]?.planetName}`
                  : activeScreenIndex === 7
                  ? 'Sonraki: SSS'
                  : 'Tamamlandı'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default PlanetServicesExperience;
