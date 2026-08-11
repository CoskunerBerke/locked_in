export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormDataPayload {
  name: string;
  phone: string;
  service: string;
  message: string;
  consent: boolean;
  marketingConsent?: boolean;
}

export function validateForm(data: FormDataPayload): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Adınız ve Soyadınız Kontrolü
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Lütfen geçerli bir ad ve soyad giriniz.';
  } else if (data.name.length > 100) {
    errors.name = 'Ad alanı en fazla 100 karakter olabilir.';
  }

  // 2. Telefon Numarası Kontrolü
  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Lütfen geçerli bir telefon numarası giriniz.';
  } else {
    const cleanPhone = data.phone.replace(/[\s()+-]/g, '');
    const phoneRegex = /^(?:90|0)?[5][0-9]{9}$/;
    if (cleanPhone.length < 10 || cleanPhone.length > 13 || (!phoneRegex.test(cleanPhone) && !/^[0-9]{10,13}$/.test(cleanPhone))) {
      errors.phone = 'Lütfen geçerli bir cep telefonu numarası giriniz (Örn: 0535 037 90 74).';
    }
  }

  // 3. Hizmet Seçimi Kontrolü
  if (!data.service || data.service === '') {
    errors.service = 'Lütfen ilgilendiğiniz bir hizmet seçiniz.';
  }

  // 4. Proje Açıklaması Kontrolü
  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Lütfen projeniz hakkında en az 10 karakterlik bilgi veriniz.';
  } else if (data.message.length > 1000) {
    errors.message = 'Proje açıklaması en fazla 1000 karakter olabilir.';
  }

  // 5. KVKK Aydınlatma Metni Okuma Onayı Kontrolü
  if (!data.consent) {
    errors.consent = 'Lütfen Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni’ni okuduğunuzu onaylayınız.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
