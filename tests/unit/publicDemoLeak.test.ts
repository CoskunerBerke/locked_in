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
  'vercel.app',
  'dev.db',
  'RawVehicleListing',
  'listing-assignments',
  'sahibinden',
  'market-refresh',
  'C:\\\\dev\\\\NakitGaraj',
  'C:/dev/',
  'localhost',
  '127.0.0.1',
  'sourceMappingURL',
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
const TEXTUAL = /(\.(html|js|mjs|cjs|css|json|txt|xml|map|svg|webmanifest)|[\\/](_headers|\.htaccess))$/i;

/**
 * Kabul edilmis tam veri seti (parite testiyle ayni kaynak). Varsa, KAPALI
 * dallarin TUM havuz kimlikleri ondan uretilir; yalnizca birkac kanaryaya
 * guvenilmez.
 */
const NAKITGARAJ =
  process.env.NAKITGARAJ_DATASET ||
  'C:/dev/NakitGaraj-market-refresh/frontend/public/demo-market.json';

/** Metindeki yol-benzeri parcalar ve '/' sinirindaki tum onekleri. */
function pathTokens(text: string): Set<string> {
  const out = new Set<string>();
  for (const match of text.toLowerCase().matchAll(/[a-z0-9][a-z0-9.-]*(?:\/[a-z0-9][a-z0-9.-]*)+/g)) {
    const parts = match[0].split('/');
    for (let i = 2; i <= parts.length; i++) out.add(parts.slice(0, i).join('/'));
  }
  return out;
}

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
      // sey havuz KIMLIGIDIR, yani fiyat verisinin anahtari. Tirnaksiz
      // aranir: alt havuzlar ("toyota/corolla/1-6/...") da yakalanir.
      if (text.includes(id)) findings.push(`${rel}: kisitli havuz kimligi "${id}"`);
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
   * Bu sitede FileZilla'ya `dist/` icinden secilen dosyalar gider; ayri bir
   * paket yoktur. Bu yuzden asagidaki kontroller dogrudan `dist/` uzerindedir.
   */
  it('dist/ icinde kaynak haritasi (.map) yok', () => {
    if (!existsSync(DIST_DIR)) return;
    expect(walk(DIST_DIR).filter((f) => f.endsWith('.map'))).toEqual([]);
  });

  it('dist/ icindeki tek fiyat verisi public artefaktin birebir kopyasi', () => {
    if (!existsSync(DIST_DIR)) return;
    // JSON'da `"pools":`, kucultulmus JS'te `pools:{` bicimi aranir; bir
    // paketin icine gomulmus veri seti de boylece yakalanir.
    const withPools = walk(DIST_DIR)
      .filter((f) => /\.(json|js|mjs|html)$/i.test(f))
      .filter((f) => /["']?pools["']?\s*:\s*\{/.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(DIST_DIR.length + 1).replace(/\\/g, '/'));
    expect(withPools).toEqual(['data/public-vehicle-demo.json']);
    expect(readFileSync(join(DIST_DIR, 'data/public-vehicle-demo.json'))).toEqual(
      readFileSync(join(PUBLIC_DIR, 'data/public-vehicle-demo.json')),
    );
  });

  it('kapali dallarin HICBIR havuz kimligi public/ veya dist/ icinde yok (tam kaynaga gore)', () => {
    if (!existsSync(NAKITGARAJ)) {
      console.warn(`[leak] ${NAKITGARAJ} yok; tam kimlik taramasi yapilamadi, yalnizca kanaryalar denetlendi.`);
      return;
    }
    const source = JSON.parse(readFileSync(NAKITGARAJ, 'utf8')) as { pools: Record<string, unknown> };
    const restricted = new Set(
      Object.keys(source.pools).filter(
        (id) => !PUBLIC_DEMO_BRANCH_IDS.has(id.split('/').slice(0, 2).join('/')),
      ),
    );
    expect(restricted.size, 'kaynakta kapali havuz bulunamadi').toBeGreaterThan(1000);

    const findings: string[] = [];
    for (const root of [PUBLIC_DIR, ...(existsSync(DIST_DIR) ? [DIST_DIR] : [])]) {
      for (const file of walk(root).filter((f) => TEXTUAL.test(f))) {
        const rel = file.slice(root.length + 1).replace(/\\/g, '/');
        for (const token of pathTokens(readFileSync(file, 'utf8'))) {
          if (restricted.has(token)) findings.push(`${rel}: "${token}"`);
        }
      }
    }
    expect(findings.slice(0, 10)).toEqual([]);
  });

  it('dist/arac-degerleme/index.html uretilmis ve public artefakti kullaniyor', () => {
    if (!existsSync(DIST_DIR)) return;
    const page = join(DIST_DIR, 'arac-degerleme/index.html');
    expect(existsSync(page), 'arac-degerleme sayfasi uretilmemis').toBe(true);
    expect(readFileSync(page, 'utf8')).toContain('/data/public-vehicle-demo.json');
  });
});
