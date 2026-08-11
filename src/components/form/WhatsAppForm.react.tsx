import React, { useState } from 'react';
import { validateForm } from '../../utils/validators';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

export const WhatsAppForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    service: 'Kurumsal Web Sitesi',
    message: '',
    consent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error on field edit
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // Direct Email Dispatch to admin@rentyazilim.com
    const subject = encodeURIComponent(`Yeni Ön Görüşme Talebi: ${formData.name} — Rent Yazılım`);
    const bodyText = 
      `Ad Soyad: ${formData.name}\n` +
      `İletişim (Tel/E-posta): ${formData.contact}\n` +
      `İlgilenilen Hizmet: ${formData.service}\n\n` +
      `Proje Notları:\n${formData.message}\n\n` +
      `----------------------------------------\n` +
      `Aydınlatma Metni Okundu: Evet\n` +
      `Ticari İleti İzni: ${formData.marketingConsent ? 'Kabul Edildi' : 'Kabul Edilmedi'}`;

    const mailtoUrl = `mailto:admin@rentyazilim.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
    setIsSubmitting(false);
  };

  const handleWhatsAppSubmit = () => {
    const validation = validateForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const whatsappUrl = generateWhatsAppUrl(formData);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-5" noValidate aria-label="Teklif ve Ön Görüşme Formu">
      {/* Ad & Soyad */}
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Adınız ve Soyadınız <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          maxLength={100}
          placeholder="Örn: Ahmet Yılmaz"
          className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition-colors ${
            errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
          }`}
          required
        />
        {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
      </div>

      {/* Telefon veya E-posta */}
      <div>
        <label htmlFor="contact" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Telefon Numarası veya E-posta <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="contact"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          maxLength={120}
          placeholder="Örn: 0535 037 9074 veya ahmet@example.com"
          className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition-colors ${
            errors.contact ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
          }`}
          required
        />
        {errors.contact && <p className="mt-1 text-xs text-rose-600">{errors.contact}</p>}
      </div>

      {/* İlgilenilen Hizmet */}
      <div>
        <label htmlFor="service" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          İlgilendiğiniz Hizmet <span className="text-rose-500">*</span>
        </label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
        >
          <option value="Kurumsal Web Sitesi">Kurumsal Web Sitesi Tasarımı</option>
          <option value="Landing Page Tasarımı">Landing Page Tasarımı</option>
          <option value="SEO ve Arama Görünürlüğü">SEO ve Arama Görünürlüğü</option>
          <option value="Mobil Uygulama">Mobil Uygulama Geliştirme</option>
          <option value="Yemeksepeti & Trendyol Yönetimi">Yemeksepeti &amp; Trendyol Yemek Yönetimi</option>
          <option value="Google Maps Optimizasyonu">Google Maps &amp; Yerel SEO</option>
          <option value="Instagram & Meta Reklamları">Instagram &amp; Meta Reklamları</option>
          <option value="Dijital Büyüme Danışmanlığı">Dijital Büyüme Danışmanlığı</option>
        </select>
      </div>

      {/* Proje Açıklaması */}
      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Projeniz Hakkında Kısa Bilgi <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          maxLength={1000}
          placeholder="İhtiyaçlarınızı ve hedeflerinizi kısaca yazabilirsiniz..."
          className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition-colors ${
            errors.message ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
          }`}
          required
        />
        {errors.message && <p className="mt-1 text-xs text-rose-600">{errors.message}</p>}
      </div>

      {/* KVKK Okuma Kutusu (Zorunlu) */}
      <div className="flex items-start gap-3 pt-1">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          checked={formData.consent}
          onChange={handleChange}
          className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
          required
        />
        <label htmlFor="consent" className="text-xs text-slate-600 leading-normal">
          <a
            href="/kvkk-aydinlatma-metni/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 underline hover:text-sky-700 font-semibold"
          >
            Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni
          </a>
          ’ni okudum.
        </label>
      </div>
      {errors.consent && <p className="text-xs text-rose-600">{errors.consent}</p>}

      {/* Ticari İleti Onay Kutusu (İsteğe Bağlı - Varsayılan İşaretlenmemiş) */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="marketingConsent"
          name="marketingConsent"
          checked={formData.marketingConsent}
          onChange={handleChange}
          className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
        />
        <label htmlFor="marketingConsent" className="text-xs text-slate-600 leading-normal">
          Kampanya ve hizmetler hakkında tarafıma ticari elektronik ileti gönderilmesini kabul ediyorum.
        </label>
      </div>

      {/* Bilgilendirme Notu */}
      <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
        Kişisel verilerinizin nasıl işlendiğini{' '}
        <a
          href="/kvkk-aydinlatma-metni/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 underline font-semibold hover:text-sky-700"
        >
          Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni
        </a>{' '}
        üzerinden inceleyebilirsiniz.
      </p>

      {/* Action Buttons: Direct Email Dispatch & WhatsApp */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3.5 text-center justify-center font-bold text-base shadow-lg shadow-sky-500/20 min-h-[44px]"
        >
          <span>E-posta İle Mesaj Gönder (admin@rentyazilim.com)</span>
          <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleWhatsAppSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-md min-h-[44px]"
        >
          <span>WhatsApp’tan Doğrudan Mesaj Başlat</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
          </svg>
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Gönder butonuna bastığınızda mesajınız doğrudan <strong>admin@rentyazilim.com</strong> e-posta adresimize iletilir.
      </p>
    </form>
  );
};

export default WhatsAppForm;
