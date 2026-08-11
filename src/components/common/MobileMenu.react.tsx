import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import brandConfig from '../../config/brand';

interface SubItem {
  name: string;
  href: string;
}

interface ServiceGroup {
  category: string;
  items: SubItem[];
}

const serviceGroups: ServiceGroup[] = [
  {
    category: 'Web Çözümleri',
    items: [
      { name: 'Kurumsal Web Sitesi', href: '/hizmetler/web-sitesi-tasarimi/' },
      { name: 'Landing Page', href: '/hizmetler/web-sitesi-tasarimi/' },
      { name: 'Web Sitesi Yenileme', href: '/hizmetler/web-sitesi-tasarimi/' },
    ],
  },
  {
    category: 'Yazılım',
    items: [{ name: 'Mobil Uygulama & Özel Yazılım', href: '/hizmetler/mobil-uygulama/' }],
  },
  {
    category: 'Görünürlük & SEO',
    items: [
      { name: 'Teknik & Yerel SEO', href: '/hizmetler/seo/' },
      { name: 'Google Maps Optimizasyonu', href: '/hizmetler/google-maps/' },
    ],
  },
  {
    category: 'Yemek İşletmeleri',
    items: [{ name: 'Yemeksepeti & Trendyol Yemek', href: '/hizmetler/yemeksepeti-trendyol-yemek/' }],
  },
  {
    category: 'Reklam',
    items: [{ name: 'Instagram & Meta Reklamları', href: '/hizmetler/instagram-reklamlari/' }],
  },
];

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesAccordionOpen, setServicesAccordionOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Menu Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-3 rounded-lg text-slate-700 hover:text-sky-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 min-w-[44px] min-h-[44px]"
        aria-controls="mobile-menu-drawer"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
      >
        <span className="sr-only">{isOpen ? 'Menüyü kapat' : 'Menüyü aç'}</span>
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Render Backdrop & Drawer directly to document.body via Portal to prevent parent transform clipping */}
      {mounted &&
        createPortal(
          <div className={`md:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Drawer Backdrop Overlay */}
            <div
              className={`fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Full Height Menu Drawer */}
            <div
              id="mobile-menu-drawer"
              className={`fixed top-0 right-0 z-[9999] w-[85vw] max-w-xs sm:max-w-sm h-[100dvh] bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              aria-modal="true"
              role="dialog"
              aria-label="Mobil Gezinme Menüsü"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <img src={brandConfig.logoPath} alt={brandConfig.brandName} className="h-8 w-auto object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Menüyü kapat"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                <a
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 px-3 text-base font-semibold text-slate-800 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  Ana Sayfa
                </a>

                {/* Hizmetler Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setServicesAccordionOpen(!servicesAccordionOpen)}
                    className="w-full flex items-center justify-between py-2.5 px-3 text-base font-semibold text-slate-800 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    <span>Hizmetler</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        servicesAccordionOpen ? 'rotate-180 text-sky-600' : 'text-slate-500'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {servicesAccordionOpen && (
                    <div className="pl-4 pr-2 py-2 space-y-3 bg-slate-50 rounded-lg mt-1 border border-slate-100">
                      {serviceGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 block px-2 pt-1">
                            {group.category}
                          </span>
                          {group.items.map((sub, sIdx) => (
                            <a
                              key={sIdx}
                              href={sub.href}
                              onClick={() => setIsOpen(false)}
                              className="block text-xs font-medium text-slate-700 hover:text-sky-600 py-1.5 px-2 rounded hover:bg-white transition-colors"
                            >
                              {sub.name}
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <a
                  href="/projeler/"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 px-3 text-base font-semibold text-slate-800 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  Projeler
                </a>

                <a
                  href="/akademi/"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 px-3 text-base font-semibold text-slate-800 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  Akademi / Blog
                </a>

                <a
                  href="/hakkimizda/"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 px-3 text-base font-semibold text-slate-800 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  Kurumsal
                </a>

                <a
                  href="/iletisim/"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 px-3 text-base font-semibold text-slate-800 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  İletişim
                </a>
              </nav>

              {/* Drawer Footer CTAs */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-2.5">
                <a
                  href="/iletisim/"
                  onClick={() => setIsOpen(false)}
                  className="w-full btn-cta text-center justify-center py-2.5 min-h-[44px] text-sm"
                >
                  Ücretsiz Ön Görüşme
                </a>
                <a
                  href={`https://wa.me/${brandConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-secondary text-center justify-center py-2.5 min-h-[44px] text-sm"
                >
                  WhatsApp Danışma
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MobileMenu;
