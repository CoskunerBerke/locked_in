import brandConfig from '../config/brand';

export interface WhatsAppFormPayload {
  name: string;
  service: string;
  message: string;
}

/**
 * Escapes special characters and strips HTML tags from user text to prevent XSS / malicious injection.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[&<>"']/g, (match) => {
      const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return escapeMap[match] || match;
    })
    .trim();
}

/**
 * Generates a clean, URL-encoded WhatsApp link from sanitized user form payload.
 */
export function generateWhatsAppUrl(payload: WhatsAppFormPayload): string {
  const cleanName = sanitizeInput(payload.name);
  const cleanService = sanitizeInput(payload.service);
  const cleanMessage = sanitizeInput(payload.message);

  const formattedText =
    `Merhabalar, adım ${cleanName}, ${cleanService} için bilgi almak istiyorum.\n\n` +
    `Proje Notum:\n${cleanMessage}`;

  const encodedText = encodeURIComponent(formattedText);
  const targetNumber = brandConfig.whatsappNumber.replace(/[^0-9]/g, '');

  return `https://wa.me/${targetNumber}?text=${encodedText}`;
}
