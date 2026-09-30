<p align="center">
  <img src="public/brand/logo.png" alt="Rent Yazılım logo" width="360">
</p>

# Rent Yazılım — Digital Agency Website

**Corporate website for Rent Yazılım, a web design and digital services agency in Çankaya, Ankara.**

![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

**Live:** [rentyazilim.com](https://rentyazilim.com)

Rent Yazılım was founded by [Berke Coşkuner](https://github.com/CoskunerBerke), who also designed and developed this site.

## Overview

A fast, static marketing site for an agency that offers web design, SEO, Google Maps (Business Profile) optimisation, mobile apps, Instagram ads and Yemeksepeti / Trendyol Yemek panel consulting. It is built with Astro (static output) and React islands, with a lightweight canvas animation in the hero and a WhatsApp-based contact form (no backend, no database).

## Features

- **Home page** — hero with an interactive "solar system" animation in which each planet is a service, about overview, detailed services, portfolio showcase, work process, "why us", FAQ and final call-to-action
- **Navigation** — header with a mega menu and a mobile menu (React islands), breadcrumbs on inner pages, and an About page (`/hakkimizda`)
- **Service pages** (`/hizmetler/*`) — web design, SEO, Google Maps, mobile apps, Instagram ads, Yemeksepeti / Trendyol Yemek
- **Projects page** (`/projeler`) — portfolio of delivered websites with screenshots and live links
- **Akademi blog** (`/akademi`) — Markdown articles managed with Astro content collections (typed schema)
- **Contact** — WhatsApp form; input is sanitised and turned into a pre-filled WhatsApp message
- **Legal pages** — privacy policy, terms of use, KVKK notice, custom 404
- **SEO** — meta tags component, Schema.org JSON-LD, automatic sitemap, `robots.txt`, and an indexing on/off switch via env variable
- **Animation** — the hero animation is drawn on an HTML canvas with `requestAnimationFrame` (no WebGL needed)
- **Security** — strict headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) in `public/.htaccess`; see `docs/SECURITY-REPORT.md`
- **Quality** — Vitest unit tests, Playwright E2E tests, ESLint + Prettier, `astro check`; CI, CodeQL and Dependabot on GitHub

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Astro 5 (`output: 'static'`), React 19 islands |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3, clsx, tailwind-merge |
| Animation | HTML canvas (hero) |
| Icons | lucide-react |
| Testing | Vitest, Playwright |
| Tooling | ESLint, Prettier, GitHub Actions |

## Project structure

```
locked_in/
├── public/                 # logo, favicons, planet textures, project screenshots, .htaccess, robots.txt
├── src/
│   ├── components/         # common (header, footer, SEO), hero, sections, form, 3d
│   ├── config/brand.ts     # single place for brand name, contact info, colours, site URL
│   ├── content/blog/       # Akademi articles (Markdown)
│   ├── data/               # portfolio projects
│   ├── layouts/            # base layout
│   ├── pages/              # routes: index, hizmetler/*, projeler, akademi, iletisim, legal pages
│   └── utils/              # JSON-LD, validators, WhatsApp helpers
├── tests/                  # unit (Vitest) and e2e (Playwright)
├── docs/                   # hosting guide, security report, content notes
└── astro.config.mjs
```

## Getting started

Requirements: Node.js (CI uses Node 22).

```bash
npm ci              # install dependencies
npm run dev         # start the dev server
npm run build       # production build -> dist/
npm run preview     # preview the production build
```

Quality checks:

```bash
npm run check       # Astro + TypeScript type check
npm run lint        # ESLint
npm run test:unit   # Vitest
npm run test:e2e    # Playwright
npm run test:all    # everything above
```

### Environment variables

Copy `.env.example` to `.env`:

| Name | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Canonical site URL (used for sitemap and SEO) |
| `PUBLIC_BASE_PATH` | Base path if the site is served from a sub-folder |
| `PUBLIC_INDEXING_ENABLED` | `true` to allow search engine indexing |

## Deployment

The build output in `dist/` is fully static. It can be served from Vercel or from classic shared hosting (Apache / cPanel / Plesk); `public/.htaccess` adds clean URLs and security headers. Step-by-step FTP upload instructions are in [`docs/SHARED-HOSTING.md`](docs/SHARED-HOSTING.md).

---

## Türkçe

**Rent Yazılım** için geliştirilmiş kurumsal web sitesi. Rent Yazılım, Çankaya / Ankara merkezli bir web tasarım ve dijital hizmetler ajansıdır.

**Canlı:** [rentyazilim.com](https://rentyazilim.com)

Rent Yazılım, [Berke Coşkuner](https://github.com/CoskunerBerke) tarafından kurulmuştur; bu site de onun tarafından tasarlanıp geliştirilmiştir.

### Genel bakış

Web tasarım, SEO, Google Maps (İşletme Profili) optimizasyonu, mobil uygulama, Instagram reklamları ve Yemeksepeti / Trendyol Yemek panel danışmanlığı hizmetlerini tanıtan hızlı, statik bir site. Astro (statik çıktı) ve React Islands ile geliştirildi; ana sayfadaki animasyon hafif bir canvas ile çizilir, iletişim formu WhatsApp üzerinden çalışır (sunucu ve veritabanı yoktur).

### Özellikler

- **Ana sayfa** — her gezegenin bir hizmeti temsil ettiği etkileşimli "güneş sistemi" animasyonlu hero, hakkımızda özeti, detaylı hizmetler, portfolyo, çalışma süreci, neden biz, SSS ve çağrı alanı
- **Gezinme** — mega menü ve mobil menü, iç sayfalarda breadcrumb, Hakkımızda sayfası (`/hakkimizda`)
- **Hizmet sayfaları** (`/hizmetler/*`) — web sitesi tasarımı, SEO, Google Maps, mobil uygulama, Instagram reklamları, Yemeksepeti / Trendyol Yemek
- **Projeler** (`/projeler`) — teslim edilen sitelerin ekran görüntüleri ve canlı bağlantıları
- **Akademi** (`/akademi`) — Astro content collections ile yönetilen Markdown blog yazıları
- **İletişim** — girdileri temizlenen ve hazır WhatsApp mesajına dönüştüren form
- **Yasal sayfalar** — gizlilik politikası, kullanım koşulları, KVKK aydınlatma metni, 404
- **SEO** — meta etiketleri, Schema.org JSON-LD, otomatik sitemap, `robots.txt` ve ortam değişkeniyle indeksleme anahtarı
- **Güvenlik** — `public/.htaccess` içinde CSP, HSTS ve diğer güvenlik başlıkları
- **Kalite** — Vitest birim testleri, Playwright E2E testleri, ESLint, Prettier; GitHub Actions CI, CodeQL ve Dependabot

### Kurulum

```bash
npm ci
npm run dev        # geliştirme sunucusu
npm run build      # dist/ klasörüne statik çıktı
npm run test:all   # tip kontrolü, lint, birim ve E2E testleri
```

Ortam değişkenleri (`.env.example`): `PUBLIC_SITE_URL`, `PUBLIC_BASE_PATH`, `PUBLIC_INDEXING_ENABLED`.

### Yayınlama

`dist/` klasörü tamamen statiktir; Vercel'de veya klasik hostingde (Apache / cPanel / Plesk) yayınlanabilir. FileZilla ile yükleme adımları [`docs/SHARED-HOSTING.md`](docs/SHARED-HOSTING.md) dosyasındadır.

---

Built by [Berke Coşkuner](https://github.com/CoskunerBerke)
