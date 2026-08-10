import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Code, Search, Utensils, Megaphone, ArrowRight } from 'lucide-react';

interface SubService {
  title: string;
  href: string;
  desc?: string;
}

interface Category {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SubService[];
}

const serviceCategories: Category[] = [
  {
    title: 'Web Çözümleri',
    icon: Globe,
    items: [
      { title: 'Kurumsal Web Sitesi', href: '/hizmetler/web-sitesi-tasarimi/' },
      { title: 'Landing Page Tasarımı', href: '/hizmetler/web-sitesi-tasarimi/' },
      { title: 'Web Sitesi Yenileme', href: '/hizmetler/web-sitesi-tasarimi/' },
      { title: 'Web Performans Optimizasyonu', href: '/hizmetler/web-sitesi-tasarimi/' },
      { title: 'Teknik Bakım ve Destek', href: '/hizmetler/web-sitesi-tasarimi/' },
    ],
  },
  {
    title: 'Yazılım',
    icon: Code,
    items: [
      { title: 'Mobil Uygulama', href: '/hizmetler/mobil-uygulama/' },
      { title: 'Özel Web Yazılım', href: '/hizmetler/mobil-uygulama/' },
      { title: 'İşletmeye Özel Dijital Çözümler', href: '/hizmetler/mobil-uygulama/' },
      { title: 'Entegrasyon Danışmanlığı', href: '/hizmetler/mobil-uygulama/' },
    ],
  },
  {
    title: 'Görünürlük & SEO',
    icon: Search,
    items: [
      { title: 'Teknik SEO', href: '/hizmetler/seo/' },
      { title: 'Site İçi SEO', href: '/hizmetler/seo/' },
      { title: 'Yerel SEO', href: '/hizmetler/seo/' },
      { title: 'Google Maps Optimizasyonu', href: '/hizmetler/google-maps/' },
      { title: 'Google Business Profile Yönetimi', href: '/hizmetler/google-maps/' },
    ],
  },
  {
    title: 'Yemek İşletmeleri',
    icon: Utensils,
    items: [
      { title: 'Yemeksepeti Panel Kurulumu', href: '/hizmetler/yemeksepeti-trendyol-yemek/' },
      { title: 'Trendyol Yemek Panel Kurulumu', href: '/hizmetler/yemeksepeti-trendyol-yemek/' },
      { title: 'Menü ve Kategori Düzenleme', href: '/hizmetler/yemeksepeti-trendyol-yemek/' },
      { title: 'Kampanya ve Çalışma Saati Yönetimi', href: '/hizmetler/yemeksepeti-trendyol-yemek/' },
      { title: 'Panel Kullanım Danışmanlığı', href: '/hizmetler/yemeksepeti-trendyol-yemek/' },
    ],
  },
  {
    title: 'Dijital Reklam',
    icon: Megaphone,
    items: [
      { title: 'Instagram Reklamları', href: '/hizmetler/instagram-reklamlari/' },
      { title: 'Meta Reklam Yönetimi', href: '/hizmetler/instagram-reklamlari/' },
      { title: 'Reklam Yayınlama', href: '/hizmetler/instagram-reklamlari/' },
      { title: 'Hedef Kitle ve Bütçe Planlama', href: '/hizmetler/instagram-reklamlari/' },
    ],
  },
];

export const MegaMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-800 hover:text-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md"
      >
        <span>Hizmetler</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-600' : 'text-slate-500'}`}
        />
      </button>

      {/* Mega Dropdown Panel */}
      {isOpen && (
        <div
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[90vw] max-w-6xl bg-white border border-slate-200 rounded-xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {serviceCategories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    <IconComp className="w-4 h-4 shrink-0 text-sky-500" />
                    <span>{cat.title}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {cat.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <a
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block text-xs font-medium text-slate-700 hover:text-sky-600 hover:bg-sky-50 px-2 py-1.5 rounded transition-colors"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner inside Mega Menu */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="font-bold text-slate-900">Özel bir projeye mi ihtiyacınız var?</span>
              <span className="hidden sm:inline text-slate-500">Ekibimizle doğrudan iletişime geçin.</span>
            </div>
            <a
              href="/iletisim/"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 font-bold text-sky-600 hover:text-sky-700 transition-colors"
            >
              <span>Tüm Hizmet Haritası ve İletişim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
