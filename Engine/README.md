# 👁️🤖 VisionScrape Engine (`ai-vision-scraper`)

<div align="center">

**Gelişmiş Çekirdek Motor (Core Engine) — Playwright Otomasyonu & Otonom Anti-Bot Altyapısı**

*VisionScrape'in kalbini oluşturan, Playwright Singleton yönetimi, Express REST API katmanı, Levenshtein tabanlı DOM Doğrulama servisi ve 3 Aşamalı Chaos Engine entegrasyonu.*

[![npm version](https://img.shields.io/npm/v/ai-vision-scraper.svg?style=for-the-badge&color=00c2ff&labelColor=1c2333)](https://www.npmjs.com/package/ai-vision-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-00e575.svg?style=for-the-badge&labelColor=1c2333)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript&labelColor=1c2333)](https://www.typescriptlang.org/)

</div>

---

## 🏛️ Mimari Tasarım ve Servis Yapısı

Engine, Express.js tabanlı stateless API rotaları ile Playwright Chromium otomasyonunu birleştiren mikroservis mimarisine sahiptir. 

```
┌────────────────────────────────────────────────────────┐
│                        HTTP API                        │
│             (/api/fetch-site, /api/analyze)            │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                      VisionEngine                      │
├────────────────────────────────────────────────────────┤
│  browserManager  │  fingerprintForge  │  humanBehavior │
│   (Singleton)    │   (Cihaz Maske)    │ (Kaos Motoru)  │
└────────┬─────────┴──────────┬──────────┴────────┬───────┘
         ▼                    ▼                   ▼
    [Chromium]          [Fingerprints]      [Bezier Path]
```

### 🧠 1. `browserManager.js` (Singleton Chromium)
Her scrape isteğinde yeni tarayıcı (`chromium.launch()`) başlatmak devasa CPU/RAM maliyeti doğurur.
- Sunucu açıldığında **tek bir Chromium** başlatılır.
- Gelen her istek için çerezleri, local storage'ı ve cache'i izole olan **`browser.newContext()`** (Gizli Sekme) oluşturulur.
- İstek bittiğinde context bellek sızıntısını (Zombie processes) engellemek için `finally` bloğunda kapatılır.
- **Headless "New" Modu:** Chrome'un gerçek motorunu kullanan yeni headless mimarisi aktif edilerek bot dedektörlerine karşı görünmezlik sağlanır.

### 🎭 2. `fingerprintForge.js` (Tarayıcı Parmak İzi Maskeleme)
- 10+ adet uyumlu Windows/Mac/Linux profili barındırır.
- WebGL renderer'ını spoof ederek GPU bilgilerini değiştirir.
- Canvas API çıktılarına mikro-gürültü ekler.
- `navigator` objesini maskeler.
- Domain tabanlı **Session Persistence** ile bir siteye hep aynı profilin gitmesini garanti eder.
- Dahili **Rate Limiter** ile aşırı istek atılmasını engeller.

### 🌐 3. `networkCloak.js` (TLS & HTTP/2 Header Ordering)
- İsteklerin HTTP/2 başlık sıralamasını Chrome'un birebir aynısı yapar (Cloudflare TLS parmak izi tespiti bypass).
- Google Chrome'a özel Client Hints (`sec-ch-ua-platform` vb.) başlıklarını doğru sırada yollar.
- Playwright ağ stack'ini enjekte ederek JA3 imzasını taklit eder.

### 🧑 4. `humanBehavior.js` (Kaos Motoru)
- **Bezier Mouse:** Fare hareketlerini kavisli ve hafif el titremeli Cubic Bezier eğrileriyle taklit eder.
- **Gaussian Click:** Elementlerin tam merkezine değil, Gaussian dağılımıyla rastgele piksellere tıklar.
- **Natural Scroll:** Okuma pauses'ları ve küçük yukarı kaydırmalarla sayfa içinde insansı gezinme sağlar.

---

## ⚙️ REST API Kurulumu & Yapılandırması

Motoru sunucu (REST API) modunda çalıştırmak için:

### 1. Bağımlılıkları Yükleyin
```bash
cd Engine
npm install
```

### 2. Ortam Değişkenleri (.env)
`Engine/.env` dosyası oluşturun ve şu yapılandırmayı girin:
```env
PORT=4000
API_SECRET_KEY=kendi-guclu-rastgele-anahtariniz
ALLOWED_ORIGINS=http://localhost:3000,https://sizin-front-endiniz.com
```

### 3. Build & Run
```bash
# TypeScript derleme
npm run build

# Geliştirici modu (Watch)
npm run dev

# Production modu
npm start
```

---

## 🔍 API Rotaları Detayları

### 1. `POST /api/fetch-site` (Scrape Aşaması)
Belirtilen URL'e tarayıcıyı stealth modunda ve insansı hareketlerle uçurur. Sayfanın **görsel ekran görüntüsünü (Base64 PNG)** ve **saf DOM içeriğini** döner.

**Body:**
```json
{
  "url": "https://news.ycombinator.com",
  "stealth": true,
  "lightBehavior": false
}
```

**Response:**
```json
{
  "success": true,
  "screenshot": "data:image/png;base64,iVBORw0KGgo...",
  "dom": "<body>...</body>",
  "pageTitle": "Hacker News",
  "dimensions": { "scrollWidth": 1920, "scrollHeight": 1080 }
}
```

### 2. `POST /api/analyze` (Yapay Zeka & Doğrulama Aşaması)
Alınan Base64 ekran görüntüsünü Multimodal LLM'e yollayıp analiz ettirir ve dönen veriyi **Levenshtein similarity** doğrulamasından geçirerek halüsinasyonları temizler.

**Body:**
```json
{
  "croppedImage": "data:image/png;base64,iVBORw0KGgo...",
  "dom": "<body>...</body>"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "label": "Yazar Adı",
      "value": "Paul Graham",
      "selector": ".author-tag",
      "confidenceScore": 0.95,
      "isValidated": true,
      "similarity": 1.0
    }
  ]
}
```

---

## 🛡️ Otonom Ajanlar ve Geliştiriciler için Katı Kurallar

Engine üzerinde geliştirme yaparken aşağıdaki mimari standartlara uyulması **ZORUNLUDUR**:

1. **Agnostic Logic:** `src/VisionEngine.ts` içerisine hiçbir AI API key'i veya provider kodu doğrudan gömülemez. Key'ler her zaman callback aracılığıyla DI üzerinden aktarılmalıdır.
2. **Resource Disposal:** İstek bitiminde `context` mutlaka Express `finally` bloklarında `.close()` ile kapatılmalıdır. Aksi halde zombi işlemler RAM'i bitirir.
3. **Fail-Closed Security:** `.env` dosyasında `API_SECRET_KEY` atanmamışsa, sistem hata vererek istekleri reddetmelidir.
4. **Resilience:** Tüm ağ navigasyonları ve JSON parsing süreçleri `try-catch` blokları içinde ele alınmalı, Node.js process'ini çökertecek unhandled error fırlatılmamalıdır.
