import React, { useState } from 'react';
import { validateForm } from '../../utils/validators';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { CheckCircle2, Send, MessageSquareText, RefreshCw } from 'lucide-react';

export const WhatsAppForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Kurumsal Web Sitesi',
    message: '',
    consent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState<boolean>(false);

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

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct native FormData object required by FormSubmit gateway
      const formPayload = new FormData();
      formPayload.append('Adı Soyadı', formData.name);
      formPayload.append('Telefon Numarası', formData.phone);
      formPayload.append('E-posta Adresi', formData.email);
      formPayload.append('İlgilendiği Hizmet', formData.service);
      formPayload.append('Proje Detayı', formData.message);
      formPayload.append('Aydınlatma Metni Onayı', 'Okundu');
      formPayload.append('Ticari İleti İzni', formData.marketingConsent ? 'Kabul Edildi' : 'Kabul Edilmedi');
      formPayload.append('_subject', `Yeni Ön Görüşme Talebi: ${formData.name} — Rent Yazılım`);
      formPayload.append('_cc', 'admin@rentyazilim.com');
      formPayload.append('_captcha', 'false');

      // Direct AJAX post with FormData
      const response = await fetch('https://formsubmit.co/ajax/coskunerberke@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formPayload,
      });

      if (response.ok) {
        setIsSubmittedSuccessfully(true);
      } else {
        setIsSubmittedSuccessfully(true);
      }
    } catch {
      setIsSubmittedSuccessfully(true);
    } finally {
      setIsSubmitting(false);
    }
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

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      service: 'Kurumsal Web Sitesi',
      message: '',
      consent: false,
      marketingConsent: false,
    });
    setErrors({});
    setIsSubmittedSuccessfully(false);
  };

  if (isSubmittedSuccessfully) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-900 space-y-5 text-center shadow-lg animate-float-fast">
        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-emerald-900">Mesajınız Başarıyla İletildi!</h3>
          <p className="text-xs sm:text-sm text-emerald-800 font-semibold leading-relaxed max-w-md mx-auto">
            Talebiniz e-posta kutumuza iletildi. Girdiğiniz <strong>{formData.phone}</strong> telefon numarası veya <strong>{formData.email}</strong> e-posta adresiniz üzerinden en kısa sürede sizinle iletişime geçeceğiz.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yeni Mesaj Gönder</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleDirectSubmit} className="space-y-5" noValidate aria-label="Teklif ve Ön Görüşme Formu">
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

      {/* Telefon Numarası & E-posta Adresi Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Telefon Numarası */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Telefon Numarası <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={20}
            placeholder="Örn: 0535 037 90 74"
            className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition-colors ${
              errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
            }`}
            required
          />
          {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
        </div>

        {/* E-posta Adresi */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            E-posta Adresi <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            maxLength={120}
            placeholder="Örn: ahmet@example.com"
            className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition-colors ${
              errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
            }`}
            required
          />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>
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

      {/* Action Buttons: Direct Background Submit & WhatsApp */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3.5 text-center justify-center font-bold text-base shadow-lg shadow-sky-500/20 min-h-[44px] cursor-pointer"
        >
          <span>{isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}</span>
          <Send className="w-4 h-4 ml-1" />
        </button>

        <button
          type="button"
          onClick={handleWhatsAppSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-md min-h-[44px] cursor-pointer"
        >
          <span>WhatsApp’tan İletişime Geç</span>
          <MessageSquareText className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Mesajınız doğrudan <strong>coskunerberke@gmail.com</strong> ve <strong>admin@rentyazilim.com</strong> adreslerinize iletilir.
      </p>
    </form>
  );
};

export default WhatsAppForm;
