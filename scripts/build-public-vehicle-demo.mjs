/**
 * PUBLIC DEMO VERI SETI URETICISI
 *
 * Kabul edilmis NakitGaraj veri setini SALT OKUNUR okur ve public siteye
 * gidecek TEMIZLENMIS artefakti uretir.
 *
 * NEDEN AYRI BIR ARTEFAKT: tam veri setini tarayiciya gonderip araclari CSS
 * veya React ile kilitlemek kilit DEGILDIR. Kullanici Network sekmesini veya
 * JS bundle'ini acip butun fiyat verisini disari cikarabilir. Bu yuzden kilit
 * VERIDE uygulanir: kapali bir aracin fiyat verisi artefakta HIC girmez.
 *
 * Kilitli araclar icin yalnizca GORUNUR AD tasinir — marka adi, gerekirse
 * model adi ve "locked" bayragi. FMV, havuz, gozlem, emsal ayrintisi, yil
 * fiyatlari: hicbiri cikmaz.
 *
 * URETIM ZAMANI BAGIMLILIGI: bu script yalnizca gelistirici makinesinde,
 * elle calistirilir. Uretilen JSON depoya islenir; `npm run build` NakitGaraj
 * deposuna ihtiyac duymaz ve `dist/` tek basina calisir.
 *
 * DETERMINISTIK: ayni kaynak + ayni allowlist = ayni bayt. `generatedAt`
 * calistirma aninin degil KAYNAGIN kendi uretim zamanidir; yoksa her calistirma
 * farkli bir dosya uretir ve "veri degisti mi?" sorusu cevapsiz kalir.
 *
 * Kullanim:
 *   npm run demo:vehicle-data
 *   NAKITGARAJ_DATASET=/yol/demo-market.json npm run demo:vehicle-data
 *   PUBLIC_DEMO_OUT=/gecici/cikti.json npm run demo:vehicle-data   (dogrulama; artefakta dokunmaz)
 *
 * Veri yenilendikten sonra `src/config/products.ts` icindeki kaynak revizyonu
 * ve parmak izi guncellenir; `productRegistry` testi bunu zorlar.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');

const SOURCE =
  process.env.NAKITGARAJ_DATASET ||
  'C:/dev/NakitGaraj-market-refresh/frontend/public/demo-market.json';
const OUT = process.env.PUBLIC_DEMO_OUT
  ? resolve(process.env.PUBLIC_DEMO_OUT)
  : resolve(REPO, 'public/data/public-vehicle-demo.json');
const CONFIG = resolve(REPO, 'src/config/public-demo.config.ts');

/**
 * Yapilandirmayi TS dosyasindan okur.
 *
 * Node, TypeScript'i dogrudan calistiramaz; ama bu dosyadaki tek ihtiyacimiz
 * dal kimlikleri. Ayri bir JSON kopyasi tutmak iki kaynak yaratir ve biri
 * otekinden sapar — bu yuzden kimlikler TS'in kendisinden okunur.
 */
