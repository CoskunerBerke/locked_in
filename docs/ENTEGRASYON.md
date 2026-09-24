# UYGULAMA ENTEGRASYON STANDARDI — rentyazilim.com

Başka Claude Code sohbetlerinde geliştirilen uygulamaların rentyazilim.com'a
nasıl bağlandığını tanımlar. Uygulama sohbeti **handoff bırakır**, Locked_in
sohbeti **entegre eder, test eder, build alır ve FileZilla manifesti verir**.

---

## 1. Roller

> External application repositories own their application logic.
> Locked_in owns www.rentyazilim.com and the public integration/showcase layer.

| | Uygulama deposu (NakitGaraj, QR Menü, …) | Locked_in |
|---|---|---|
| **Sahip olduğu** | backend, iş mantığı, DB, crawler, özel veri, tam uygulama, iç araçlar | ana sayfa + 3D deneyim, Header/Footer/nav, hizmet/kurumsal sayfalar, SEO, marka, public demolar, temizlenmiş veri, API istemci katmanı, CTA |
| **Yazdığı yer** | yalnızca kendi deposu | yalnızca bu depo |
| **Asla** | Locked_in'e doğrudan yazmaz | uygulamanın deposunu değiştirmez; tam kaynak kodunu içine almaz (monorepo olmaz) |

Tam ürün **her zaman** kendi deposunda kalır. Sitede yalnızca bilerek
sınırlandırılmış bir **public demo** veya tanıtım bulunur.

---

## 2. Handoff (uygulama → Locked_in)

Uygulama sohbeti hazır olduğunda şunları bildirir (kullanıcıya veya site
oturumuna mesajla):

1. **Ürün adı ve slug** — URL olur: `/<slug>/`
2. **Tür** — `static-demo` / `api-client` / `showcase` (aşağıda)
3. **Kaynak** — depo adı, branch, commit SHA
4. **Teslim edilenler**
   - `static-demo`: temizlenmiş veri artefaktı **veya** onu üreten deterministik
     export script'i; React bileşen(ler)i
   - `api-client`: public API taban URL'i (HTTPS), uç noktalar, CORS izni verilen
     origin (`https://www.rentyazilim.com`), örnek istek/yanıt
5. **Demo sınırı** — neyin açık, neyin kilitli olduğu ve bunun VERİDE nasıl
   uygulandığı
6. **CTA** — tam sürüm için ne teklif edilir (WhatsApp / iletişim sayfası)
7. **Kabul senaryosu** — sitede birebir tutması gereken en az bir referans sonuç
   (ör. Opel Corsa 1.5 TD ECO 2000 → FMV 225.000 / nakit 190.000 / 20 emsal / %88)

Uygulama sohbeti bu depoya dosya yazmaz. Bileşen kodu gerekiyorsa kendi
deposunda bir klasörde bırakır; site oturumu alır ve uyarlar.

---

## 3. Sitedeki yerleşim (convention)

| Ne | Nerede |
|---|---|
| Sayfa kabuğu | `src/pages/<slug>.astro` — **her zaman** `Layout` (Header, Footer, MobileMenu, MegaMenu, marka) |
| Bileşenler | `src/components/<slug>/` |
| Stil | `src/styles/<slug>.css`, sınıflar kısa önekle kapsanır (ör. `rv-`) — global CSS yok |
| Demo yapılandırması | `src/config/<slug>*.config.ts` (allowlist vb.) |
| Statik veri | `public/data/…` (dosya adı ürüne özgü) |
| Export script'i | `scripts/build-<…>.mjs` + `package.json` script'i |
| Testler | `tests/unit/<…>.test.ts` (parite, sızıntı), `tests/e2e/<slug>.spec.ts` |
| **Kayıt** | `src/config/products.ts` — route, tür, nav, kaynak depo/branch/revizyon, veri parmak izi, CTA |

`tests/unit/productRegistry.test.ts` kaydı dosya sistemine karşı doğrular:
sayfa/bileşen/veri var mı, veri parmak izi kayıtla aynı mı, nav yerleşimi
Header ve MobileMenu ile tutarlı mı.

Uygulamalar kendi eski Header/Footer'ını getirmez. Kullanıcı Ana Sayfa →
ürün → Hizmetler arasında aynı sitede kaldığını hisseder.

### Navigation

Mevcut üst menü: **Ana Sayfa · Araç Değerleme · Hizmetler · Projeler ·
Kurumsal · Yorumlar · İletişim**. Yeni ürün **varsayılan olarak üst menüye
girmez** (`nav: 'projects'`); Projeler sayfasından veya doğrudan linkle açılır.
Üst menüye almak ayrı bir karardır.

---

## 4. Static demo modeli

```
KAYNAK UYGULAMA ──(deterministik, temizleyen export)──▶ public/data/…json ──▶ /<slug>/
```

- Export **salt okunur** çalışır; kaynak depoya yazmaz.
- **Deterministik:** aynı kaynak + aynı allowlist = aynı bayt. Zaman damgası
  çalıştırma anı değil kaynağın kendi zamanıdır.
- Artefakt bir `sourceFingerprint` taşır; `products.ts` içindeki
  `source.dataFingerprint` ile aynı olmalıdır (test zorlar).
- **Kilit veride uygulanır.** Kapalı içeriğin fiyatı, kanıtı, havuzu artefakta
  hiç girmez. UI'da "Tam sürüm" göstermek güvenlik değildir.
- Build kaynak depoya ihtiyaç duymaz; `dist/` tek başına çalışır.

Örnek (Araç Değerleme):

