/**
 * VERI SIZINTISI DENETIMI
 *
 * Public demonun kilidi arayuzde degil VERIDE uygulanir. Dolayisiyla sinanmasi
 * gereken sey bilesenin davranisi degil, TARAYICIYA GIDEN BAYTLARDIR.
 *
 * Bu test iki yuzeyi tarar:
 *   1) `public/` — kaynaktaki artefakt (her zaman calisir)
 *   2) `dist/`   — uretilmis cikti (varsa; FileZilla'ya gidecek olan tam olarak budur)
 *
 * `dist/` yoksa test ATLANMAZ: yalnizca kaynak yuzeyi denetlenir ve bu durum
 * acikca belirtilir. "Build almamistim" bir gecis gerekcesi degildir; ama
 * build alinmis bir agacta bu test kesin konusur.
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { PUBLIC_DEMO_BRANCH_IDS } from '../../src/config/public-demo.config';

const REPO = resolve(__dirname, '../..');
const PUBLIC_DIR = join(REPO, 'public');
const DIST_DIR = join(REPO, 'dist');

/** Kapali kalmasi gereken, adi bilinen dallar — sizinti icin kanarya. */
const RESTRICTED_BRANCHES = [
  'mercedes-benz',
  'bmw',
  'volkswagen',
  'toyota',
  'peugeot',
  'volvo',
  'porsche',
  'skoda',
];

/** Kapali dallara ait, kaynakta var oldugu bilinen havuz kimlikleri. */
const RESTRICTED_POOL_IDS = [
  'opel/insignia/1-6-cdti',
  'opel/vectra/1-6/1-6/comfort',
  'mercedes-benz/maybach-s/s-450',
  'peugeot/206/1-4',
  'toyota/corolla',
  'volkswagen/passat',
];