function readAllowlist() {
  const text = readFileSync(CONFIG, 'utf8');
  const block = text.slice(
    text.indexOf('PUBLIC_DEMO_BRANCHES: PublicDemoBranch[] = ['),
    text.indexOf('];', text.indexOf('PUBLIC_DEMO_BRANCHES: PublicDemoBranch[] = [')),
  );
  const ids = [...block.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
  if (ids.length === 0) {
    throw new Error(`Allowlist bos okundu: ${CONFIG}`);
  }
  return new Set(ids);
}

/** Katalogu duz listeye acar; `chain` kokten dugume kadarki kimliklerdir. */
function flatten(wire, chain = [], labels = []) {
  const out = [];
  for (const entry of wire) {
    const [id, label, listings] = entry;
    const kids = entry[3] ?? [];
    const node = {
      id,
      label,
      listings,
      chain: [...chain, id],
      labels: [...labels, label],
      isLeaf: kids.length === 0,
    };
    out.push(node);
    if (kids.length > 0) out.push(...flatten(kids, node.chain, node.labels));
  }
  return out;
}

function main() {
  if (!existsSync(SOURCE)) {
    throw new Error(
      `Kaynak veri seti bulunamadi: ${SOURCE}\n` +
        'NAKITGARAJ_DATASET ortam degiskeniyle yolu verin.',
    );
  }
  const allowed = readAllowlist();
  const raw = readFileSync(SOURCE, 'utf8');
  const source = JSON.parse(raw);
  const sourceHash = createHash('sha256').update(raw).digest('hex').slice(0, 12);

  const nodes = flatten(source.catalog);
  const byId = new Map(nodes.map((n) => [n.id, n]));

  /** Dugum, izin verilen bir dalin ICINDE mi? (dalin kendisi veya altinda) */
  const isUnlocked = (node) =>
    node.chain.length >= 2 && allowed.has(node.chain[1]);

  // --- markalar: HEPSI gorunur, cogu kilitli
  const brands = nodes.filter((n) => n.chain.length === 1);
  const models = nodes.filter((n) => n.chain.length === 2);

  const catalog = [];
  let unlockedModels = 0;
  let unlockedLeaves = 0;
  let lockedModelStubs = 0;

  for (const brand of [...brands].sort((a, b) => a.label.localeCompare(b.label, 'tr'))) {
    const brandModels = models.filter((m) => m.chain[0] === brand.id);
    const openModels = brandModels.filter((m) => allowed.has(m.id));

    if (openModels.length === 0) {
      // Marka tamamen kilitli: SADECE adi tasinir. Model listesi bile
      // gonderilmez — gerekmiyor ve tasimamak her zaman daha guvenlidir.
      catalog.push({ i: brand.id, l: brand.label, k: 1 });
      continue;
    }

    const children = [];
    for (const model of [...brandModels].sort((a, b) => a.label.localeCompare(b.label, 'tr'))) {
      if (!allowed.has(model.id)) {
        // Acik markanin kapali modeli: adi gorunur ki musteri katalogun
        // genisligini gorsun, ama tek bir fiyat verisi tasinmaz.
        children.push({ i: model.id, l: model.label, k: 1 });
        lockedModelStubs += 1;
        continue;
      }
      unlockedModels += 1;
      children.push(buildUnlocked(model));
    }
    catalog.push({ i: brand.id, l: brand.label, c: children });
  }

  /** Acik dal: tum alt agaci ve yaprak kimlikleri tasinir. */
  function buildUnlocked(node) {
    const kids = nodes.filter(
      (n) => n.chain.length === node.chain.length + 1 && n.chain[node.chain.length - 1] === node.id,
    );
    if (kids.length === 0) {
      unlockedLeaves += 1;
      return { i: node.id, l: node.label, n: node.listings };
    }
    return {
      i: node.id,
      l: node.label,
      n: node.listings,
      c: kids
        .sort((a, b) => a.label.localeCompare(b.label, 'tr'))
        .map(buildUnlocked),
    };
  }

  // --- fiyat havuzlari: YALNIZCA izin verilen yapraklar
  const pools = {};
  let yearRows = 0;
  for (const [id, pool] of Object.entries(source.pools)) {
    const node = byId.get(id);
    if (!node || !isUnlocked(node)) continue;
    pools[id] = pool;
    yearRows += Object.keys(pool.years).length;
  }

  // --- seviye basliklari: yalnizca acik dallar
  const levels = {};
  for (const [branch, kinds] of Object.entries(source.levels ?? {})) {
    if (allowed.has(branch)) levels[branch] = kinds;
  }

  const payload = {
    version: 'public-vehicle-demo-v1',
    generatedAt: source.generatedAt ?? new Date().toISOString(),
    /**
     * Kaynagin PARMAK IZI — tam veri setinin kendisi degil. Public demonun
     * hangi kabul edilmis surumden turedigini tek satirda soyler.
     */
    sourceFingerprint: sourceHash,
    fullCatalog: {
      brands: brands.length,
      models: models.length,
      trims: source.catalogLeafCount,
      pricedTrims: source.poolCount,
    },
    unlocked: {
      brands: catalog.filter((b) => !b.k).length,
      models: unlockedModels,
      leaves: unlockedLeaves,
      pools: Object.keys(pools).length,
      yearRows,
    },
    levels,
    catalog,
    pools,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload), 'utf8');

  const bytes = Buffer.byteLength(JSON.stringify(payload));
  process.stdout.write('\nPUBLIC DEMO VERI SETI HAZIR\n');
  process.stdout.write(`  kaynak        : ${SOURCE}\n`);
  process.stdout.write(`  kaynak parmak : ${sourceHash}\n`);
  process.stdout.write(`  cikti         : ${OUT}\n`);
  process.stdout.write(`  boyut         : ${(bytes / 1024).toFixed(0)} KB\n`);
  process.stdout.write(
    `  tam katalog   : ${payload.fullCatalog.brands} marka / ` +
      `${payload.fullCatalog.models} model / ${payload.fullCatalog.trims} donanim\n`,
  );
  process.stdout.write(
    `  acik          : ${payload.unlocked.brands} marka / ${payload.unlocked.models} model / ` +
      `${payload.unlocked.leaves} donanim / ${payload.unlocked.pools} havuz / ` +
      `${payload.unlocked.yearRows} yil satiri\n`,
  );
  process.stdout.write(
    `  kilitli       : ${catalog.filter((b) => b.k).length} marka + ` +
      `${lockedModelStubs} model (yalnizca ad)\n`,
  );
}

main();
