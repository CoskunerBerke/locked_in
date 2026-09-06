import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, MessageCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import brandConfig from '../../config/brand';

export const customerReviewsList = [
  {
    id: 1,
    name: 'Murat K.',
    role: 'Quattro Garaj Otomotiv — Şaşmaz / Ankara',
    platform: 'WhatsApp',
    platformColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30',
    stars: 5,
    text: 'Sitemiz açıldıktan sonra Google Haritalar üzerinden gelen müşteri sayımız neredeyse üç katına çıktı. Hem hız hem de tasarım olarak çok memnun kaldık, elinize sağlık.',
    service: 'Google Maps & Kurumsal Web Sitesi'
  },
  {
    id: 2,
    name: 'Elif S.',
    role: 'RN Vize Danışmanlık — Çankaya / Ankara',
    platform: 'Instagram',
    platformColor: 'text-purple-400 bg-purple-950/80 border-purple-500/30',
    stars: 5,
    text: 'Vize başvuru formlarımız ve WhatsApp yönlendirmelerimiz kusursuz çalışıyor. Reklamlardan gelen dönüşüm oranı beklentimizin çok üzerinde gerçekleşti.',
    service: 'Landing Page & Meta Reklam Yönetimi'
  },
  {
    id: 3,
    name: 'Dt. Hakan S.',
    role: 'Özel Diş Kliniği — Kızılay / Ankara',
    platform: 'Google Maps',
    platformColor: 'text-sky-400 bg-sky-950/80 border-sky-500/30',
    stars: 5,
    text: 'Kliniğimiz için hazırladıkları web sitesi hem hastalarımızdan çok olumlu geri dönüş aldı hem de randevu taleplerimizi çok düzenli hale getirdi.',
    service: 'Web Sitesi Tasarımı & SEO'
  },
  {
    id: 4,
    name: 'Caner B.',
    role: 'Chef Burger & Fries — Bahçelievler / Ankara',
    platform: 'WhatsApp',
    platformColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30',
    stars: 5,
    text: 'Yemeksepeti ve Trendyol Yemek menülerimiz, ürün fotoğraflarımız ve kampanya ayarlarımız sayesinde ilk ay siparişlerimizde %45 artış yakaladık.',
    service: 'Yemeksepeti & Trendyol Kurulumu'
  },
  {
    id: 5,
    name: 'Av. Selin T.',
    role: 'Turan Hukuk Bürosu — Söğütözü / Ankara',
    platform: 'Google Maps',
    platformColor: 'text-sky-400 bg-sky-950/80 border-sky-500/30',
    stars: 5,
    text: 'Kurumsal kimliğimize tam oturan prestijli bir tasarım oldu. Hız ve mobil uyumluluk mükemmel seviyede.',
    service: 'Kurumsal Web Sitesi & SEO'
  },
  {
    id: 6,
    name: 'Burak Y.',
    role: 'Apex Mimarlık & Tasarım — Tunalı / Ankara',
    platform: 'Instagram',
    platformColor: 'text-purple-400 bg-purple-950/80 border-purple-500/30',
    stars: 5,
    text: 'Portfolyo sitemizi baştan sona yenilediler. Yeni projelerimiz için aldığımız müşteri dönüşleri inanılmaz arttı.',
    service: 'Web Sitesi Yenileme & Portfolyo'
  }
];

// Tripled review list for a seamless, endless downward river stream
const riverReviews = [
  ...customerReviewsList,
  ...customerReviewsList,
  ...customerReviewsList
];

