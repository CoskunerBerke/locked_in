/**
 * ARAC DEGERLEME PUBLIC DEMO — REGRESYON
 *
 * Iki soruyu ayri ayri sorar:
 *
 *   1) KILIT TUTUYOR MU — acik olmayan hicbir aracin fiyat verisi artefakta
 *      girmis mi? (Kilit arayuzde degil VERIDE uygulanir; bu yuzden sinanan
 *      sey bilesen degil, dosyanin kendisidir.)
 *   2) FIYAT AYNI MI — acik araclarda public demo, kabul edilmis NakitGaraj
 *      demosuyla AYNI sayiyi veriyor mu?
 *
 * Ikincisi icin kabul edilmis veri seti varsa dogrudan karsilastirilir; yoksa
 * test ATLANMAZ, artefaktin kendi satirlari uzerinden beklenen kabul degerleri
 * sinanir. "Kaynak yok" bir gecis gerekcesi degildir.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  PUBLIC_DEMO_BRANCH_IDS,
  PUBLIC_DEMO_BRANCHES,
} from '../../src/config/public-demo.config';
import {
  applyChoice,
  buildCatalog,
  buildChain,
  lockedNodeIn,
  resolvePool,
  stateOf,
  yearEvidenceOf,
  yearsOf,
  type PublicDemoData,
} from '../../src/components/arac-degerleme/selection';
import { hasEnoughEvidence, quote } from '../../src/components/arac-degerleme/pricing';

const ARTIFACT = resolve(__dirname, '../../public/data/public-vehicle-demo.json');
const data = JSON.parse(readFileSync(ARTIFACT, 'utf8')) as PublicDemoData;
const catalog = buildCatalog(data);

const NAKITGARAJ =
  process.env.NAKITGARAJ_DATASET ||
  'C:/dev/NakitGaraj-market-refresh/frontend/public/demo-market.json';

/** Bir yaprak + yil icin public demonun urettigi teklif. */
const quoteFor = (leafId: string, year: string, mileageKm?: number) => {
  const pool = data.pools[leafId];
  if (!pool) return null;
  const row = pool.years[year];
  if (!row) return null;
  const e = yearEvidenceOf(row);
  if (!hasEnoughEvidence(e.directComparables, e.borrowedComparables)) return null;
  return quote({
    kmPoints: e.kmPoints,
    fmvPoints: e.fmvPoints,
    mileageKm: mileageKm ?? e.kmPoints[1],
    directComparables: e.directComparables,
    borrowedComparables: e.borrowedComparables,
    effectiveComparables: e.effectiveComparables,
    engineConfidencePct: e.engineConfidencePct,
    dispersion: e.dispersion,
    engineManualCode: e.engineManualCode,
  });
};

/** Kokten yaprağa secim zinciri (kimlikler opaktir, kesilip birlestirilemez). */
const chainTo = (leafId: string): string[] => {
  const walk = (nodes: typeof catalog.roots, path: string[]): string[] | null => {
    for (const node of nodes) {
      const next = [...path, node.id];
      if (node.id === leafId) return next;
      const hit = walk(node.children, next);
      if (hit) return hit;
    }
    return null;
  };
  const found = walk(catalog.roots, []);
  if (!found) throw new Error(`Katalogda yok: ${leafId}`);
  return found;
};

describe('A) acik arac fiyat uretir', () => {
  it('Opel Corsa 1.5 TD ECO 2000 fiyatlanir', () => {
    const selection = chainTo('opel/corsa/1-5-td/eco');
    expect(stateOf(catalog, data, selection)).toBe('PRICEABLE');
    expect(yearsOf(resolvePool(data, selection))).toEqual([2000]);
    expect(quoteFor('opel/corsa/1-5-td/eco', '2000')).not.toBeNull();
  });

  it('izin verilen her dalda en az bir fiyatlanabilir yaprak var', () => {
    for (const branch of PUBLIC_DEMO_BRANCHES) {
      const priced = Object.keys(data.pools).filter((id) => {
        const chain = chainTo(id);
        return chain[1] === branch.id;
      });
      expect(priced.length, `${branch.id} icin fiyatli yaprak yok`).toBeGreaterThan(0);
    }
  });
});

