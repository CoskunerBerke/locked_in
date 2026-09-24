/**
 * FILEZILLA DEPLOY MANIFESTI
 *
 * `dist/` icindeki her dosyayi canli sitedeki karsiligiyla (salt okunur GET)
 * bayt bayt karsilastirir ve yalnizca gercekten yuklenmesi gerekenleri listeler.
 * Hicbir sey yuklemez, silmez, sunucuya yazmaz — yuklemeyi kullanici FileZilla
 * ile elle yapar.
 *
 *   NEW        canlida yok (404)            -> yukle
 *   OVERWRITE  canlida var, icerik farkli   -> uzerine yaz
 *   SAME       birebir ayni                 -> dokunma
 *   UNVERIFIED sunucu vermiyor (.htaccess)  -> git gecmisinden karar ver
 *
 * Canlida olup `dist/` icinde olmayan dosyalar HTTP ile listelenemez; bu
 * script onlari raporlayamaz ve silinmesini onermez.
 *
 * Kullanim:
 *   npm run build && npm run deploy:manifest
 *   DEPLOY_BASE_URL=https://www.rentyazilim.com/ npm run deploy:manifest
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(fileURLToPath(import.meta.url), '../..');
const DIST = join(REPO, 'dist');
const BASE = (process.env.DEPLOY_BASE_URL || 'https://www.rentyazilim.com/').replace(/\/?$/, '/');

if (!existsSync(join(DIST, 'index.html'))) {
  throw new Error('Once "npm run build" calistirin: dist/index.html yok.');
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');

/** `dist/x/index.html` -> `/x/` — sunucunun gercekte servis ettigi URL. */
const urlOf = (rel) => BASE + (rel.endsWith('index.html') ? rel.slice(0, -'index.html'.length) : rel);

async function classify(rel) {
  const local = readFileSync(join(DIST, rel));
  try {
    const response = await fetch(urlOf(rel), {
      redirect: 'manual',
      headers: { 'accept-encoding': 'identity' },
    });
    const live = Buffer.from(await response.arrayBuffer());
    if (response.status === 404) return 'NEW';
    if (response.status !== 200) return 'UNVERIFIED';
    return sha(live) === sha(local) ? 'SAME' : 'OVERWRITE';
  } catch {
    return 'UNVERIFIED';
  }
}

const files = walk(DIST).map((file) => relative(DIST, file).split(sep).join('/')).sort();
const groups = { NEW: [], OVERWRITE: [], UNVERIFIED: [], SAME: [] };
const queue = [...files];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const rel = queue.shift();
      groups[await classify(rel)].push(rel);
    }
  }),
);

process.stdout.write(`\nFILEZILLA DEPLOY MANIFEST — ${BASE}\n`);
process.stdout.write(`dist: ${files.length} dosya\n`);
for (const key of ['NEW', 'OVERWRITE', 'UNVERIFIED']) {
  process.stdout.write(`\n${key} (${groups[key].length}):\n`);
  for (const rel of groups[key].sort()) process.stdout.write(`  ${rel}\n`);
}
process.stdout.write(`\nDO NOT TOUCH: ${groups.SAME.length} dosya canlidakiyle birebir ayni.\n`);
process.stdout.write(
  '\nFileZilla: Aktarim > Aktarim turu > Ikili (Binary). Otomatik/ASCII mod .svg/.html/.js\n' +
    'dosyalarinda satir sonlarini degistirip dosyayi bozar.\n',
);
