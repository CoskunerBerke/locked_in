import React, { useState } from 'react';
import { validateForm } from '../../utils/validators';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { MessageSquareText } from 'lucide-react';

export const WhatsAppForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    service: 'Kurumsal Web Sitesi Tasarımı',
    message: '',
    consent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Direct WhatsApp Message Dispatch to 0535 037 90 74
    const whatsappUrl = generateWhatsAppUrl(formData);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Teklif ve Ön Görüşme Formu">
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
          <option value="Kurumsal Web Sitesi Tasarımı">Kurumsal Web Sitesi Tasarımı</option>
          <option value="Landing Page Tasarımı">Landing Page Tasarımı</option>
          <option value="SEO ve Arama Görünürlüğü">SEO ve Arama Görünürlüğü</option>
          <option value="Mobil Uygulama Geliştirme">Mobil Uygulama Geliştirme</option>
          <option value="Yemeksepeti & Trendyol Yemek Yönetimi">Yemeksepeti &amp; Trendyol Yemek Yönetimi</option>
          <option value="Google Maps & Yerel SEO">Google Maps &amp; Yerel SEO</option>
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

      {/* Single Action Button: İletişime Geç */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 text-base rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 min-h-[48px] cursor-pointer"
        >
          <span>İletişime Geç</span>
          <MessageSquareText className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Gönder butonuna bastığınızda mesajınız doğrudan <strong>0535 037 90 74</strong> WhatsApp hattımıza iletilir.
      </p>
    </form>
  );
};

export default WhatsAppForm;
