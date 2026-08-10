# FILEZILLA VE KLASİK HOSTİNG (cPanel / DirectAdmin / Plesk) KURULUM REHBERİ

Bu doküman, Astro ile derlenen statik `dist/` klasörünün FileZilla kullanılarak klasik bir web hosting sunucusuna nasıl yükleneceğini adım adım anlatmaktadır.

---

## 1. YEREL SUNUCUDA DERLEME (BUILD)

1. Terminali açın ve bağımlılıkları doğrulayın:
   ```bash
   npm ci
   ```
2. Statik çıktı almak için projeyi derleyin:
   ```bash
   npm run build
   ```
3. Derleme tamamlandığında proje dizininde `dist/` adında bir klasör oluşacaktır.

---

## 2. FILEZILLA İLE SUNUCUYA BAĞLANMA

1. **FileZilla** uygulamasını açın.
2. Sunucu sağlayıcınızdan alınan FTP / SFTP bilgilerini girin:
   - **Sunucu (Host):** `ftp.domaininiz.com` veya `IP Adresi`
   - **Kullanıcı Adı (Username):** FTP kullanıcı adı
   - **Parola (Password):** FTP parolası
   - **Port:** FTP için `21`, SFTP için `22`
3. **Hızlı Bağlan** butonuna tıklayın.

---

## 3. DOSYALARI YÜKLEME (PÜF NOKTASI)

> [!IMPORTANT]
> **DİKKAT:** Sunucuya `dist` klasörünün kendisini SÜRÜKLEMEYİN! `dist` klasörünün **İÇİNDEKİ DOSYALARI VE KLASÖRLERİ** yüklemeniz gerekmektedir.

1. Sağ taraftaki (Uzak Sunucu) alanda kök dizine gidin:
   - cPanel / DirectAdmin sunucularda: `public_html/`
   - Plesk sunucularda: `httpdocs/`
2. Eğer mevcut eski bir site varsa, güvenlik amacıyla eski dosyaları sunucuda `yedek_yoldari/` klasörüne taşıyın.
3. Sol taraftaki (Yerel Bilgisayar) alanda projenizdeki `dist/` klasörünün içine girin.
4. `dist/` içerisindeki tüm dosya ve klasörleri (`index.html`, `_astro/`, `hizmetler/`, `.htaccess`, `site.webmanifest` vb.) seçin.
5. Sağ tıklayıp **Yükle (Upload)** deyin.

---

## 4. .HTACCESS VE HTTPS KONTROLÜ

1. FileZilla üst menüsünden **Sunucu -> Gizli Dosyaları Göster** seçeneğinin açık olduğundan emin olun.
2. `dist/.htaccess` dosyasının `public_html/` içine yüklendiğini doğrulayın.
3. `.htaccess` dosyası otomatik olarak:
   - HTTP trafiğini HTTPS'e yönlendirir.
   - Dizin listelemeyi kapatır.
   - Güvenlik başlıklarını (CSP, HSTS) aktif eder.
   - WebM, WebP mime türlerini tanıtır.

---

## 5. YAYIN SONRASI TEST LİSTESİ

- [ ] Ana sayfa açılıyor mu? (`https://domaininiz.com`)
- [ ] Hizmet detay sayfaları çalışıyor mu? (`/hizmetler/web-sitesi-tasarimi/`)
- [ ] Hero videosu/poster fallback yükleniyor mu?
- [ ] 404 sayfası doğru çalışıyor mu? (`https://domaininiz.com/rastgele-sayfa`)
- [ ] WhatsApp butonları doğru telefon numarasına yönlendiriyor mu?
- [ ] SSL sertifikası (HTTPS) yeşil kilit simgesi gösteriyor mu?
