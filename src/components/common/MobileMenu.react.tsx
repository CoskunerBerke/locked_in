import React, { useState, useEffect } from 'react';
import brandConfig from '../../config/brand';

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: 'Ana Sayfa', href: '/' },
  { name: 'Hizmetler', href: '/#hizmetler' },
  { name: 'Yemek Platformları', href: '/hizmetler/yemeksepeti-trendyol-yemek/' },
  { name: 'Süreç', href: '/#surec' },
  { name: 'Hakkımızda', href: '/#neden-biz' },
  { name: 'Sık Sorulan Sorular', href: '/#faq' },
];

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu Drawer */}
      <div
        id="mobile-menu-drawer"
        className={`fixed top-0 right-0 z-50 w-full max-w-sm h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Mobil Gezinme Menüsü"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <img src={brandConfig.logoPath} alt={brandConfig.brandName} className="h-8 w-auto" />
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
        <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block py-3 px-4 text-base font-semibold text-slate-800 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors min-h-[44px] flex items-center"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Drawer Footer CTA */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
          <a
            href="#teklif-formu"
            onClick={() => setIsOpen(false)}
            className="w-full btn-primary text-center justify-center py-3 min-h-[44px]"
          >
            Ücretsiz Ön Görüşme
          </a>
          <a
            href={`https://wa.me/${brandConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-secondary text-center justify-center py-3 min-h-[44px]"
          >
            WhatsApp Destek
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
