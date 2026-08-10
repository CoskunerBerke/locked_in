export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateForm(data: {
  name: string;
  contact: string;
  service: string;
  message: string;
  consent: boolean;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Lütfen geçerli bir ad ve soyad giriniz.';
  } else if (data.name.length > 100) {
    errors.name = 'Ad alanı en fazla 100 karakter olabilir.';
  }

  if (!data.contact || data.contact.trim().length < 5) {
    errors.contact = 'Lütfen geçerli bir e-posta veya telefon numarası giriniz.';
  } else if (data.contact.length > 120) {
    errors.contact = 'İletişim bilgisi alanı çok uzun.';
  }

  if (!data.service || data.service === '') {
    errors.service = 'Lütfen ilgilendiğiniz bir hizmet seçiniz.';
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Lütfen projeniz hakkında en az 10 karakterlik bilgi veriniz.';
  } else if (data.message.length > 1000) {
    errors.message = 'Proje açıklaması en fazla 1000 karakter olabilir.';
  }

  if (!data.consent) {
    errors.consent = 'Lütfen KVKK ve Gizlilik Koşullarını onaylayınız.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
