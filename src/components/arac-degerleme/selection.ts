/**
 * PUBLIC DEMO ARAC SECIMI
 *
 * Kategori yolu markadan markaya farkli derinliktedir ve seviyelerin ANLAMI
 * da sabit degildir:
 *
 *   Audi   > A3     > A3 Sedan > 1.5 TFSI > Advanced   (kasa + motor + paket)
 *   Opel   > Corsa  > 1.5 TD   > ECO                   (motor + paket)
 *
 * Bu yuzden zincir VERIDEN turer, sabit derinlik varsayilmaz.
 *
 * KIMLIK BIR YOL DEGILDIR. Kaynak hiyerarside 14 dugumde cocugun kimligi
 * ebeveyninin kimligiyle BASLAMAZ (Peugeot "206" ve "206 +" ayni slug'a
 * duser). Bu yuzden kimlikler opak anahtar olarak tasinir, '/' ile kesilip
 * birlestirilmez.
 *
 * KILIT BURADA DEGIL, VERIDE UYGULANIR. Kilitli bir dugumun fiyat verisi zaten
 * artefakta girmez; buradaki `locked` bayragi yalnizca ARAYUZUN ne
 * gosterecegini soyler. Yani bu dosyadaki bir hata fiyat sizdiramaz.
 */

/**
 * [km1, km2, km3, fmv1, fmv2, fmv3, dogrudan, odunc, etkin,
 *  yayilim, motor guveni, manuel gerekce kodu]
 */
export type YearRow = [
  number, number, number, number, number, number,
  number, number, number, number, number, number,
];

export interface YearEvidence {
  kmPoints: [number, number, number];
  fmvPoints: [number, number, number];
  directComparables: number;
  borrowedComparables: number;
  effectiveComparables: number;
  dispersion: number;
  engineConfidencePct: number;
  engineManualCode: number;
}

export const yearEvidenceOf = (row: YearRow): YearEvidence => ({
  kmPoints: [row[0], row[1], row[2]],
  fmvPoints: [row[3], row[4], row[5]],
  directComparables: row[6],
  borrowedComparables: row[7],
  effectiveComparables: row[8],
  dispersion: row[9],
  engineConfidencePct: row[10],
  engineManualCode: row[11],
});

export type LevelKind = 'body' | 'engine' | 'package' | 'series';

/** Uretilen artefaktin tel bicimi (`build-public-vehicle-demo.mjs`). */
export interface PublicWireNode {
  /** Kaynak hiyerarsi kimligi — opak anahtar. */
  i: string;
  /** Ekranda gorunen ad. */
  l: string;
  /** Kaynak ilan sayisi; yalnizca acik dallarda bulunur. */
  n?: number;
  c?: PublicWireNode[];
  /** 1 = kilitli. Kilitli dugumde fiyat verisi YOKTUR. */
  k?: 1;
}

export interface PublicPool {
  n: number;
  km: number;
  years: Record<string, YearRow>;
}

export interface PublicDemoData {
  version: string;
  generatedAt: string;
  sourceFingerprint: string;
  fullCatalog: { brands: number; models: number; trims: number; pricedTrims: number };
  unlocked: {
    brands: number;
    models: number;
    leaves: number;
    pools: number;
    yearRows: number;
  };
  levels: Record<string, LevelKind[]>;
  catalog: PublicWireNode[];
  pools: Record<string, PublicPool>;
}

export interface DemoNode {
  id: string;
  label: string;
  listings: number;
  locked: boolean;
  children: DemoNode[];
}

export interface Catalog {
  roots: DemoNode[];
  byId: Map<string, DemoNode>;
}

/**
 * Bir secimin durumu.
 *
 *   INCOMPLETE    — zincir bitmedi.
 *   LOCKED        — arac TAM SURUM ozelligi; fiyat verisi tarayiciya hic gelmedi.
 *   PRICEABLE     — acik arac, fiyat kaniti var.
 *   NO_PRICE_DATA — acik arac, guncel emsal kaniti yok.
 *
 * LOCKED ile NO_PRICE_DATA AYRI SEYLERDIR ve birbirinin yerine kullanilmaz.
 * Kilitli araca "veri bulunamadi" demek yalan olurdu: veri var, public demoya
 * dahil degil. Kaniti olmayan araca "tam surumde var" demek de yalan olurdu:
 * tam surumde de fiyat uretilmez.
 */
export type SelectionState =
  | 'INCOMPLETE'
  | 'LOCKED'
  | 'PRICEABLE'
  | 'NO_PRICE_DATA';

export const LEVEL_HEADING: Record<LevelKind, string> = {
  body: 'Kasa / Gövde',
  engine: 'Motor',
  package: 'Paket / Donanım',
  series: 'Seri / Tip',
};

const byTr = (a: DemoNode, b: DemoNode) => a.label.localeCompare(b.label, 'tr');

export function buildCatalog(data: PublicDemoData): Catalog {
  const byId = new Map<string, DemoNode>();
  const expand = (wire: PublicWireNode): DemoNode => {
    const node: DemoNode = {
      id: wire.i,
      label: wire.l,
      listings: wire.n ?? 0,
      locked: wire.k === 1,
      children: (wire.c ?? []).map(expand),
    };
    node.children.sort(byTr);
    byId.set(node.id, node);
    return node;
  };
  const roots = (data.catalog ?? []).map(expand);
  roots.sort(byTr);
  return { roots, byId };
}