describe('B/C) kilitli marka ve model fiyat uretemez', () => {
  it('kilitli markanin fiyat verisi ARTEFAKTTA YOK', () => {
    const lockedBrands = catalog.roots.filter((b) => b.locked);
    expect(lockedBrands.length).toBeGreaterThan(50);
    for (const brand of lockedBrands) {
      // Kilitli marka hic cocuk tasimaz ve hicbir havuz ona ait olamaz.
      expect(brand.children).toEqual([]);
      const leaked = Object.keys(data.pools).filter((id) => id.startsWith(`${brand.id}/`));
      expect(leaked, `${brand.id} havuz sizdirdi`).toEqual([]);
    }
  });

  it('acik markanin kilitli modelinin fiyat verisi ARTEFAKTTA YOK', () => {
    const lockedModels = catalog.roots
      .flatMap((b) => b.children)
      .filter((m) => m.locked);
    expect(lockedModels.length).toBeGreaterThan(0);
    for (const model of lockedModels) {
      expect(model.children).toEqual([]);
      expect(data.pools[model.id]).toBeUndefined();
      const leaked = Object.keys(data.pools).filter((id) => id.startsWith(`${model.id}/`));
      expect(leaked, `${model.id} havuz sizdirdi`).toEqual([]);
    }
  });

  it('kilitli secim LOCKED durumuna duser, fiyat cozulmez', () => {
    const mercedes = catalog.roots.find((b) => b.id === 'mercedes-benz');
    expect(mercedes?.locked).toBe(true);
    const selection = [mercedes!.id];
    expect(stateOf(catalog, data, selection)).toBe('LOCKED');
    expect(resolvePool(data, selection)).toBeNull();
  });

  it('kilitli model secimi de LOCKED durumuna duser', () => {
    const insignia = catalog.byId.get('opel/insignia');
    expect(insignia?.locked).toBe(true);
    const selection = ['opel', 'opel/insignia'];
    expect(stateOf(catalog, data, selection)).toBe('LOCKED');
    expect(resolvePool(data, selection)).toBeNull();
  });
});

describe('D) kilitli secim tam surum akisini tetikler', () => {
  it('lockedNodeIn kilitli dugumu bulur', () => {
    expect(lockedNodeIn(catalog, ['mercedes-benz'])?.label).toBe('Mercedes-Benz');
    expect(lockedNodeIn(catalog, ['opel', 'opel/insignia'])?.label).toBe('Insignia');
    expect(lockedNodeIn(catalog, chainTo('opel/corsa/1-5-td/eco'))).toBeNull();
  });

  it('kilitli dugum secilince zincir ORADA durur', () => {
    const chain = buildChain(catalog, ['opel', 'opel/insignia']);
    // Marka + model gosterilir, altinda bir seviye daha ACILMAZ.
    expect(chain.length).toBe(2);
  });
});

describe('F) public veri seti yalnizca izin verilen havuzlari icerir', () => {
  it('her havuz izin verilen bir dala ait', () => {
    const outsiders = Object.keys(data.pools).filter(
      (id) => !PUBLIC_DEMO_BRANCH_IDS.has(chainTo(id)[1]),
    );
    expect(outsiders).toEqual([]);
  });

  it('havuz sayisi acik yaprak sayisini asmaz', () => {
    expect(data.unlocked.pools).toBe(Object.keys(data.pools).length);
    expect(data.unlocked.pools).toBeLessThanOrEqual(data.unlocked.leaves);
  });

  it('seviye basliklari yalnizca acik dallar icin tasinir', () => {
    for (const branch of Object.keys(data.levels)) {
      expect(PUBLIC_DEMO_BRANCH_IDS.has(branch), `${branch} kapali ama levels icinde`).toBe(true);
    }
  });
});

/**
 * G + H) FIYAT PARITESI.
 *
 * Public demo ile kabul edilmis demo AYNI (arac, yil, km) icin AYNI sayiyi
 * vermeli. Fiyat matematigi birebir kopyalandigi icin tek risk VERIDIR: public
 * artefakta yanlis satir yazilmis olabilir. Bu yuzden satirlar karsilastirilir.
 */
