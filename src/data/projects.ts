export interface Project {
  id: string;
  title: string;
  client: string;
  industry: string;
  image: string;
  services: string[];
  description: string;
  liveUrl: string;
  date: string;
}

export const projectsData: Project[] = [
  {
    id: 'rnvize',
    title: 'RN Vize Danışmanlık',
    client: 'RN Vize Global',
    industry: 'Vize & Danışmanlık Hizmetleri',
    image: '/images/projects/rnvize.jpg',
    services: ['Web Tasarımı', 'SEO Optimizasyonu', 'Kurumsal Altyapı'],
    description: 'Dünya genelinde vize başvuru süreçlerini kolaylaştıran, hızlı online başvuru ve randevu sistemi sunan vize danışmanlık platformu.',
    liveUrl: 'https://rnvize.com/',
    date: '2025',
  },
  {
    id: 'rnyazilim',
    title: 'RN Yazılım Dijital Sistemler',
    client: 'RN Yazılım',
    industry: 'Kurumsal Yazılım & Dijital Çözümler',
    image: '/images/projects/rnyazilim.jpg',
    services: ['Web Geliştirme', 'Özel Yazılım', 'UI/UX Tasarımı'],
    description: 'İşletmeler için özel yazılım sistemleri, kurumsal web altyapıları ve performans odaklı dijital çözümler sunan ajans platformu.',
    liveUrl: 'http://rnyazilim.com/',
    date: '2025',
  },
  {
    id: 'quattrogaraj',
    title: 'Quattro Garaj Otomotiv',
    client: 'Quattro Garaj',
    industry: 'Otomotiv & Özel Garaj Hizmetleri',
    image: '/images/projects/quattrogaraj.jpg',
    services: ['Web Tasarımı', 'Yerel SEO', 'Mobil Uyumlu Katalog'],
    description: 'Lüks ve performans araçlarına özel servis, performans geliştirme ve bakım hizmetleri sunan modern otomotiv web platformu.',
    liveUrl: 'https://www.quattrogaraj.com/',
    date: '2025',
  },
  {
    id: 'dthakansaylam',
    title: 'Dt. Hakan Saylam Kliniği',
    client: 'Dt. Hakan Saylam',
    industry: 'Sağlık & Diş Hekimliği',
    image: '/images/projects/dthakansaylam.jpg',
    services: ['Sağlık Web Tasarımı', 'Hasta Randevu Sistemi', 'Mobil Uyum'],
    description: 'Ağız ve diş sağlığı alanında estetik gülüş tasarımı, tedavi rehberleri ve hasta bilgilendirme altyapısı sunan profesyonel sağlık platformu.',
    liveUrl: 'https://dthakansaylam.com/',
    date: '2025',
  },
];

export default projectsData;
