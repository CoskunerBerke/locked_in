/**
 * MINIMAL FILEZILLA PAKETI URETICISI
 *
 * NEDEN VAR: canli rentyazilim.com elle (FTP) yukleniyor ve buyuk olasilikla
 * `experiment/home-planet-experience-v3` dalindan uretilmis. Bu depo ise
 * `main` tabanlidir ve o dalin 31 commit'lik isini ICERMEZ. Dolayisiyla
 * `dist/` klasorunun tamamini yuklemek canli ana sayfayi, header'i, footer'i,
 * hizmet sayfalarini ve global CSS'i ESKI surumle geri alir.
 *
 * Bu script tam da bunu onlemek icin var: `/arac-degerleme/` rotasinin
 * calismak icin ihtiyac duydugu dosyalarin GECISLI KAPANISINI hesaplar ve
 * yalnizca onlari ayri bir klasore kopyalar. Klasorde ne ana sayfa, ne diger
 * rotalar, ne sitemap, ne favicon bulunur.
 *
 * SABIT YOLLU DOSYA UYARISI: `_astro/` altindaki dosyalar icerik-hash'li
 * oldugu icin canlidaki bir dosyanin uzerine YAZMAZ (ayni ad = ayni icerik).
 * Sabit yollu bir dosya (orn. /favicon.ico) pakete girerse, canlidaki farkli
 * icerikli dosyanin uzerine yazar — bu yuzden bunlar ayri raporlanir ve
 * varsayilan olarak PAKETE ALINMAZ.
 *
 * Kullanim:
 *   node scripts/build-filezilla-package.mjs
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const DIST = join(REPO, 'dist');
const OUT = join(REPO, 'filezilla-arac-degerleme');
const ROUTE = 'arac-degerleme/index.html';

if (!existsSync(join(DIST, ROUTE))) {
  throw new Error(`Once "npm run build" calistirin: ${join(DIST, ROUTE)} yok.`);
}

/**
 * Varlik uzantilari. Bir referans BUNLARDAN birini tasimiyorsa varlik degil,
 * BASKA BIR ROTAYA giden baglantidir (`/akademi/`, `/iletisim/`).
 *
 * Bu ayrim pakedin tamamini belirler: gezinme baglantilarini izlemek, tek bir
 * rota paketine sitenin TAMAMINI cekerdi — yani tam da kacinmaya calistigimiz
 * sey. O sayfalar canlida zaten var ve dokunulmayacak.
 */
const ASSET_EXTENSION =
  /\.(js|mjs|css|json|webmanifest|png|jpe?g|svg|webp|avif|gif|ico|woff2?|ttf|otf|eot|mp4|webm|txt|xml)$/i;

