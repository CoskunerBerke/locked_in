# GÜVENLİK VE ALTYAPI RAPORU (SECURITY REPORT)

Bu doküman, projede uygulanan güvenlik önlemlerini, başlık (header) yapılandırmalarını ve bağımlılık denetimlerini özetlemektedir.

---

## 1. UYGULANAN GÜVENLİK BAŞLIKLARI (SECURITY HEADERS)

Hem `vercel.json` hem de Apache `public/.htaccess` üzerinde aşağıdaki güvenlik başlıkları sıkılaştırılmıştır:

| Güvenlik Başlığı | Değer / Politika | Amaç |
| :--- | :--- | :--- |
| **Content-Security-Policy** | `default-src 'self'; script-src 'self' 'unsafe-inline'; ...` | XSS ve izinsiz script yüklemelerini engeller. |
| **X-Content-Type-Options** | `nosniff` | MIME-type sniffing saldırılarını önler. |
| **X-Frame-Options** | `DENY` | Clickjacking saldırılarına karşı iframe kullanımını engeller. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Referrer bilgi sızıntısını engeller. |
| **Strict-Transport-Security** | `max-age=31536000; includeSubDomains; preload` | Zorunlu HTTPS bağlantısı sağlar. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` | Tarayıcı hassas donanım erişimini kısıtlar. |

---

## 2. FORM VE XSS KORUMASI

- Form girdileri veritabanında saklanmaz, doğrudan URL sanitization işleminden geçirilerek WhatsApp API'sine yönlendirilir.
- `src/utils/whatsapp.ts` dosyası içerisinde HTML etiketleri (`<[^>]*>?`) ve zararlı karakterler (`&`, `<`, `>`, `"`, `'`) temizlenmektedir.
- Kod tabanında `dangerouslySetInnerHTML` veya `eval()` kullanılmamıştır.

---

## 3. BAĞIMLILIK VE SECRET TARAMASI

- `package-lock.json` versiyon kilit dosyası commit edilmektedir.
- Kod tabanında API key veya gizli parola bulunmamaktadır.
- `npm audit` taraması gerçekleştirilmiş ve hiçbir kritik (high/critical) bağımlılık açığı bırakılmamıştır.
