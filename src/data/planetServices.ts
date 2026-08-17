export interface PlanetServiceStage {
  id: 'earth' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
  sequence: number; // 1 to 8
  planetName: string;
  serviceName: string;
  category: string;
  description: string;
  benefits: string[];
  href: string;
  ctaLabel: string;
  accentColor: string;
  texture: string;
  fallbackImage: string;
  ariaLabel: string;
}

export const planetServicesData: PlanetServiceStage[] = [
  {
    id: 'earth',
    sequence: 1,
    planetName: 'Dünya',
    serviceName: 'Web Tasarım ve Kurumsal Web Sitesi',
    category: 'Web Çözümleri',
    description: 'Müşterilerinizin telefondan ve bilgisayardan kolayca ulaşabileceği hızlı, şık ve güvenli web siteleri.',
    benefits: [
      'Telefon ve bilgisayarda hızlı açılan modern tasarım',
      'Google aramaları için SEO uyumlu içerik ve teknik altyapı',
      'Güvenlik odaklı, güncel ve sürdürülebilir statik altyapı',
      'Arama, WhatsApp, sipariş ve teklif alma aksiyonları',
    ],
    href: '/hizmetler/web-sitesi-tasarimi/',
    ctaLabel: 'Web Tasarım Hizmetini İncele',
    accentColor: '#3B82F6',
    texture: '/images/planets/earth.jpg',
    fallbackImage: '/images/planets/earth.jpg',
    ariaLabel: 'Dünya - Web Tasarım ve Kurumsal Web Sitesi Hizmeti',
  },
  {
    id: 'mercury',
    sequence: 2,
    planetName: 'Merkür',
    serviceName: 'Landing Page Tasarımı',
    category: 'Dönüşüm Çözümleri',
    description: 'Reklam kampanyalarınızdan en yüksek müşteri dönüşümünü elde eden özel açılış sayfaları.',
    benefits: [
      'Doğrudan satış ve teklif odaklı yüksek dönüşüm mimarisi',
      'Hızlı yüklenen, mobil uyumlu ve dikkat çekici görsel kurgu',
      'A/B testlerine ve reklam piksellerine uygun altyapı',
      'WhatsApp, arama ve form butonları ile anında etkileşim',
    ],
    href: '/hizmetler/web-sitesi-tasarimi/',
    ctaLabel: 'Landing Page Hizmetini İncele',
    accentColor: '#9CA3AF',
    texture: 'procedural-mercury',
    fallbackImage: '/images/planets/venus.jpg',
    ariaLabel: 'Merkür - Landing Page Tasarımı Hizmeti',
  },
  {
    id: 'venus',
    sequence: 3,
    planetName: 'Venüs',
    serviceName: 'Web Sitesi Yenileme',
    category: 'Yenileme & Modernizasyon',
    description: 'Eski, yavaş veya mobil uyumu olmayan web sitenizi modern standartlara taşıyoruz.',
    benefits: [
      'Eski kod yapısını güncel ve hızlı teknolojilerle değiştirme',
      'Mobil ve tablet ekranlarında kusursuz görünüm',
      'Arama motoru sıralamalarını koruyarak SEO iyileştirmesi',
      'Görsel tasarımın ve kullanıcı deneyiminin modernizasyonu',
    ],
    href: '/hizmetler/web-sitesi-tasarimi/',
    ctaLabel: 'Site Yenileme Hizmetini İncele',
    accentColor: '#EAB308',
    texture: '/images/planets/venus.jpg',
    fallbackImage: '/images/planets/venus.jpg',
    ariaLabel: 'Venüs - Web Sitesi Yenileme Hizmeti',
  },
  {
    id: 'mars',
    sequence: 4,
    planetName: 'Mars',
    serviceName: 'Google SEO ve Arama Görünürlüğü',
    category: 'Arama Görünürlüğü',
    description: 'İşletmenizi Google aramalarında ilk sıralara taşıyarak organik müşteriler kazanmanızı sağlıyoruz.',
    benefits: [
      'İşletmenizle ilgili aramalarda Google ilk sayfa hedefi',
      'Teknik SEO, site hızı ve Core Web Vitals optimizasyonu',
      'Şeffaf ve anlaşılır haftalık / aylık performans raporları',
      'Organik müşteri dönüşüm oranlarını artırma çalışmaları',
    ],
    href: '/hizmetler/seo/',
    ctaLabel: 'SEO Hizmetini İncele',
    accentColor: '#EF4444',
    texture: '/images/planets/mars.jpg',
    fallbackImage: '/images/planets/mars.jpg',
    ariaLabel: 'Mars - Google SEO ve Arama Görünürlüğü Hizmeti',
  },
  {
    id: 'jupiter',
    sequence: 5,
    planetName: 'Jüpiter',
    serviceName: 'Mobil Uygulama ve İşletme Yazılımı',
    category: 'Yazılım Çözümleri',
    description: 'İşletmenizi müşterilerinizin cebine taşıyan kullanımı kolay mobil uygulamalar ve yazılımlar.',
    benefits: [
      'iOS ve Android cihazlarda sorunsuz çalışan uygulama altyapısı',
      'İçeriklerinizi kolayca yönetebileceğiniz yönetim paneli',
      'App Store ve Google Play mağaza yükleme ve onay desteği',
      'Yayın sonrası kesintisiz teknik bakım ve destek',
    ],
    href: '/hizmetler/mobil-uygulama/',
    ctaLabel: 'Mobil Uygulama Hizmetini İncele',
    accentColor: '#F97316',
    texture: '/images/planets/jupiter.jpg',
    fallbackImage: '/images/planets/jupiter.jpg',
    ariaLabel: 'Jüpiter - Mobil Uygulama ve İşletme Yazılımı Hizmeti',
  },
  {
    id: 'saturn',
    sequence: 6,
    planetName: 'Satürn',
    serviceName: 'Google Maps ve Yerel SEO',
    category: 'Yerel Görünürlük',
    description: 'Müşterilerinizin haritalarda işletmenizi, adresinizi ve telefonunuzu anında bulmasını sağlayın.',
    benefits: [
      'Google İşletme Profilinizi resmi olarak açma ve doğrulama',
      'Adres, telefon, çalışma saatleri ve fotoğrafların yüklenmesi',
      'Haritada arama yapan yakın müşterilerin yol tarifi alması',
      'Müşteri yorumlarını düzenleme ve puan yükseltme rehberliği',
    ],
    href: '/hizmetler/google-maps/',
    ctaLabel: 'Google Maps Hizmetini İncele',
    accentColor: '#EAB308',
    texture: '/images/planets/saturn.jpg',
    fallbackImage: '/images/planets/saturn.jpg',
    ariaLabel: 'Satürn - Google Maps ve Yerel SEO Hizmeti',
  },
  {
    id: 'uranus',
    sequence: 7,
    planetName: 'Uranüs',
    serviceName: 'Yemeksepeti ve Trendyol Yemek Kurulumu',
    category: 'Restoran Danışmanlığı',
    description: 'Restoran ve kafeler için sipariş panellerini ve menülerini eksiksiz kurup yayına alıyoruz.',
    benefits: [
      'Yemeksepeti ve Trendyol Yemek başvuru ve onay rehberliği',
      'İştah açıcı görseller ve kategorilerle dijital menü hazırlama',
      'Menü fiyatlarını, indirimleri ve seçenekleri yükleme',
      'Panel kullanımı ve operasyonel süreç danışmanlığı',
    ],
    href: '/hizmetler/yemeksepeti-trendyol-yemek/',
    ctaLabel: 'Yemek Platformu Hizmetini İncele',
    accentColor: '#06B6D4',
    texture: 'procedural-uranus',
    fallbackImage: '/images/planets/neptune.jpg',
    ariaLabel: 'Uranüs - Yemeksepeti ve Trendyol Yemek Kurulumu Hizmeti',
  },
  {
    id: 'neptune',
    sequence: 8,
    planetName: 'Neptün',
    serviceName: 'Instagram ve Meta Reklam Yönetimi',
    category: 'Sosyal Medya Reklamı',
    description: 'Bütçenizi boşa harcamadan, doğrudan müşteriniz olacak kişilere ulaşan etkili reklamlar.',
    benefits: [
      'Potansiyel müşteri kitlesini belirleyip hassas hedefleme',
      'Dikkat çeken görsel, video ve reklam yazıları hazırlama',
      'Reklam bütçenizi en verimli şekilde kullanıp satış artırma',
      'Tıklama, arama ve dönüşüm verilerinin detaylı raporlanması',
    ],
    href: '/hizmetler/instagram-reklamlari/',
    ctaLabel: 'Instagram Reklam Hizmetini İncele',
    accentColor: '#3B82F6',
    texture: '/images/planets/neptune.jpg',
    fallbackImage: '/images/planets/neptune.jpg',
    ariaLabel: 'Neptün - Instagram ve Meta Reklam Yönetimi Hizmeti',
  },
];

export default planetServicesData;