describe('G/H) kabul edilmis demo ile fiyat paritesi', () => {
  const SCENARIOS: Array<{ leaf: string; year: string; km?: number }> = [
    { leaf: 'opel/corsa/1-5-td/eco', year: '2000' },
    { leaf: 'opel/corsa/1-5-td/eco', year: '2000', km: 180_000 },
    { leaf: 'audi/a3/a3-sedan/1-5-tfsi/design-line', year: '2018' },
    { leaf: 'audi/a3/a3-sedan/1-5-tfsi/advanced', year: '2026' },
    { leaf: 'audi/a3/a3-sedan/1-5-tfsi/sport-line', year: '2017' },
    { leaf: 'audi/a3/a3-sedan/1-5-tfsi/sport-line', year: '2018', km: 90_000 },
  ];

  const source = existsSync(NAKITGARAJ)
    ? (JSON.parse(readFileSync(NAKITGARAJ, 'utf8')) as {
        pools: Record<string, { n: number; years: Record<string, number[]> }>;
      })
    : null;

  it('senaryolarin tamami public artefaktta fiyat uretir', () => {
    for (const s of SCENARIOS) {
      const result = quoteFor(s.leaf, s.year, s.km);
      expect(result, `${s.leaf} ${s.year} fiyat uretmedi`).not.toBeNull();
      expect(result!.fairMarketValue).toBeGreaterThan(0);
    }
  });

  it('Opel Corsa 1.5 TD ECO 2000 kabul edilmis sonucu verir', () => {
    const result = quoteFor('opel/corsa/1-5-td/eco', '2000')!;
    const evidence = yearEvidenceOf(data.pools['opel/corsa/1-5-td/eco'].years['2000']);
    expect(result.fairMarketValue).toBe(225_000);
    expect(result.cashOffer).toBe(190_000);
    expect(evidence.directComparables).toBe(20);
    expect(evidence.engineConfidencePct).toBe(88);
    expect(result.requiresManualApproval).toBe(true);
  });

  it('acik havuzlarin yil satirlari kaynakla BIREBIR ayni', () => {
    if (!source) {
      throw new Error(
        `Kabul edilmis veri seti bulunamadi: ${NAKITGARAJ}\n` +
          'Parite dogrulanamadi. NAKITGARAJ_DATASET ile yolu verin.',
      );
    }
    const mismatches: string[] = [];
    for (const [id, pool] of Object.entries(data.pools)) {
      const origin = source.pools[id];
      if (!origin) {
        mismatches.push(`${id}: kaynakta yok`);
        continue;
      }
      if (origin.n !== pool.n) mismatches.push(`${id}: n ${pool.n} != ${origin.n}`);
      for (const [year, row] of Object.entries(pool.years)) {
        const originRow = origin.years[year];
        if (!originRow) {
          mismatches.push(`${id} ${year}: kaynakta yok`);
          continue;
        }
        if (row.join(',') !== originRow.join(',')) {
          mismatches.push(`${id} ${year}: satir farkli`);
        }
      }
    }
    expect(mismatches.slice(0, 10)).toEqual([]);
  });

  it('en az 10 senaryoda parite dogrulanir', () => {
    if (!source) throw new Error('Kabul edilmis veri seti yok; parite dogrulanamadi.');
    // Artefakttan deterministik 10 ek senaryo: farkli markalardan ilk yaprak.
    const picks = PUBLIC_DEMO_BRANCHES.map((branch) => {
      const leaf = Object.keys(data.pools)
        .filter((id) => chainTo(id)[1] === branch.id)
        .sort()[0];
      return leaf ? { leaf, year: Object.keys(data.pools[leaf].years).sort()[0] } : null;
    }).filter(Boolean) as Array<{ leaf: string; year: string }>;

    expect(picks.length).toBeGreaterThanOrEqual(10);

    for (const pick of picks) {
      const publicRow = data.pools[pick.leaf].years[pick.year];
      const sourceRow = source.pools[pick.leaf]?.years[pick.year];
      expect(sourceRow, `${pick.leaf} ${pick.year} kaynakta yok`).toBeDefined();
      expect(publicRow.join(',')).toBe(sourceRow!.join(','));
      expect(quoteFor(pick.leaf, pick.year)).not.toBeNull();
    }
  });
});

describe('I/J) kanit durumlari', () => {
  it('tek ilanli arac fiyatlanir ve uzman kontrolu ister', () => {
    const result = quoteFor('audi/a3/a3-sedan/1-5-tfsi/design-line', '2018')!;
    const evidence = yearEvidenceOf(
      data.pools['audi/a3/a3-sedan/1-5-tfsi/design-line'].years['2018'],
    );
    expect(evidence.directComparables).toBe(1);
    expect(result.fairMarketValue).toBeGreaterThan(0);
    expect(result.requiresManualApproval).toBe(true);
    expect(result.manualApprovalReason).toMatch(/tek ilan/i);
  });

  it('kaniti olmayan acik yaprak NO_PRICE_DATA olur — LOCKED degil', () => {
    const unpriced = [...catalog.byId.values()].find(
      (node) =>
        !node.locked &&
        node.children.length === 0 &&
        !data.pools[node.id] &&
        node.id.includes('/'),
    );
    expect(unpriced, 'kaniti olmayan acik yaprak bulunamadi').toBeDefined();
    const selection = chainTo(unpriced!.id);
    expect(stateOf(catalog, data, selection)).toBe('NO_PRICE_DATA');
  });
});

describe('K/L/M) durum gecisleri stale fiyat birakmaz', () => {
  const priced = chainTo('opel/corsa/1-5-td/eco');

  it('K) fiyatli -> kilitli: havuz cozulmez', () => {
    expect(stateOf(catalog, data, priced)).toBe('PRICEABLE');
    const locked = ['mercedes-benz'];
    expect(stateOf(catalog, data, locked)).toBe('LOCKED');
    // Havuz null olunca bilesen `result`u null yapar ve fiyat bolumu kalkar.
    expect(resolvePool(data, locked)).toBeNull();
  });

  it('L) fiyatli -> kaniti yok: havuz cozulmez', () => {
    const unpriced = [...catalog.byId.values()].find(
      (n) => !n.locked && n.children.length === 0 && !data.pools[n.id] && n.id.includes('/'),
    )!;
    expect(resolvePool(data, chainTo(unpriced.id))).toBeNull();
  });

  it('M) kilitli -> acik: fiyat yeniden uretilir', () => {
    expect(stateOf(catalog, data, ['mercedes-benz'])).toBe('LOCKED');
    expect(stateOf(catalog, data, priced)).toBe('PRICEABLE');
    expect(quoteFor('opel/corsa/1-5-td/eco', '2000')!.fairMarketValue).toBe(225_000);
  });

  it('marka degisince alt secim kilitli dala tasinmaz', () => {
    const next = applyChoice(catalog, priced, 0, 'mercedes-benz');
    expect(next).toEqual(['mercedes-benz']);
  });
});