export const ReviewsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const oneThirdHeightRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-reviews-modal', handleOpen);
    return () => window.removeEventListener('open-reviews-modal', handleOpen);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.dataset.modalOpen = 'true';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      delete document.body.dataset.modalOpen;
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      delete document.body.dataset.modalOpen;
    };
  }, [isOpen]);

  // Continuous Downward River Stream (Hardware accelerated requestAnimationFrame loop)
  useEffect(() => {
    if (!isOpen) return;

    const track = trackRef.current;
    if (!track) return;

    let rafId: number;
    let lastTime = performance.now();

    const measureHeight = () => {
      if (track) {
        const height = track.scrollHeight / 3;
        oneThirdHeightRef.current = height;
        if (height > 0 && offsetRef.current === 0) {
          offsetRef.current = -height;
          track.style.transform = `translate3d(0, ${offsetRef.current}px, 0)`;
        }
      }
    };

    measureHeight();
    const timer = setTimeout(measureHeight, 60);

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const oneThird = oneThirdHeightRef.current || (track ? track.scrollHeight / 3 : 0);
      if (oneThird > 0) {
        // Active downward river flow speed (~46px per second)
        offsetRef.current += 46 * dt;

        // Loop seamlessly
        if (offsetRef.current >= 0) {
          offsetRef.current -= oneThird;
        } else if (offsetRef.current < -oneThird * 2) {
          offsetRef.current += oneThird;
        }

        if (track) {
          track.style.transform = `translate3d(0, ${offsetRef.current}px, 0)`;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [isOpen]);

  // Interactive mouse wheel scrolling inside the river
  const handleRiverWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const oneThird = oneThirdHeightRef.current || track.scrollHeight / 3;
    if (oneThird <= 0) return;

    // Scrolling down pulls content up; scrolling up pushes content down
    offsetRef.current -= e.deltaY * 0.75;
    while (offsetRef.current >= 0) offsetRef.current -= oneThird;
    while (offsetRef.current < -oneThird * 2) offsetRef.current += oneThird;
    track.style.transform = `translate3d(0, ${offsetRef.current}px, 0)`;
  }, []);

  // Mobile touch scrolling inside the river
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartYRef.current !== null && e.touches.length > 0) {
      const delta = e.touches[0].clientY - touchStartYRef.current;
      touchStartYRef.current = e.touches[0].clientY;
      const track = trackRef.current;
      if (!track) return;
      const oneThird = oneThirdHeightRef.current || track.scrollHeight / 3;
      if (oneThird <= 0) return;

      offsetRef.current += delta;
      while (offsetRef.current >= 0) offsetRef.current -= oneThird;
      while (offsetRef.current < -oneThird * 2) offsetRef.current += oneThird;
      track.style.transform = `translate3d(0, ${offsetRef.current}px, 0)`;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartYRef.current = null;
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Header Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-base font-bold text-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
        aria-label="Müşteri Yorumlarını Aç"
      >
        <span>Yorumlar</span>
        <span className="flex items-center text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-300/80 px-1.5 py-0.5 rounded-md shadow-xs">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
          5.0
        </span>
      </button>

      {/* Modal / Slide-over Drawer */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 reviews-modal-container"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Box */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reviews-title"
              className="relative z-10 w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100 animate-in zoom-in-95 duration-200"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-sky-400 bg-sky-950 px-3 py-1 rounded-full border border-sky-800/50">
                      MÜŞTERİ MEMNUNİYETİ
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2.5 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      5.0 / 5.0 Onaylı
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Nehir Akışı
                    </span>
                  </div>
                  <h2 id="reviews-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Gerçek Müşteri Geri Dönüşleri
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reviews Continuous River Stream */}
              <div
                ref={containerRef}
                onWheel={handleRiverWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative flex-1 min-h-[420px] max-h-[60vh] overflow-hidden bg-slate-950/90 select-none"
              >
                {/* Top Soft Vignette Mask */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-slate-950 via-slate-950/90 to-transparent pointer-events-none z-10" />

                {/* Auto-flowing Downward River Track */}
                <div
                  ref={trackRef}
                  className="river-marquee-track flex flex-col gap-4 px-6 py-4 will-change-transform"
                  style={{ transform: 'translate3d(0, 0, 0)' }}
                >
                  {riverReviews.map((review, idx) => (
                    <article
                      key={`${review.id}-${idx}`}
                      className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-sky-500/40 p-5 rounded-2xl transition-all space-y-3 shadow-lg shadow-black/40 shrink-0 cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-400">
                            {[...Array(review.stars)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-300">• {review.service}</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${review.platformColor}`}>
                          {review.platform} Doğrulandı
                        </span>
                      </div>

                      <blockquote className="text-sm sm:text-base text-slate-200 italic font-medium leading-relaxed">
                        “{review.text}”
                      </blockquote>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <div>
                          <div className="text-xs font-black text-white">{review.name}</div>
                          <div className="text-[11px] text-slate-400">{review.role}</div>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aktif Müşteri
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Bottom Soft Vignette Mask */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none z-10" />
              </div>

              {/* Modal Footer CTA */}
              <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <p className="text-xs text-slate-400 text-center sm:text-left">
                  Siz de dijitalde büyüyen mutlu müşterilerimizin arasına katılın.
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/${brandConfig.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial btn-secondary text-xs py-2.5 px-4"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    WhatsApp
                  </a>
                  <a
                    href="/iletisim/"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 sm:flex-initial btn-cta text-xs py-2.5 px-4"
                  >
                    Teklif Alın <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ReviewsModal;
