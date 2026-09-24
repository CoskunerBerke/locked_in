# Locked_in — www.rentyazilim.com

External application repositories own their application logic. Locked_in owns
www.rentyazilim.com and the public integration/showcase layer.

- Bu depo sitenin tamamının source of truth'udur: ana sayfa/3D deneyim,
  Header/Footer/nav, hizmet ve kurumsal sayfalar, SEO, marka, public ürün
  demoları ve entegrasyonlar.
- Diğer uygulamalar (NakitGaraj, QR Menü, …) kendi depolarında yaşar. Bu
  depodan yapılan görevlerde **dış depolar değiştirilmez**; buraya yalnızca
  temizlenmiş public demo/veri/istemci katmanı gelir. Monorepo olmaz.
- Entegrasyon standardı, handoff formatı, güvenlik kuralları ve checklist:
  `docs/ENTEGRASYON.md`. Ürün kaydı: `src/config/products.ts`.

## Deployment

`npm run build` → `dist/` → kullanıcı FileZilla ile **elle** `/httpdocs`'a yükler.
Vercel production kaynağı değildir.

- Claude FTP/FileZilla kullanmaz, sunucuya bağlanmaz, canlı dosya silmez,
  DNS değiştirmez, push/deploy yapmaz (istenmedikçe).
- Build sonrası `npm run deploy:manifest` ile canlıyla karşılaştırıp yalnızca
  NEW / OVERWRITE dosyalarını listeler. FileZilla aktarım türü: Binary.
- Canlı site `experiment/home-planet-experience-v3` dalından üretilir; `main`
  bu dalın gerisindedir.

## Çalışma kuralları

- Başlamadan `git status`: başka oturumların bıraktığı değişiklikler olabilir;
  dokunma, silme, stash/reset yapma, commit'e alma.
- Kök dizindeki `dist.zip`, `referencesflowflow-*.mp4` gibi dosyalar commit'e girmez.
- `.claude/worktrees/*` diğer oturumların kopyalarıdır; körlemesine merge edilmez.
- Çalışan navigation, 3D ana sayfa ve production davranışı sebepsiz değiştirilmez.
