/**
 * URUN KAYDI DENETIMI
 *
 * `src/config/products.ts` bir belge degil, dosya sistemine karsi dogrulanan
 * bir sozlesmedir: kayit ile sitedeki gercek dosyalar ayrisirsa bu test kirilir.
 * Ozellikle statik veri yenilendiginde kaynak revizyonunun da guncellenmesini
 * zorlar — "canlidaki veri hangi surumden?" sorusu hep cevaplanabilir kalir.
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { PRODUCTS } from '../../src/config/products';

const REPO = resolve(__dirname, '../..');
const read = (rel: string) => readFileSync(join(REPO, rel), 'utf8');

describe('urun kaydi', () => {
  it('slug ve route benzersiz, route /<slug>/ biciminde', () => {
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length);
    for (const product of PRODUCTS) {
      expect(product.route).toBe(`/${product.slug}/`);
    }
  });

  it('kayitta yerel yol veya localhost yok', () => {
    const text = JSON.stringify(PRODUCTS);
    expect(text).not.toMatch(/[A-Za-z]:[\\/]/);
    expect(text).not.toMatch(/localhost|127\.0\.0\.1/);
  });

  for (const product of PRODUCTS) {
    describe(product.slug, () => {
      it('sayfa, bilesen klasoru ve export scripti mevcut', () => {
        expect(existsSync(join(REPO, product.site.page)), product.site.page).toBe(true);
        expect(statSync(join(REPO, product.site.components)).isDirectory()).toBe(true);
        if (product.site.exportScript) {
          expect(existsSync(join(REPO, product.site.exportScript))).toBe(true);
        }
      });

      it('statik veri dosyalari public/ altinda ve kaynak parmak izi kayitla ayni', () => {
        for (const file of product.site.data) {
          const path = join(REPO, 'public', file);
          expect(existsSync(path), file).toBe(true);
          if (product.source.dataFingerprint) {
            const artifact = JSON.parse(readFileSync(path, 'utf8')) as { sourceFingerprint?: string };
            expect(
              artifact.sourceFingerprint,
              `${file} yenilendi: src/config/products.ts icindeki source.revision ve dataFingerprint'i guncelle`,
            ).toBe(product.source.dataFingerprint);
          }
        }
      });

      it('nav yerlesimi Header ve MobileMenu ile tutarli', () => {
        const link = `href="${product.route}"`;
        const header = read('src/components/common/Header.astro').includes(link);
        const mobile = read('src/components/common/MobileMenu.react.tsx').includes(link);
        const inTopNav = product.nav === 'top-nav';
        expect(header, 'Header').toBe(inTopNav);
        expect(mobile, 'MobileMenu').toBe(inTopNav);
      });
    });
  }
});
