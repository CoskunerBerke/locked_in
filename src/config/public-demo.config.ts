/**
 * ARAC DEGERLEME — SINIRLI PUBLIC DEMO YAPILANDIRMASI
 *
 * Bu dosya, public demoda hangi araclarin fiyatlanabilecegini belirleyen TEK
 * kaynaktir. Kilit kontrolu bilesenlerin icine dagitilmaz; dagitilirsa bir
 * gun biri unutulur ve kapali olmasi gereken bir arac fiyat uretir.
 *
 * ONEMLI: bu liste yalnizca URETIM ZAMANINDA islevseldir. Public veri setini
 * ureten script (`scripts/build-public-vehicle-demo.mjs`) yalnizca burada
 * izin verilen dallarin fiyat verisini tarayiciya gonderir. Kilitli araclarin
 * fiyat verisi artefakta HIC GIRMEZ — yani kilit, arayuzde degil VERIDE
 * uygulanir. Kullanici DevTools'u acsa bile gormedigi veriyi cikaramaz.
 */

/** `marka/model` dugum kimlikleri — kaynak hiyerarsinin kendi kimlikleri. */
export interface PublicDemoBranch {
  /** Kaynak hiyerarsideki model dugumu kimligi ("opel/corsa"). */
  id: string;
  /** Neden bu arac secildi — rapor ve gelecekteki degisiklikler icin. */
  reason: string;
}

/**
 * ACIK ARACLAR — KANITA GORE SECILDI, RASTGELE DEGIL.
 *
 * Kabul edilmis veri seti su olculere gore tarandi: dogrudan emsal sayisi,
 * motorun guven skoru, manuel degerlendirme orani ve dalin fiyatlanabilen
 * yaprak yuzdesi. Yuksek puanli, Turkiye'de taninan araclar secildi ki demo
 * hem guclu gorunsun hem de bos ekran vermesin.
 */
export const PUBLIC_DEMO_BRANCHES: PublicDemoBranch[] = [
  {
    id: 'opel/corsa',
    reason:
      'Zorunlu kabul senaryosu (1.5 TD ECO 2000). 71 yaprak, %99 fiyatli, ortalama 40 dogrudan emsal.',
  },
  {
    id: 'opel/astra',
    reason:
      'Opel in en genis dali: 152 yaprak, ortalama 40 dogrudan emsal, guven 85.',
  },
  {
    id: 'audi/a3',
    reason:
      'Kabul testlerinin referans araci (Advanced / Sport Line / Design Line). 123 yaprak, %95 fiyatli.',
  },
  {
    id: 'audi/a5',
    reason: '%98 fiyatli, manuel degerlendirme %0, guven 84 — temiz premium ornek.',
  },
  {
    id: 'fiat/egea',
    reason:
      'Veri kalitesinde en yuksek skorlu kitle araci: 50 yaprak, %100 fiyatli, ortalama 71 dogrudan emsal, manuel %0.',
  },
  {
    id: 'fiat/linea',
    reason: '%100 fiyatli, ortalama 48 dogrudan emsal, tek bir yilda 710 emsale kadar cikiyor.',
  },
  {
    id: 'ford/focus',
    reason: '75 yaprak, %99 fiyatli, ortalama 55 dogrudan emsal — genis ve derin dal.',
  },
  {
    id: 'ford/fiesta',
    reason:
      'Taninirligi yuksek; %19 manuel degerlendirme orani urunun "emin degilsem soylerim" davranisini gosteriyor.',
  },
  {
    id: 'hyundai/i20',
    reason: '%100 fiyatli, ortalama 53 dogrudan emsal, manuel %1, guven 87.',
  },
  {
    id: 'hyundai/accent-blue',
    reason: '%100 fiyatli, ortalama 46 dogrudan emsal — ikinci el pazarinda cok aranan model.',
  },
  {
    id: 'renault/fluence',
    reason: '%100 fiyatli, ortalama 64 dogrudan emsal, manuel %0 — en temiz dallardan biri.',
  },
  {
    id: 'renault/symbol',
    reason: '%100 fiyatli, ortalama 40 dogrudan emsal, 31 yaprak.',
  },
];

/** Hizli kontrol icin kume; uretici ve testler ayni kumeyi kullanir. */
export const PUBLIC_DEMO_BRANCH_IDS: ReadonlySet<string> = new Set(
  PUBLIC_DEMO_BRANCHES.map((b) => b.id),
);

/** Acik dallarin ait oldugu markalar ("opel", "audi", ...). */
export const PUBLIC_DEMO_BRAND_IDS: ReadonlySet<string> = new Set(
  PUBLIC_DEMO_BRANCHES.map((b) => b.id.split('/')[0]),
);

/**
 * TAM SISTEM KATALOGU — olculen degerler, iddia degil.
 *
 * Kabul edilmis surumde katalog 97 marka / 722 model / 7.092 arac donanimi
 * icerir. Bunlarin 6.288'inde guncel fiyat kaniti vardir; geri kalaninda
 * kaynakta ilan bulunmadigi icin fiyat URETILMEZ. Bu ayrim musteriye
 * oldugu gibi anlatilir: "hepsinde her zaman fiyat var" denmez.
 */
export const FULL_CATALOG_FACTS = {
  brands: 97,
  models: 722,
  trims: 7092,
  pricedTrims: 6288,
} as const;