/** `/_astro/x.js` -> `_astro/x.js`; disa donuk URL'ler ve rota baglantilari elenir. */
function localPath(reference) {
  if (!reference) return null;
  if (/^(https?:)?\/\//i.test(reference)) return null;
  if (/^(data|mailto|tel|javascript):/i.test(reference)) return null;
  const clean = reference.split('#')[0].split('?')[0].trim();
  if (!clean || !clean.startsWith('/')) return null;
  if (!ASSET_EXTENSION.test(clean)) return null;
  return clean.slice(1);
}

/** Rotanin ISARET ETTIGI diger sayfalar — kopyalanmaz, yalnizca raporlanir. */
function outboundLinks(file) {
  const text = readFileSync(file, 'utf8');
  const links = new Set();
  for (const match of text.matchAll(/href\s*=\s*["'](\/[^"']*)["']/gi)) {
    const clean = match[1].split('#')[0].split('?')[0];
    if (clean && !ASSET_EXTENSION.test(clean)) links.add(clean);
  }
  return [...links].sort();
}

/**
 * Bir dosyadaki yerel varlik referanslarini toplar.
 *
 * HTML icin oznitelikler, JS icin hem statik import yollari hem de kod icinde
 * gecen `/...` bicimli dizeler taranir: React adasi veri dosyasini
 * `fetch('/data/...')` ile cagirir ve bu bir `import` DEGILDIR, yani yalnizca
 * import grafigini izlemek onu KACIRIRDI.
 */
function referencesIn(file) {
  const raw = readFileSync(file, 'utf8');
  /**
   * HTML VARLIK KODLAMASI COZULUR.
   *
   * Astro, adanin props'unu HTML ozniteligine GOMER ve tirnaklari `&quot;`
   * olarak kacar:
   *   props="{&quot;dataUrl&quot;:[0,&quot;/data/public-vehicle-demo.json&quot;]}"
   * Kodlanmis metni taramak bu yolu GORMEZ. Tam da bu yuzden ilk uretimde
   * hesap makinesinin veri dosyasi pakete girmemisti: `fetch` yolu ne bir
   * `src`/`href` ozniteligi ne de duz bir JS dizesidir.
   */
  const text = raw
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
  const found = new Set();

  for (const match of text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    const path = localPath(match[1]);
    if (path) found.add(path);
  }
  // Gomulu props, JS import'lari ve kod icindeki duz "/..." yollari.
  for (const match of text.matchAll(/["'`](\/[A-Za-z0-9_\-./@]+\.(?:js|mjs|css|json|png|jpg|jpeg|svg|webp|avif|woff2?|ttf|mp4|webm|ico))["'`]/g)) {
    const path = localPath(match[1]);
    if (path) found.add(path);
  }

  /**
   * GORECELI CHUNK IMPORT'LARI — paketi bozan seyin ta kendisi.
   *
   * Rollup, `_astro/` icindeki paylasilan parcalari MUTLAK degil GORECELI
   * yolla cagirir: `import"./jsx-runtime.D_zvdyIk.js"`. Yalnizca `/...` ile
   * baslayan yollari aramak bunlari KACIRIR; ada dosyasinin kendisi 200 doner
   * ama ic import'u 404 olur ve tarayici "Failed to fetch dynamically imported
   * module" der. Olculdu: 7 parca eksikti ve hicbir ada hidrasyon olmadi.
   *
   * Bu yuzden goreceli yollar dosyanin KENDI klasorune gore cozulur.
   */
  if (/\.(js|mjs|css)$/i.test(file)) {
    const dir = dirname(file).slice(DIST.length + 1).replace(/\\/g, '/');
    for (const match of text.matchAll(
      /["'`](\.{1,2}\/[A-Za-z0-9_\-./@]+\.(?:js|mjs|css|json|png|jpg|jpeg|svg|webp|avif|woff2?|ttf|mp4|webm|ico))["'`]/g,
    )) {
      const resolved = join(dir, match[1]).replace(/\\/g, '/');
      found.add(resolved);
    }
  }
  return [...found];
}

// --- gecisli kapanis
const queue = [ROUTE];
const needed = new Set();
const missing = [];
while (queue.length > 0) {
  const relative = queue.shift();
  if (needed.has(relative)) continue;
  const absolute = join(DIST, relative);
  if (!existsSync(absolute)) {
    missing.push(relative);
    continue;
  }
  needed.add(relative);
  if (!/\.(html|js|mjs|css)$/i.test(relative)) continue;
  for (const reference of referencesIn(absolute)) {
    if (!needed.has(reference)) queue.push(reference);
  }
}

/**
 * NEYIN PAKETE GIRECEGI.
 *
 * `_astro/` altindaki dosyalar ICERIK-HASH'LIDIR: ayni ad = ayni icerik, yani
 * canlidaki bir dosyanin uzerine yazsalar bile zarar veremezler. Bunlar ve
 * rotanin kendi verisi (`data/`) pakete girer.
 *
 * SABIT YOLLU her sey DISARIDA BIRAKILIR. `favicon.ico`, `brand/logo.png`,
 * `apple-touch-icon.png`, `sitemap-index.xml` gibi dosyalar canlida ZATEN
 * vardir ve buyuk olasilikla deney dalindan gelen DAHA YENI surumleridir
 * (deney dali favicon'lari ve logolari degistirdi). Bu depo `main` tabanli
 * oldugu icin buradaki kopyalar ESKIDIR; yuklemek canli sitenin simgelerini
 * geri alirdi. `sitemap-index.xml` daha da kotusu: yalnizca bu depodaki
 * sayfa kumesini bilir, deney dalinin ekledigi sayfalari silerdi.
 *
 * Sayfa bu dosyalari canlidan cozecektir; paket onlarsiz da calisir.
 */
const isHashed = (p) => p.startsWith('_astro/');
const isRouteData = (p) => p.startsWith('data/');
const shipped = (p) => p === ROUTE || isHashed(p) || isRouteData(p);

const fixedPath = [...needed].filter((p) => !shipped(p)).sort();

// --- paketi kur
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let bytes = 0;
const copied = [];
for (const relative of [...needed].filter(shipped).sort()) {
  const from = join(DIST, relative);
  const to = join(OUT, relative);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to);
  const size = statSync(from).size;
  bytes += size;
  copied.push({ path: relative, bytes: size });
}

// --- paketin kendisini denetle: tam veri seti veya kisitli fiyat izi var mi?
const FORBIDDEN = [
  'demo-market.json',
  'NakitGaraj',
  'nakitgaraj',
  'arac-degerleme-demo.vercel.app',
  'dev.db',
  'RawVehicleListing',
  'listing-assignments',
  'market-refresh',
  'sahibindne',
  'localhost',
  '127.0.0.1',
  'C:\\',
];
const RESTRICTED_POOLS = [
  'opel/insignia/1-6-cdti',
  'mercedes-benz/maybach-s/s-450',
  'peugeot/206/1-4',
  'toyota/corolla',
  'volkswagen/passat',
  'bmw/3-serisi',
];

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
};

const leaks = [];
for (const file of walk(OUT)) {
  if (!/\.(html|js|mjs|css|json|txt|xml|map|svg)$/i.test(file)) continue;
  const relative = file.slice(OUT.length + 1).replace(/\\/g, '/');
  const text = readFileSync(file, 'utf8');
  for (const marker of FORBIDDEN) {
    if (text.includes(marker)) leaks.push(`${relative}: "${marker}"`);
  }
  for (const pool of RESTRICTED_POOLS) {
    if (text.includes(`"${pool}"`)) leaks.push(`${relative}: kisitli havuz "${pool}"`);
  }
}
const sourceMaps = walk(OUT).filter((f) => f.endsWith('.map'));

const manifest = {
  builtFrom: 'dist/',
  route: '/arac-degerleme/',
  outboundPageLinks: outboundLinks(join(DIST, ROUTE)),
  files: copied,
  totalBytes: bytes,
  hashedAssets: copied.filter((f) => isHashed(f.path)).map((f) => f.path),
  excludedFixedPathFiles: fixedPath,
  missingReferences: missing,
  leakFindings: leaks,
  sourceMaps: sourceMaps.map((f) => f.slice(OUT.length + 1)),
};
writeFileSync(join(OUT, '_MANIFEST.json'), JSON.stringify(manifest, null, 2), 'utf8');

const out = process.stdout;
out.write('\nMINIMAL FILEZILLA PAKETI\n');
out.write(`  klasor        : ${OUT}\n`);
out.write(`  dosya         : ${copied.length}\n`);
out.write(`  toplam boyut  : ${(bytes / 1024).toFixed(0)} KB\n\n`);
out.write('  ICERIK:\n');
for (const file of copied) {
  out.write(`    ${(file.bytes / 1024).toFixed(1).padStart(8)} KB  ${file.path}\n`);
}
out.write(`\n  hash'li varlik (uzerine yazma riski YOK): ${manifest.hashedAssets.length}\n`);
out.write(`  SABIT yollu dosya (uzerine yazar!)      : ${fixedPath.length}\n`);
for (const file of fixedPath) out.write(`      ${file}\n`);
out.write(`  cozulemeyen referans                   : ${missing.length}\n`);
for (const file of missing) out.write(`      ${file}\n`);
out.write(`\n  SIZINTI DENETIMI: ${leaks.length === 0 ? 'TEMIZ' : leaks.length + ' BULGU'}\n`);
for (const leak of leaks) out.write(`      ${leak}\n`);
out.write(`  source map: ${sourceMaps.length}\n`);

if (leaks.length > 0 || sourceMaps.length > 0) {
  throw new Error('Paket sizinti denetimini gecemedi.');
}
