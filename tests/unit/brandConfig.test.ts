import { describe, it, expect } from 'vitest';
import brandConfig from '../../src/config/brand';

describe('Brand Configuration Unit Tests', () => {
  it('should contain all required brand fields', () => {
    expect(brandConfig.brandName).toBe('Rent Yazılım');
    expect(brandConfig.tagline).toBe('Dijitalde görünür, işinizde güçlü olun.');
    expect(brandConfig.serviceArea).toBe('Ankara ve Türkiye geneli');
    expect(brandConfig.logoPath).toBe('/brand/logo.png');
    expect(brandConfig.legalCompanyName).toBe('RENT YAZILIM DİJİTAL HİZMETLER LTD. ŞTİ.');
  });

  it('should default indexing to true for production indexing readiness', () => {
    expect(brandConfig.indexingEnabled).toBe(true);
  });

  it('should have valid placeholder contact data', () => {
    expect(brandConfig.phone).toBeDefined();
    expect(brandConfig.whatsappNumber).toBe('905350379074');
    expect(brandConfig.email).toContain('@');
  });
});
