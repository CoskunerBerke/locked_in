# MARKA VE İÇERİK GÜNCELLEME REHBERİ (CONTENT TODO)

Bu proje geçici marka bilgileri (`MARKA ADI`, `Ankara ve Türkiye geneli`, placeholder telefon/e-posta) ile hazırlanmıştır.
Gerçek marka bilgileriniz belli olduğunda yapılması gereken güncellemeler aşağıda listelenmiştir.

---

## 1. MARKA VE İLETİŞİM BİLGİLERİ

Tüm marka konfigürasyonu tek bir dosyadan yönetilmektedir:

**`src/config/brand.ts`**

Aşağıdaki alanları gerçek verilerinizle güncelleyin:

```typescript
export const brandConfig: BrandConfig = {
  brandName: 'Gerçek Marka Adınız',
  shortName: 'Kısa Ad',
  tagline: 'Sloganınız',
  description: 'Şirket Tanımınız',
  phone: '+90 850 123 45 67',
  whatsappNumber: '905551234567', // Başında + olmadan ülke kodlu numara
  email: 'info@gercekdomain.com',
  instagramUrl: 'https://instagram.com/gercek_hesabiniz',
  address: 'Açık Adresiniz',
  serviceArea: 'Hizmet Verilen Bölgeler',
  siteUrl: 'https://gercekdomain.com',
  legalCompanyName: 'Gerçek Şirket Ticari Unvanı LTD. ŞTİ.',
  indexingEnabled: true, // YAYINA ALIRKEN TRUE YAPIN!
};
```

---

## 2. GERÇEK LOGO DEĞİŞİMİ

Gerçek logonuzu SVG veya yüksek çözünürlüklü olarak hazırlayıp yalnızca aşağıdaki dosyayı değiştirin:

**`public/brand/logo.svg`**

Logo değiştirildiğinde Header, Footer, Mobil Menü, Open Graph ve Favicon otomatik olarak yeni logonuz ile güncellenecektir.

---

## 3. SEO İNDEXLEME AKTİF ETME

Proje varsayılan olarak `noindex, nofollow` durumundadır. Canlı domain eklendiğinde indexlemeyi açmak için:
- `src/config/brand.ts` içindeki `indexingEnabled` değerini `true` yapın.
- Veya Vercel / sunucu ortam değişkenlerinde `PUBLIC_INDEXING_ENABLED=true` tanımlayın.

---

## 4. MEDYA VE VİDEO YÜKLEME

Kendi özel tanıtım videonuz üretildiğinde (prompt rehberi için `docs/FLOW-VIDEO-PROMPT.md` dosyasına bakın):
- `public/videos/hero-desktop.webm`
- `public/videos/hero-desktop.mp4`
- `public/videos/hero-mobile.webm`
- `public/videos/hero-mobile.mp4`
- `public/videos/hero-poster.webp`

dosyalarını değiştirin.