/** Tam veri setine ya da gelistirme ortamina ait olmamasi gereken izler. */
const FORBIDDEN_MARKERS = [
  'demo-market.json',
  'NakitGaraj',
  'nakitgaraj',
  'arac-degerleme-demo.vercel.app',
  'dev.db',
  'RawVehicleListing',
  'listing-assignments',
  'sahibindne ilan',
  'market-refresh',
  'C:\\\\dev\\\\NakitGaraj',
  'localhost:3100',
  '127.0.0.1',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** Metin olarak taranabilecek dosyalar; ikili varliklar atlanir. */
const TEXTUAL = /\.(html|js|mjs|cjs|css|json|txt|xml|map|svg)$/i;

function scan(root: string) {
  const files = walk(root).filter((f) => TEXTUAL.test(f));
  const findings: string[] = [];
  for (const file of files) {
    const rel = file.slice(root.length + 1).replace(/\\/g, '/');
    // Bu testin kendisi kanarya dizeleri icerir; kendini bulmasin.
    if (rel.includes('tests/')) continue;
    const text = readFileSync(file, 'utf8');
    for (const marker of FORBIDDEN_MARKERS) {
      if (text.includes(marker)) findings.push(`${rel}: "${marker}"`);
    }
    for (const id of RESTRICTED_POOL_IDS) {
      // Kilitli MODEL ADI gorunebilir (katalog genisligi icin); yasak olan
      // sey havuz KIMLIGIDIR, yani fiyat verisinin anahtari.
      if (text.includes(`"${id}"`)) findings.push(`${rel}: kisitli havuz kimligi "${id}"`);
    }
  }
  return { files, findings };
}

describe('E) kisitli fiyat verisi public yuzeyde yok', () => {
  it('kaynak public/ dizininde tam veri seti veya kisitli havuz yok', () => {
    const { findings } = scan(PUBLIC_DIR);
    expect(findings).toEqual([]);
  });

  it('public artefakt yalnizca izin verilen dallarin havuzlarini tasir', () => {
    const artifact = JSON.parse(
      readFileSync(join(PUBLIC_DIR, 'data/public-vehicle-demo.json'), 'utf8'),
    ) as { pools: Record<string, unknown>; catalog: Array<{ i: string; c?: unknown[]; k?: 1 }> };

    for (const id of Object.keys(artifact.pools)) {
      const brand = id.split('/')[0];
      const inAllowedBranch = [...PUBLIC_DEMO_BRANCH_IDS].some(
        (branch) => id === branch || id.startsWith(`${branch}/`),
      );
      expect(inAllowedBranch, `${id} (${brand}) izin verilen dalda degil`).toBe(true);
    }
  });

  it('kisitli markalar yalnizca AD olarak bulunur, alt agac tasimaz', () => {
    const artifact = JSON.parse(
      readFileSync(join(PUBLIC_DIR, 'data/public-vehicle-demo.json'), 'utf8'),
    ) as { catalog: Array<{ i: string; l: string; c?: unknown[]; k?: 1 }> };

    for (const brand of RESTRICTED_BRANCHES) {
      const node = artifact.catalog.find((b) => b.i === brand);
      expect(node, `${brand} katalogda hic yok — musteri katalog genisligini goremez`).toBeDefined();
      expect(node!.k, `${brand} kilitli isaretlenmemis`).toBe(1);
      expect(node!.c, `${brand} alt agac tasiyor`).toBeUndefined();
    }
  });

  it('dist/ uretilmisse orada da sizinti yok', () => {
    if (!existsSync(DIST_DIR)) {
      // Build alinmamis: kaynak yuzeyi yukarida denetlendi. Bunu sessizce
      // "gecti" saymamak icin acikca yaziyoruz.
      // eslint-disable-next-line no-console
      console.warn('[leak] dist/ yok; yalnizca public/ denetlendi. "npm run build" sonrasi tekrar calistirin.');
      return;
    }
    const { files, findings } = scan(DIST_DIR);
    expect(files.length, 'dist/ bos').toBeGreaterThan(0);
    expect(findings).toEqual([]);
  });

  it('dist/ icinde full demo-market.json dosyasi yok', () => {
    if (!existsSync(DIST_DIR)) return;
    const named = walk(DIST_DIR).filter((f) => /demo-market\.json$/i.test(f));
    expect(named).toEqual([]);
  });

  /**
   * FTP'YE GIDEN SEY `dist/` DEGIL, MINIMAL PAKETTIR.
   *
   * Canli site elle yuklendigi ve `main` tabanli bu depodan DAHA YENI oldugu
   * icin `dist/` bir butun olarak yuklenmez; yalnizca
   * `filezilla-arac-degerleme/` yuklenir. Denetim, gercekten yuklenecek olan
   * baytlari da gormeli — yoksa "dist temiz" demek yanlis guven verir.
   */
  it('minimal FileZilla paketi (yuklenecek baytlar) temiz', () => {
    const pkg = join(REPO, 'filezilla-arac-degerleme');
    if (!existsSync(pkg)) {
      // eslint-disable-next-line no-console
      console.warn(
        '[leak] filezilla-arac-degerleme/ yok; ' +
          '"node scripts/build-filezilla-package.mjs" sonrasi tekrar calistirin.',
      );
      return;
    }
    const { files, findings } = scan(pkg);
    expect(files.length, 'paket bos').toBeGreaterThan(0);
    expect(findings).toEqual([]);
    expect(walk(pkg).filter((f) => /demo-market\.json$/i.test(f))).toEqual([]);
    expect(walk(pkg).filter((f) => f.endsWith('.map'))).toEqual([]);
  });

  /**
   * Paket SADECE rotayi tasimali: baska bir sayfanin HTML'i girerse canlidaki
   * daha yeni surumunun uzerine yazar.
   */
  it('minimal paket baska hicbir sayfanin HTML dosyasini icermez', () => {
    const pkg = join(REPO, 'filezilla-arac-degerleme');
    if (!existsSync(pkg)) return;
    const html = walk(pkg)
      .filter((f) => f.endsWith('.html'))
      .map((f) => f.slice(pkg.length + 1).replace(/\\/g, '/'));
    expect(html).toEqual(['arac-degerleme/index.html']);
  });
});
