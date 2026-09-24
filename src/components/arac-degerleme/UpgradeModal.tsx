/**
 * TAM SURUM PANELI
 *
 * Kilitli bir arac secildiginde acilir. Bu bir HATA ekrani DEGILDIR: secilen
 * arac sistemde vardir, public demoya dahil degildir. Bu yuzden dil "veri
 * bulunamadi" degil "tam surumde kullanilabilir" seklindedir.
 *
 * Erisilebilirlik: Escape ile kapanir, odak panelin icinde tutulur, acilirken
 * odak ilk eyleme gider, kapanirken tetikleyen alana geri doner ve arkadaki
 * sayfa `aria-hidden` ile degil, odak tuzagi + kaydirma kilidiyle korunur.
 */
import { useEffect, useRef } from 'react';
import { Lock, MessageCircle, X } from 'lucide-react';

interface Props {
  open: boolean;
  /** Kilitli dugumun gorunen adi — "Mercedes-Benz" veya "Opel › Insignia". */
  vehicleLabel: string;
  /** Rent Yazilim'in MEVCUT WhatsApp baglantisi; burada yeni numara uretilmez. */
  contactHref: string;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function UpgradeModal({
  open,
  vehicleLabel,
  contactHref,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLAnchorElement>(null);
  /** Panel kapaninca odagin geri donecegi oge. */
  const returnFocusRef = useRef<Element | null>(null);

  /**
   * EN GUNCEL `onClose` BIR REF'TE TUTULUR.
   *
   * Ebeveyn her render'da yeni bir ok fonksiyonu verebilir. O fonksiyon
   * effect'in bagimliligi olsaydi effect her render'da sokulup takilirdi:
   * dinleyici kaldirilip yeniden eklenir, kaydirma kilidi acilip kapanir ve
   * `returnFocusRef` her seferinde o anki odakla (cogu zaman `document.body`)
   * EZILIRDI — yani panel kapaninca odak, paneli acan alana degil sayfanin
   * basina donerdi.
   *
   * Ref ile effect YALNIZCA `open` degisince calisir; dinleyici yine de hep en
   * guncel `onClose`'u cagirir.
   */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      // Odak paneli terk edemez: son ogeden Tab basa, ilk ogeden Shift+Tab
      // sona doner. Aksi halde klavye kullanicisi arkadaki forma dusuyordu.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    /**
     * ODAK DOGRUDAN TASINIR — `requestAnimationFrame` ILE DEGIL.
     *
     * Effect zaten DOM islendikten sonra calisir, yani `primaryRef` burada
     * doludur; bir kare beklemek hicbir sey kazandirmaz ama bir sey
     * kaybettirir: sayfa gorunur degilken (arka plandaki sekme, gizli panel)
     * tarayici rAF'i CALISTIRMAZ. Olculdu: panel aciliyor, kaydirma
     * kilitleniyor, Escape calisiyor — ama odak disarida kaliyordu.
     *
     * Odak baslik yerine ANA EYLEME gider: panelin amaci iletisim kurdurmak.
     */
    primaryRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      const target = returnFocusRef.current;
      if (target instanceof HTMLElement) target.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="rv-modal-backdrop fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rv-upgrade-title"
        aria-describedby="rv-upgrade-desc"
        className="rv-modal-panel relative w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <X size={18} aria-hidden />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <Lock size={20} aria-hidden />
        </div>

        <h2
          id="rv-upgrade-title"
          className="mt-4 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl"
        >
          Bu araç tam sürümde kullanılabilir
        </h2>

        {vehicleLabel && (
          <p className="mt-1.5 text-sm font-semibold text-sky-700">{vehicleLabel}</p>
        )}

        <p id="rv-upgrade-desc" className="mt-3 text-sm leading-relaxed text-slate-600">
          Public demo sınırlı bir araç kataloğu içerir. Tam sürüm; geniş araç
          kataloğu, işletmenize özel fiyatlandırma altyapısı ve entegrasyon
          seçenekleriyle sunulur.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <a
            ref={primaryRef}
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition-colors hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <MessageCircle size={16} aria-hidden />
            Tam Sürüm İçin İletişime Geç
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Demoya Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
