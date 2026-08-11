export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormDataPayload {
  name: string;
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

  // 2. Hizmet Seçimi Kontrolü
  if (!data.service || data.service === '') {
    errors.service = 'Lütfen ilgilendiğiniz bir hizmet seçiniz.';
  }

  // 3. Proje Açıklaması Kontrolü
  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Lütfen projeniz hakkında en az 10 karakterlik bilgi veriniz.';
  } else if (data.message.length > 1000) {
    errors.message = 'Proje açıklaması en fazla 1000 karakter olabilir.';
  }

  // 4. KVKK Aydınlatma Metni Okuma Onayı Kontrolü
  if (!data.consent) {
    errors.consent = 'Lütfen Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni’ni okuduğunuzu onaylayınız.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
