# PREMIUM DİJİTAL AJANS WEB SİTESİ (LUMINOUS DIGITAL SYSTEMS)

Bu proje; Astro, TypeScript (strict mode), Tailwind CSS, React Islands, Motion ve React Three Fiber (3D) kullanılarak geliştirilmiş production-ready, yüksek dönüşüm odaklı dijital ajans web sitesidir.

---

## 🛠️ Mimari ve Teknolojiler

- **Framework:** [Astro v5](https://astro.build/) (`output: 'static'`)
- **Tip Güvenliği:** TypeScript (Strict Mode)
- **Stil & Tasarım:** Tailwind CSS (Luminous Digital Systems Tasarım Sistemi)
- **Bileşenler:** React Islands (`@astrojs/react`)
- **3D & Animasyon:** Motion for React & React Three Fiber (Lazy Loaded)
- **Test:** Vitest (Birim Testleri) & Playwright (E2E Testleri)
- **Linter & Formatter:** ESLint & Prettier
- **Hosting:** Vercel & Statik Apache/cPanel (`.htaccess` dahil)

---

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
npm ci
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

### 3. Testleri Çalıştırın
```bash
# Birim testleri
npm run test:unit

# Tip kontrolü ve Linting
npm run check
npm run lint

# E2E Playwright testleri
npm run test:e2e
```

### 4. Production Derleme (Build)
```bash
npm run build
```
Derleme çıktısı `dist/` klasörüne oluşturulacaktır. Klasik hostinge yüklemek için `docs/SHARED-HOSTING.md` rehberini inceleyin.

---

## 📄 Dokümantasyon Rehberi

- [`docs/SHARED-HOSTING.md`](docs/SHARED-HOSTING.md) — FileZilla ve cPanel / Plesk yükleme adımları.
- [`docs/CONTENT-TODO.md`](docs/CONTENT-TODO.md) — Marka ve logo değişimi için yapılacaklar listesi.
- [`docs/FLOW-VIDEO-PROMPT.md`](docs/FLOW-VIDEO-PROMPT.md) — Google Flow 8s döngüsel arka plan video promptu.
- [`docs/SECURITY-REPORT.md`](docs/SECURITY-REPORT.md) — Güvenlik başlıkları ve CSP detayları.
