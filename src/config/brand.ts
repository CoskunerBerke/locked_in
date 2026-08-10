export interface BrandConfig {
  brandName: string;
  shortName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  instagramUrl: string;
  address: string;
  serviceArea: string;
  siteUrl: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  legalCompanyName: string;
  indexingEnabled: boolean;
}

export const brandConfig: BrandConfig = {
  brandName: 'MARKA ADI',
  shortName: 'MARKA',
  tagline: 'Dijitalde görünür, işinizde güçlü olun.',
  description:
    'Web ve mobil ürünlerden SEO, Google Maps, sosyal medya reklamları ve yemek platformu yönetimine kadar işletmenizin dijital büyümesini tek merkezden yönetiyoruz.',
  phone: '+90 (850) 000 00 00 (Geçici Numara)',
  whatsappNumber: '905000000000',
  email: 'iletisim@ornek-domain.com (Geçici E-posta)',
  instagramUrl: 'https://instagram.com/marka_adi_gecici',
  address: 'Çankaya / Ankara (Geçici Adres)',
  serviceArea: 'Ankara ve Türkiye geneli',
  siteUrl: process.env.PUBLIC_SITE_URL || 'https://example.com',
  logoPath: '/brand/logo.svg',
  primaryColor: '#0F172A',
  secondaryColor: '#0284C7',
  accentColor: '#4F46E5',
  legalCompanyName: 'MARKA ADI DİJİTAL HİZMETLER LTD. ŞTİ.',
  indexingEnabled:
    process.env.PUBLIC_INDEXING_ENABLED === 'true' ? true : false,
};

export default brandConfig;
