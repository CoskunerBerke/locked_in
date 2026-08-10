import { describe, it, expect } from 'vitest';
import brandConfig from '../../src/config/brand';

describe('Brand Configuration Unit Tests', () => {
  it('should contain all required brand fields', () => {
    expect(brandConfig.brandName).toBe('MARKA ADI');
    expect(brandConfig.tagline).toBe('Dijitalde görünür, işinizde güçlü olun.');
    expect(brandConfig.serviceArea).toBe('Ankara ve Türkiye geneli');
    expect(brandConfig.logoPath).toBe('/brand/logo.svg');
    expect(brandConfig.legalCompanyName).toBe('MARKA ADI DİJİTAL HİZMETLER LTD. ŞTİ.');
  });

  it('should defaulted indexing to false for unverified brand info', () => {
    expect(brandConfig.indexingEnabled).toBe(false);
  });

  it('should have valid placeholder contact data', () => {
    expect(brandConfig.phone).toBeDefined();
    expect(brandConfig.whatsappNumber).toBe('905000000000');
    expect(brandConfig.email).toContain('@');
  });
});