```bash
npm run demo:vehicle-data                              # public/data/public-vehicle-demo.json
PUBLIC_DEMO_OUT=/tmp/x.json npm run demo:vehicle-data  # yalnızca doğrulama
```

Veri yenilenince: `products.ts` → `source.revision` + `dataFingerprint`
güncellenir, parite/sızıntı testleri çalıştırılır.

---

## 5. API tabanlı uygulamalar

```
www.rentyazilim.com/<slug>  ──▶  Locked_in frontend  ──HTTPS──▶  uygulamanın KENDİ backend'i
```

- Backend Locked_in'e **gömülmez**; SSR/API rotası/sunucu eklenmez
  (`output: 'static'`).
- Taban URL `import.meta.env.PUBLIC_<SLUG>_API_URL` ile verilir; `localhost`
  veya iç ağ adresi production build'e girmez (sızıntı testi yakalar).
- İstemciye giden her şey public'tir: API anahtarı, token, admin bilgisi
  **bundle'a girmez**. Yetki gerekiyorsa backend kendi public uç noktasını sunar.
- **CSP:** canlıdaki `public/.htaccess` şu an `connect-src 'self'` —
  başka origin'e `fetch` tarayıcıda **engellenir**. API ürünü eklerken ilgili
  origin `connect-src`'ye eklenir (`.htaccess`, gerekiyorsa `public/_headers` ve
  `vercel.json` ile birlikte) ve `.htaccess` manifestte ayrıca belirtilir.
- Backend tarafında CORS yalnızca `https://www.rentyazilim.com` ve
  `https://rentyazilim.com` origin'lerine izin verir.

---

## 6. Güvenlik — sitede ASLA bulunmaz

DB dosyaları · özel API anahtarları · cookie · Chrome profilleri · crawler
kimlik bilgileri · müşteri verisi · tam/özel fiyat veri setleri · admin
bilgileri · backend secret'ları · `.env` değerleri · kaynak haritaları (`.map`)
· yerel yollar (`C:/…`) · `localhost`.

NakitGaraj için özellikle: `backend/data`, `dev.db`, corpus, haftalık state,
yayın geçmişi, Chrome extension, scheduler, **tam `demo-market.json`**.

`tests/unit/publicDemoLeak.test.ts` hem `public/` hem `dist/` üzerinde bunu
tarar; kaynak veri seti makinede varsa kapalı dalların **tüm** havuz
kimliklerini arar.

---

## 7. Build ve FileZilla deployment

Production: `Locked_in → npm run build → dist/ → FileZilla → /httpdocs → www.rentyazilim.com`.
Bu depo Vercel production kaynağı değildir. **Yüklemeyi kullanıcı elle yapar.**
Claude FTP/FileZilla kullanmaz, sunucuya bağlanmaz, canlı dosya silmez.

```bash
npm run check && npm run lint && npm run test:unit
npm run build
npm run test:e2e
npm run deploy:manifest     # dist/ ↔ canlı: NEW / OVERWRITE / UNVERIFIED / SAME
```

- Manifest canlı siteyi salt okunur GET ile bayt bayt karşılaştırır; yalnızca
  **NEW** ve **OVERWRITE** yüklenir. **SAME** dosyalara dokunulmaz.
- `.htaccess` HTTP ile okunamaz (UNVERIFIED): yalnızca git'te değiştiyse yüklenir.
- Canlıda olup `dist/`'te olmayan dosyalar raporlanamaz; silme önerilmez.
- **FileZilla aktarım türü: İkili (Binary).** Otomatik/ASCII mod `.svg`, `.html`,
  `.js` dosyalarında satır sonlarını değiştirir (canlıdaki `brand/logo.svg`
  bu yüzden bozulmuştu).
- Header, MobileMenu veya global stil değişirse **her sayfanın HTML'i** değişir;
  manifest bunu gösterir.

---

## 8. Yeni uygulama ekleme checklist'i

- [ ] Handoff alındı: slug, tür, kaynak depo/branch/SHA, demo sınırı, CTA, kabul senaryosu
- [ ] `src/pages/<slug>.astro` — `Layout` + `Breadcrumb`, `activePage="/<slug>/"`
- [ ] `src/components/<slug>/` — kendi Header/Footer'ı yok, stil önekli
- [ ] Veri: export script'i veya handoff'taki artefakt → `public/data/…`; deterministik
- [ ] API ürünü ise: `PUBLIC_*` env, CSP `connect-src`, CORS, localhost yok
- [ ] `src/config/products.ts` kaydı (nav varsayılanı `projects`)
- [ ] Testler: parite (kabul senaryosu), sızıntı, `tests/e2e/<slug>.spec.ts`
- [ ] `npm run check`, `lint`, `test:unit`, `build`, `test:e2e` yeşil
- [ ] Masaüstü + mobil QA, konsol hatası yok, ana sayfa 3D ve MegaMenu sağlam
- [ ] Commit (ilgisiz dosyalar hariç) — push/deploy yok
- [ ] `npm run deploy:manifest` → kullanıcıya NEW / OVERWRITE / DO NOT TOUCH listesi

---

## Kayıtlı entegrasyonlar

| Ürün | Route | Tür | Kaynak | Revizyon |
|---|---|---|---|---|
| Araç Değerleme | `/arac-degerleme/` | static-demo, public-demo | NakitGaraj (`NakitGaraj-market-refresh`) | `feature/demo-ui-polish-v1@23c06c3`, veri `8f0055f4b472` |

Güncel kayıt her zaman `src/config/products.ts`'tir.
