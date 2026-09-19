/**
 * SAYI GECISI — kabul edilmis surumden birebir tasindi.
 *
 * Kaynak: NakitGaraj `frontend/src/lib/use-count-up.ts`
 * Kabul edilmis commit: 7d113335c78e0e24ca8156ab73b7a9e6f3bbe24d
 *
 * Yeni bir sayac yazilmadi: davranis (ilk gosterimde sayim yok,
 * `prefers-reduced-motion` aciksa aninda yazma, tek rAF dongusu) kabul edilmis
 * demonun kendisidir.
 */
import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sonda yavaslayan yumusak egri; basta hizli, sonda oturur. */
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Gecisin belirli bir aninda gosterilecek deger. Zamanlama disari
 * alindigi icin egri, sinir degerleri ve yon (artan/azalan) arayuz
 * olmadan sinanabilir.
 */
export function countUpValue(
  from: number,
  to: number,
  progress: number,
): number {
  const t = Math.min(1, Math.max(0, progress));
  if (t >= 1) return to;
  return from + (to - from) * easeOutCubic(t);
}

export function useCountUp(value: number, durationMs = 520): number {
  /** null = sayim yok, gercek deger gosteriliyor. */
  const [animated, setAnimated] = useState<number | null>(null);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      fromRef.current = value;
      return;
    }

    if (prefersReducedMotion() || !Number.isFinite(value)) {
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    if (from === value) return;

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      if (progress >= 1) {
        fromRef.current = value;
        frameRef.current = null;
        setAnimated(null);
        return;
      }
      const next = countUpValue(from, value, progress);
      // Bir sonraki gecis EKRANDAKI sayidan baslasin: hizli secim
      // degisimlerinde sayi geri sicramaz.
      fromRef.current = next;
      setAnimated(next);
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [value, durationMs]);

  return animated ?? value;
}