/** Secimin `depth` seviyesindeki dugumu. Kimlik dogrudan tasinir. */
export function nodeAt(
  catalog: Catalog,
  selection: string[],
  depth: number,
): DemoNode | null {
  if (depth <= 0 || selection.length < depth) return null;
  const id = selection[depth - 1];
  return id ? (catalog.byId.get(id) ?? null) : null;
}

export function optionsAt(
  catalog: Catalog,
  selection: string[],
  depth: number,
): DemoNode[] {
  if (depth === 0) return catalog.roots;
  const parent = nodeAt(catalog, selection, depth);
  return parent ? parent.children : [];
}

export interface ChainRow {
  depth: number;
  options: DemoNode[];
  value: string;
}

/**
 * Gosterilecek dropdown'lar. Kilitli bir dugum secildiginde zincir ORADA
 * durur: altinda gosterilecek bir sey yok ve olmamali.
 */
export function buildChain(catalog: Catalog, selection: string[]): ChainRow[] {
  const rows: ChainRow[] = [];
  for (let depth = 0; ; depth++) {
    const options = optionsAt(catalog, selection, depth);
    if (options.length === 0) break;
    rows.push({ depth, options, value: selection[depth] ?? '' });
    if (!selection[depth]) break;
    if (catalog.byId.get(selection[depth])?.locked) break;
  }
  return rows;
}

/** Secilen zincirde kilitli bir dugum var mi? */
export function lockedNodeIn(
  catalog: Catalog,
  selection: string[],
): DemoNode | null {
  for (const id of selection) {
    const node = catalog.byId.get(id);
    if (node?.locked) return node;
  }
  return null;
}

/**
 * FIYAT HAVUZU TAM KIMLIKTEN COZULUR — etikete gore arama yapilmaz, yani
 * ayni etiketi paylasan iki dal birbirine karisamaz.
 */
export function resolvePool(
  data: PublicDemoData,
  selection: string[],
): PublicPool | null {
  const id = selection[selection.length - 1];
  return id ? (data.pools[id] ?? null) : null;
}

export function labelPathOf(catalog: Catalog, selection: string[]): string[] {
  const labels: string[] = [];
  for (let depth = 1; depth <= selection.length; depth++) {
    const node = nodeAt(catalog, selection, depth);
    if (!node) break;
    labels.push(node.label);
  }
  return labels;
}

export function stateOf(
  catalog: Catalog,
  data: PublicDemoData,
  selection: string[],
): SelectionState {
  if (lockedNodeIn(catalog, selection)) return 'LOCKED';
  const node = nodeAt(catalog, selection, selection.length);
  if (!node || node.children.length > 0) return 'INCOMPLETE';
  const pool = data.pools[node.id];
  return pool && Object.keys(pool.years).length > 0
    ? 'PRICEABLE'
    : 'NO_PRICE_DATA';
}

/** Seviye basligi: ilk ikisi sabit, gerisi veri setinin sinifllandirmasindan. */
export function headingFor(
  data: PublicDemoData,
  selection: string[],
  depth: number,
): string {
  if (depth === 0) return 'Marka';
  if (depth === 1) return 'Model';
  const branch = selection[1];
  const kinds = branch ? data.levels[branch] : undefined;
  return LEVEL_HEADING[kinds?.[depth - 2] ?? 'series'];
}

/**
 * Bir seviye degisince alt seviyeler KOR RESETLENMEZ: hala gecerli olan secim
 * ETIKETE gore tasinir ("1.6 TDI" iki kasada da varsa yeniden secilmez).
 */
export function applyChoice(
  catalog: Catalog,
  selection: string[],
  depth: number,
  value: string,
): string[] {
  const next = selection.slice(0, depth);
  if (!value) return next;
  next[depth] = value;
  for (let i = depth + 1; i < selection.length; i++) {
    const keptLabel = catalog.byId.get(selection[i])?.label;
    if (!keptLabel) break;
    const match = optionsAt(catalog, next, i).find((o) => o.label === keptLabel);
    if (!match) break;
    next[i] = match.id;
  }
  return next;
}

/** Havuzun yillari, yeniden eskiye. */
export function yearsOf(pool: PublicPool | null): number[] {
  if (!pool) return [];
  return Object.keys(pool.years)
    .map(Number)
    .sort((a, b) => b - a);
}

/**
 * Secimin altindaki EN DERIN yol + yil. Gorunen zincirden okunamaz: zincir
 * bir sonraki seviyeyi ancak secim yapilinca acar, yani payda ilerledikce
 * BUYUR ve cubuk adim atildiginda geri cekilirdi.
 */
export function totalStepsFor(catalog: Catalog, selection: string[]): number {
  const deepest = (nodes: DemoNode[], depth: number): number =>
    nodes.reduce(
      (max, node) =>
        Math.max(
          max,
          node.children.length === 0 ? depth + 1 : deepest(node.children, depth + 1),
        ),
      depth,
    );
  const last = selection.length ? catalog.byId.get(selection[selection.length - 1]) : null;
  if (last?.locked) return Math.max(1, selection.length) + 1;
  const scope = selection.length ? (last?.children ?? []) : catalog.roots;
  const depth = scope.length === 0 ? selection.length : deepest(scope, selection.length);
  return Math.max(1, depth) + 1;
}
