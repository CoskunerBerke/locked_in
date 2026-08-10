import { describe, it, expect } from 'vitest';
import { sanitizeInput, generateWhatsAppUrl } from '../../src/utils/whatsapp';

describe('WhatsApp Sanitization & URL Encoder Unit Tests', () => {
  it('should strip HTML tags and escape special characters', () => {
    const rawInput = '<script>alert("xss")</script> Test & Demo';
    const clean = sanitizeInput(rawInput);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Test &amp; Demo');
  });

  it('should generate valid WhatsApp URL with sanitized parameters', () => {
    const payload = {
      name: 'Ahmet Yılmaz',
      contact: '05550000000',
      service: 'Kurumsal Web Sitesi',
      message: 'Proje teklifi almak istiyorum.',
    };

    const url = generateWhatsAppUrl(payload);
    expect(url).toContain('https://wa.me/905000000000?text=');
    expect(url).toContain(encodeURIComponent('Ahmet Yılmaz'));
    expect(url).toContain(encodeURIComponent('Kurumsal Web Sitesi'));
  });
});
