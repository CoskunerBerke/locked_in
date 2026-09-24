/**
 * URUN KAYDI — rentyazilim.com'a entegre edilen dis uygulamalar.
 *
 * Her uygulamanin kodu, backend'i ve ozel verisi KENDI deposunda yasar. Bu
 * dosya yalnizca sitedeki vitrin/demo katmaninin nerede oldugunu ve hangi
 * kaynak surumden turedigini kaydeder. Yeni bir uygulama eklerken once
 * `docs/ENTEGRASYON.md`, sonra buraya bir kayit.
 *
 * Bu dosyada YEREL YOL (C:/...) veya gizli bilgi bulunmaz: ileride bir
 * sayfa/ada bunu import ederse tarayiciya gidebilir.
 * `tests/unit/productRegistry.test.ts` her kaydi dosya sistemine karsi dogrular.
 */

export interface ProductIntegration {
  /** URL ve klasor adi: `/<slug>/`, `src/components/<slug>/`. */
  slug: string;
  name: string;
  route: string;
  /**
   * static-demo: temizlenmis statik veriyle tarayicida calisir.
   * api-client: uygulamanin KENDI backend'ine HTTPS ile baglanir (CSP'ye bak).
   * showcase: yalnizca tanitim sayfasi.
   */
  kind: 'static-demo' | 'api-client' | 'showcase';
  /** Sitede sunulan surum. Tam urun her zaman kaynak depoda kalir. */
  edition: 'public-demo' | 'full';
  /** top-nav: Header + MobileMenu; projects: yalnizca Projeler'den; none: dogrudan link. */
  nav: 'top-nav' | 'projects' | 'none';
  /** Sitedeki dosyalar (repo kokune gore). */
  site: {
    page: string;
    components: string;
    /** `public/` altindaki statik veri dosyalari. */
    data: string[];
    exportScript?: string;
  };
  /** Kaynak uygulama ve bu entegrasyonun turedigi surum. */
  source: {
    app: string;
    repo: string;
    branch: string;
    revision: string;
    /** Statik veri icin: artefaktin `sourceFingerprint` alani. */
    dataFingerprint?: string;
  };
  cta: { label: string; channel: 'whatsapp' | 'contact-page' };
}

export const PRODUCTS: ProductIntegration[] = [
  {
    slug: 'arac-degerleme',
    name: 'Araç Değerleme',
    route: '/arac-degerleme/',
    kind: 'static-demo',
    edition: 'public-demo',
    nav: 'top-nav',
    site: {
      page: 'src/pages/arac-degerleme.astro',
      components: 'src/components/arac-degerleme/',
      data: ['data/public-vehicle-demo.json'],
      exportScript: 'scripts/build-public-vehicle-demo.mjs',
    },
    source: {
      app: 'NakitGaraj',
      repo: 'NakitGaraj-market-refresh',
      branch: 'feature/demo-ui-polish-v1',
      revision: '23c06c3',
      dataFingerprint: '8f0055f4b472',
    },
    cta: { label: 'Tam Sürüm İçin İletişime Geç', channel: 'whatsapp' },
  },
];
