/**
 * ARAC DEGERLEME — SINIRLI PUBLIC DEMO
 *
 * Statik calisir: sunucu, SSR veya API yoktur. Fiyat, onceden hesaplanmis
 * (havuz, yil) tablosundan okunur ve tarayicida yalnizca kilometre duzeltmesi
 * ile musteriye donuk formuller uygulanir (`pricing.ts` — kabul edilmis
 * surumden birebir tasindi). Yani gosterilen sayilar gercek motorun kendi
 * sayilaridir, taklit degil.
 *
 * KILIT VERIDE UYGULANIR, BURADA DEGIL. Kapali bir aracin fiyat verisi bu
 * bilesene hic ulasmaz; `locked` bayragi yalnizca ne gosterilecegini soyler.
 * Bu dosyadaki bir hata fiyat sizdiramaz.
 *
 * DORT DURUM AYRI TUTULUR: fiyatli, fiyatli + uzman kontrolu, kaniti olmayan
 * (fiyat yok) ve public demo disi (kilitli). Ucuncusu urunun durusudur,
 * dorduncusu ticari sinirdir; birbirinin yerine gecmezler.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Check,
  Clock,
  Handshake,
  Info,
  Loader2,
  Lock,
  Search,
  TrendingUp,
} from 'lucide-react';
import UpgradeModal from './UpgradeModal';
import { useCountUp } from './useCountUp';
import { formatTL, hasEnoughEvidence, quote, type DemoQuote } from './pricing';
import {
  applyChoice,
  buildCatalog,
  buildChain,
  headingFor,
  labelPathOf,
  lockedNodeIn,
  resolvePool,
  stateOf,
  totalStepsFor,
  yearEvidenceOf,
  yearsOf,
  type Catalog,
  type PublicDemoData,
} from './selection';

interface Props {
  /** Artefaktin yolu; Astro `base` ayariyla uyumlu olsun diye disaridan gelir. */
  dataUrl: string;
  /** Rent Yazilim'in MEVCUT WhatsApp baglantisi. */
  contactHref: string;
}

const confidenceTone = (pct: number, needsReview: boolean): string => {
  if (needsReview || pct < 70) return '#b45309';
  if (pct < 80) return '#d97706';
  return '#047857';
};

const EMPTY_CATALOG: Catalog = { roots: [], byId: new Map() };

