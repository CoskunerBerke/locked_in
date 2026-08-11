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
  brandName: 'Rent Yazılım',
  shortName: 'rentyazilim',
  tagline: 'Dijitalde görünür, işinizde güçlü olun.',
  description:
    'Web ve mobil ürünlerden SEO, Google Maps, sosyal medya reklamları ve yemek platformu yönetimine kadar işletmenizin dijital büyümesini tek merkezden yönetiyoruz.',
  phone: '+90 (850) 000 00 00',
  whatsappNumber: '905000000000',
  email: 'iletisim@rentyazilim.com',
  instagramUrl: 'https://instagram.com/rentyazilim',
  address: 'Çankaya / Ankara',
  serviceArea: 'Ankara ve Türkiye geneli',
  siteUrl: process.env.PUBLIC_SITE_URL || 'https://rentyazilim.com',
  logoPath: '/brand/logo.svg',
  primaryColor: '#0F172A',
  secondaryColor: '#0284C7',
  accentColor: '#4F46E5',
  legalCompanyName: 'RENT YAZILIM DİJİTAL HİZMETLER LTD. ŞTİ.',
  indexingEnabled:
    process.env.PUBLIC_INDEXING_ENABLED === 'true' ? true : false,
};

export default brandConfig;