export default function PublicVehicleDemo({ dataUrl, contactHref }: Props) {
  const [data, setData] = useState<PublicDemoData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  /** Secilen dugum kimlikleri, koktan asagi. */
  const [selection, setSelection] = useState<string[]>([]);
  const [year, setYear] = useState('');
  const [km, setKm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  /**
   * SON DOKUNULAN ALAN — yalnizca gorsel geri bildirim. Secim mantigiyla
   * ilgisi yoktur. `-1` yil alanidir.
   */
  const [pulsedDepth, setPulsedDepth] = useState<number | null>(null);
  useEffect(() => {
    if (pulsedDepth === null) return;
    const timer = setTimeout(() => setPulsedDepth(null), 620);
    return () => clearTimeout(timer);
  }, [pulsedDepth]);

  useEffect(() => {
    let alive = true;
    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Veri yüklenemedi (${response.status})`);
        return response.json() as Promise<PublicDemoData>;
      })
      .then((parsed) => alive && setData(parsed))
      .catch((error: Error) => alive && setLoadError(error.message));
    return () => {
      alive = false;
    };
  }, [dataUrl]);

  const catalog = useMemo(
    () => (data ? buildCatalog(data) : EMPTY_CATALOG),
    [data],
  );
  const chain = useMemo(() => buildChain(catalog, selection), [catalog, selection]);
  const pool = useMemo(
    () => (data ? resolvePool(data, selection) : null),
    [data, selection],
  );
  const years = useMemo(() => yearsOf(pool), [pool]);
  const labelPath = useMemo(
    () => labelPathOf(catalog, selection),
    [catalog, selection],
  );
  const state = useMemo(
    () => (data ? stateOf(catalog, data, selection) : 'INCOMPLETE'),
    [catalog, data, selection],
  );
  const lockedNode = useMemo(
    () => lockedNodeIn(catalog, selection),
    [catalog, selection],
  );

  /**
   * Ust secim degisince yil KOR RESETLENMEZ: secili yil yeni havuzda da varsa
   * korunur, yoksa yok sayilir. Durum temizlemek yerine TURETILIR.
   */
  const activeYear = useMemo(
    () => (pool && year && pool.years[year] ? year : ''),
    [pool, year],
  );

  /**
   * FIYAT YALNIZCA ACIK VE KANITLI ARACTA URETILIR.
   *
   * Kilitli bir secimde `pool` zaten null olur (veri gelmedi), ama kosul
   * acikca yazilir: bu satir, ileride veri bicimi degisse bile kilitli araca
   * fiyat uretilmeyecegini garanti eder.
   */
  const result: DemoQuote | null = useMemo(() => {
    if (state !== 'PRICEABLE' || !pool || !activeYear) return null;
    const row = pool.years[activeYear];
    if (!row) return null;
    const evidence = yearEvidenceOf(row);
    if (!hasEnoughEvidence(evidence.directComparables, evidence.borrowedComparables)) {
      return null;
    }
    const mileageKm = Number(km.replace(/\D/g, '')) || evidence.kmPoints[1];
    return quote({
      kmPoints: evidence.kmPoints,
      fmvPoints: evidence.fmvPoints,
      mileageKm,
      directComparables: evidence.directComparables,
      borrowedComparables: evidence.borrowedComparables,
      effectiveComparables: evidence.effectiveComparables,
      engineConfidencePct: evidence.engineConfidencePct,
      dispersion: evidence.dispersion,
      engineManualCode: evidence.engineManualCode,
    });
  }, [state, pool, activeYear, km]);

  const yearRow = pool && activeYear ? pool.years[activeYear] : null;

  const shownMarketValue = useCountUp(result?.fairMarketValue ?? 0);
  const shownCashOffer = useCountUp(result?.cashOffer ?? 0);
  const shownConsignmentNet = useCountUp(result?.customerConsignmentNet ?? 0);

  const totalSteps = useMemo(
    () => totalStepsFor(catalog, selection),
    [catalog, selection],
  );
  const completedSteps = Math.min(
    totalSteps,
    selection.filter(Boolean).length + (activeYear ? 1 : 0),
  );

  /** Kilitli dugum secilir secilmez panel acilir. */
  useEffect(() => {
    if (lockedNode) setModalOpen(true);
  }, [lockedNode]);

  /**
   * Kapatma islevi SABIT tutulur. Her render'da yeni bir fonksiyon vermek,
   * panelin odak yonetimi effect'ini surekli sokup takar ve odak hicbir zaman
   * panele girmez (olculdu).
   */
  const closeModal = useCallback(() => setModalOpen(false), []);

  if (loadError) {
    return (
      <div className="rv-fade mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <AlertTriangle className="mx-auto mb-3 text-amber-500" size={28} aria-hidden />
        <p className="text-sm text-slate-600">{loadError}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[18rem] items-center justify-center" aria-busy="true">
        <Loader2 className="animate-spin text-sky-600" size={26} aria-hidden />
        <span className="sr-only">Araç kataloğu yükleniyor</span>
      </div>
    );
  }

  const selectClass =
    'rv-select w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none';
  const inputClass =
    'rv-input w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none';

  return (
    <>
      <section className="rv-rise rv-delay-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-24px_rgba(15,23,42,0.28)] md:p-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Search size={16} className="text-sky-600" aria-hidden />
            Araç seçimi
          </div>
          <span className="text-xs font-semibold tabular-nums text-slate-500">
            {completedSteps} / {totalSteps}
          </span>
        </div>

        <div
          className="rv-progress-track mb-5"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-valuenow={completedSteps}
          aria-label="Araç seçimi ilerlemesi"
        >
          <div
            className="rv-progress-fill"
            style={{ width: `${Math.round((completedSteps / Math.max(1, totalSteps)) * 100)}%` }}
          />
        </div>

        <div className="rv-fields grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chain.map(({ depth, options, value }) => (
            // Anahtar SECENEK KUMESINI tasir: ust secim degisip bu alanin
            // secenekleri yenilendiginde alan kisa bir tazelenme oynatir.
            <label
              className={`rv-refresh block${pulsedDepth === depth ? ' rv-pulse' : ''}`}
              key={`${depth}:${options.map((o) => o.id).join('|')}`}
            >
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                {headingFor(data, selection, depth)}
                {value && !catalog.byId.get(value)?.locked && (
                  <Check size={12} className="text-sky-600" aria-hidden />
                )}
              </span>
              <select
                className={selectClass}
                data-filled={value ? 'true' : 'false'}
                value={value}
                onChange={(event) => {
                  setPulsedDepth(depth);
                  setSelection((previous) =>
                    applyChoice(catalog, previous, depth, event.target.value),
                  );
                }}
              >
                <option value="">Seçiniz</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {/*
                      Kilitli secenek listede KALIR: musteri katalogun
                      genisligini gorsun diye. Fiyat verisi tasinmaz.
                    */}
                    {option.locked ? `🔒 ${option.label} — Tam sürüm` : option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label
            className={`rv-refresh block${pulsedDepth === -1 ? ' rv-pulse' : ''}`}
            key={`yil:${selection.join('/')}`}
          >
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              Yıl
              {activeYear && <Check size={12} className="text-sky-600" aria-hidden />}
            </span>
            <select
              className={selectClass}
              data-filled={activeYear ? 'true' : 'false'}
              value={activeYear}
              disabled={!pool}
              onChange={(event) => {
                setPulsedDepth(-1);
                setYear(event.target.value);
              }}
            >
              <option value="">Seçiniz</option>
              {years.map((value) => (
                <option key={value} value={String(value)}>
                  {value} ({pool?.years[String(value)][6]} ilan)
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Kilometre{' '}
              {yearRow ? (
                <span className="rv-fade font-normal text-slate-400" key={yearRow[1]}>
                  — boş bırakılırsa {formatTL(yearRow[1])} km varsayılır
                </span>
              ) : null}
            </span>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder={yearRow ? formatTL(yearRow[1]) : 'örn. 120.000'}
              value={km}
              disabled={!activeYear}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '');
                setKm(digits ? formatTL(Number(digits)) : '');
              }}
            />
          </label>
        </div>

        {state === 'PRICEABLE' && pool && (
          <p
            className="rv-fade mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500"
            key={selection.join('/')}
          >
            Fiyat havuzu:{' '}
            <span className="font-semibold text-slate-800">{labelPath.join(' › ')}</span>{' '}
            — {formatTL(pool.n)} emsal ilan
          </p>
        )}
      </section>

      {/*
        KILITLI — bu bir hata degil, ticari sinir. Panel kapatilsa bile satir
        ekranda kalir ki kullanici neden ilerleyemedigini bilsin.
      */}
      {state === 'LOCKED' && lockedNode && (
        <div className="rv-rise mt-5 flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Lock size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {labelPath.join(' › ')} tam sürümde kullanılabilir
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Public demo sınırlı bir araç kataloğu içerir.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Tam Sürüm Bilgisi
          </button>
        </div>
      )}

      {/*
        KANIT YOK — kilitli DEGIL. Arac public demoda acik, ama kaynakta
        guncel emsali yok. Tam surumde de fiyat uretilmez; dolayisiyla bu
        satira "tam surum" CTA'si konmaz, yoksa satis vaadi yalan olur.
      */}
      {state === 'NO_PRICE_DATA' && (
        <div className="rv-rise mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-5">
          <Info size={18} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
          <div>
            <p className="text-sm font-bold text-slate-900">{labelPath.join(' › ')}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Bu araç için fiyat hesaplamak için yeterli güncel emsal bulunamadı.
              Yanlış bir fiyat göstermektense göstermiyoruz — bu araç uzman
              değerlendirmesine yönlendirilir.
            </p>
          </div>
        </div>
      )}

      {state === 'PRICEABLE' && pool && activeYear && !result && (
        <div className="rv-rise mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-5">
          <Info size={18} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
          <p className="text-sm leading-relaxed text-slate-600">
            Bu yıl için yeterli emsal yok. Yanlış bir fiyat göstermektense fiyat
            göstermiyoruz — bu araç uzman değerlendirmesine gider.
          </p>
        </div>
      )}

      {result && (
        /*
          Bolum fiyat OLUSTUGUNDA monte olur; sonraki secimlerde yerinde kalir
          ki sayilar eski degerden yenisine SAYARAK gitsin. Arac gecersizlesir
          veya kilitli bir araca gecilirse `result` null olur ve bolum ayni
          karede kalkar: yanlis araca takili eski fiyat ekranda kalmaz.
        */
        <section className="rv-result mt-5 space-y-4">
          <div className="rv-card rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-24px_rgba(15,23,42,0.28)] md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Tahmini piyasa değeri
                </div>
                <div className="mt-1 text-[2.25rem] font-extrabold leading-none tracking-tight tabular-nums text-slate-900 md:text-[2.75rem]">
                  {formatTL(shownMarketValue)}{' '}
                  <span className="text-xl font-semibold text-slate-400">TL</span>
                </div>
                <div className="mt-1.5 text-xs text-slate-500">
                  Emsal merkezi, girilen kilometreye göre düzeltilmiş
                </div>
              </div>

              <div className="rv-fade rv-delay-2 text-xs text-slate-500 sm:text-right">
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <TrendingUp size={13} className="shrink-0" aria-hidden />
                  <span className="font-bold text-slate-800">
                    {formatTL(result.directComparables)} gerçek emsal
                  </span>
                </div>
                {result.borrowedComparables > 0 && (
                  <div className="mt-1 sm:pr-[18px]">
                    + {formatTL(result.borrowedComparables)} yakın yıl emsali
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 sm:justify-end">
                  <span>Güven: %{result.confidencePct}</span>
                  <span
                    className="rv-confidence-track"
                    role="img"
                    aria-label={`Veri güveni yüzde ${result.confidencePct}`}
                  >
                    <span
                      className="rv-confidence-fill block"
                      style={{
                        width: `${Math.max(6, Math.min(100, result.confidencePct))}%`,
                        backgroundColor: confidenceTone(
                          result.confidencePct,
                          result.requiresManualApproval,
                        ),
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>

            {result.mileageAdjustment !== 0 && (
              <p className="rv-fade rv-delay-2 mt-4 text-xs text-slate-500">
                Kilometre düzeltmesi:{' '}
                <strong
                  className={
                    result.mileageAdjustment > 0 ? 'text-emerald-700' : 'text-amber-700'
                  }
                >
                  {result.mileageAdjustment > 0 ? '+' : ''}
                  {formatTL(result.mileageAdjustment)} TL
                </strong>{' '}
                (bu yılın ortalaması {formatTL(result.referenceMedianMileage)} km)
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rv-rise rv-delay-1 rv-card rounded-2xl border-2 border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Banknote size={17} className="text-slate-400" aria-hidden />
                Nakit alım — bugün
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">
                {formatTL(shownCashOffer)}{' '}
                <span className="text-base font-semibold text-slate-400">TL</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Araç aynı gün devredilir, ödeme peşin yapılır. Satış riski,
                ekspertiz, ilan ve bekleme maliyeti alıcıya aittir.
              </p>
            </div>

            <div className="rv-rise rv-delay-2 rv-card rounded-2xl border-2 border-sky-600 bg-sky-50/40 p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-700">
                  <Handshake size={17} aria-hidden />
                  Konsinye — elinize geçecek
                </div>
                <span className="rv-pop rv-delay-3 rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  +{formatTL(result.consignmentAdvantage)} TL
                </span>
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums text-sky-700">
                {formatTL(shownConsignmentNet)}{' '}
                <span className="text-base font-semibold text-sky-600/60">TL</span>
              </div>

              <dl className="rv-fade rv-delay-3 mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <dt>İlan fiyatı</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatTL(result.consignmentListingPrice)} TL
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Beklenen satış</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatTL(result.expectedSalePrice)} TL
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Komisyon</dt>
                  <dd className="font-semibold tabular-nums">
                    − {formatTL(result.consignmentCommission)} TL
                  </dd>
                </div>
                <div className="flex justify-between border-t border-sky-600/20 pt-1.5 text-slate-900">
                  <dt className="font-semibold">Elinize geçecek</dt>
                  <dd className="font-extrabold tabular-nums">
                    {formatTL(result.customerConsignmentNet)} TL
                  </dd>
                </div>
                <div className="flex justify-between pt-0.5">
                  <dt className="flex items-center gap-1">
                    <Clock size={11} aria-hidden /> Tahmini satış
                  </dt>
                  <dd className="font-semibold">
                    {result.estimatedDaysToSellMin}–{result.estimatedDaysToSellMax} gün
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {result.requiresManualApproval && (
            // Fiyat EKRANDA KALIR; uyari altina bilgilendirme olarak girer.
            // Kirmizi alarm degil: ters giden bir sey yok, sayinin arkasindaki
            // kanit ince.
            <div className="rv-rise rv-delay-3 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-5">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
              <div>
                <p className="text-sm font-bold text-amber-900">Uzman kontrolü önerilir</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
                  {result.manualApprovalReason}
                </p>
              </div>
            </div>
          )}

          <p className="rv-fade rv-delay-3 text-xs leading-relaxed text-slate-500">
            İlan fiyatı pazarlık payı taşır; komisyon beklenen satış üzerinden
            hesaplanır. Fiyatlar gerçek ilan verisinden türetilir; aracın
            hasar/boya durumu ve ekspertiz sonucuna göre nihai değer değişebilir.
            Veri tarihi: {new Date(data.generatedAt).toLocaleDateString('tr-TR')}.
          </p>
        </section>
      )}

      <UpgradeModal
        open={modalOpen && Boolean(lockedNode)}
        vehicleLabel={labelPath.join(' › ')}
        contactHref={contactHref}
        onClose={closeModal}
      />
    </>
  );
}
