# 👁️🤖 VisionScrape (`ai-vision-scraper`) — v1.0.5

<div align="center">

**Görsel Odaklı (Visual-first) Veri Kazıma & Otonom Kaos Motoru**

*Geleneksel DOM ve CSS Seçici Kaosuna Son! Web sitelerini kodundan değil, tıpkı bir insan gibi **GÖRÜNÜMÜNDEN** okuyan, 3 Katmanlı Anti-Bot Kalkanına sahip yeni nesil veri çıkarma motoru.*

[![npm version](https://img.shields.io/npm/v/ai-vision-scraper.svg?style=for-the-badge&color=00c2ff&labelColor=1c2333)](https://www.npmjs.com/package/ai-vision-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-00e575.svg?style=for-the-badge&labelColor=1c2333)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript&labelColor=1c2333)](https://www.typescriptlang.org/)
[![Anti-Bot Status](https://img.shields.io/badge/Anti--Bot-100%25%20Bypass-ff3838?style=for-the-badge&labelColor=1c2333)](#-3-aşamalı-anti-bot-kalkanı-chaos-engine)

</div>

---

> [!IMPORTANT]  
> **DOM Odaklı Scraping Dönemi Tamamen Kapanmıştır!**  
> Tailwind CSS derlemeleri, dinamik React/Vue class'ları, Shadow DOM şifrelemeleri ve Cloudflare Turnstile / reCAPTCHA v3 duvarları geleneksel parser'ları anında çökertir. VisionScrape, web'i **görsel bir tuval** olarak işler ve Multimodal LLM gücüyle veri çıkarır. Site tasarımı baştan aşağı değişse bile kodunuz kesintisiz çalışmaya devam eder.

---

## 🚀 Vizyon ve Mimari Felsefe

VisionScrape, otonom yapay zeka ajanlarının ve modern geliştiricilerin hiçbir kod güncellemesi yapmadan, internetteki her türlü veriye kesintisiz erişebilmesi için 3 temel sütun üzerine inşa edilmiştir:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              VisionScrape                              │
├────────────────────────────────────────────────────────────────────────┤
│  1. FINGERPRINT FORGE   │   2. NETWORK CLOAK    │   3. CHAOS ENGINE    │
│  (Cihaz Parmak İzi)     │   (TLS/JA3 Maskeleme) │   (İnsansı Davranış) │
└─────────────┬───────────────────┬───────────────────┬──────────────────┘
              ▼                   ▼                   ▼
      [WebGL & Canvas]     [Chrome Headers]     [Bezier Mouse &]
      [Battery Spoofing]   [Cookie Management]  [Natural Scroll]
```

1. **Özgür Yapay Zeka Mimarisi (Agnostic Providers):** Sisteme hiçbir LLM SDK'sı kilitli değildir. Callback tabanlı DI (Dependency Injection) yapısı sayesinde anlık olarak **Gemini 2.5, GPT-4o, Claude 3.5 Sonnet** veya lokal modelinize geçiş yapabilirsiniz.
2. **Katı JSON Şeması Dayatması (Strict JSON):** LLM'lerin sohbet etme ve markdown üretme eğilimleri akıllı filtreler ve agresif prompt sanitization katmanımızla (`cleanJsonResponse`) tamamen engellenir.
3. **Hibrit DOM Doğrulama (Hybrid Validation):** Yapay zeka halüsinasyonlarını sıfıra indirmek için arka planda Levenshtein mesafesini ve fuzzy-matching algoritmalarını hesaplayan cheerio tabanlı yerel doğrulama motoru çalışır.

---

## 🛡️ 3 Aşamalı Anti-Bot Kalkanı (Chaos Engine)

Cloudflare, DataDome, Akamai ve reCAPTCHA v3 gibi devasa koruma duvarlarını aşmak için tarayıcıyı tamamen "insansılaştıran" otonom sistem:

### 1. 🎭 Tarayıcı Parmak İzi (Fingerprint Forge)
Sıradan otomasyon araçları kendilerini anında ele verir. VisionScrape her istek için **tutarlı ve dinamik cihaz profilleri** oluşturur:
- **WebGL Spoofing:** Bot olduğunu belli eden `"Google SwiftShader"` yerine `"Intel Iris OpenGL Engine"`, `"NVIDIA GeForce"`, `"Apple M3"` gibi gerçekçi GPU verilerini enjekte eder.
- **Canvas Noise:** Canvas parmak izi takipçilerine karşı canvas çıktılarına gözle görülmeyen piksel gürültüleri ekleyerek benzersiz imza üretir.
- **Navigator Override:** `navigator.webdriver` bayrağını yok eder, sahte batarya durumu, bellek miktarı, işlemci çekirdek sayısı ve gerçekçi tarayıcı plugin listesi sunar.
- **Session Persistence:** Aynı domain'e yapılan isteklerde tutarlı profili koruyarak rate limitleri gevşetir.

### 2. 🌐 TLS/JA3 Maskeleme (Network Cloak)
Headers ne kadar kusursuz olursa olsun, paketin TLS şifrelenme şeklinden bot olduğunuz anlaşılır.
- **Chrome Header Order:** HTTP/2 protokolündeki başlıkları Chrome'un tam sırasıyla (`sec-ch-ua` ile başlayan tam set) gönderir.
- **Dual Fetch Strategy:** Doğrudan istekler için Chrome-mimicking ağ katmanı sunarken, en karmaşık durumlar için Playwright'ın kendi ağ stack'ini (`fetchViaPage`) kullanarak kusursuz JA3 imzası sağlar.
- **Cookie Jar:** Sayfalardan gelen güvenlik cookie'lerini otomatik hafızada tutarak Cloudflare challenge'larını aşar.

### 3. 🧑 İnsansı Davranış Motoru (Chaos Engine)
Siber güvenlik duvarlarının en çok baktığı şey fare hareketleri ve tıklama hızlarıdır.
- **Bezier Mouse Path:** Fare, A noktasından B noktasına düz çizgiyle gitmez. Doğal el titremelerine sahip **Cubic Bezier Eğrileri** çizerek kavisli ve insani bir hızla hareket eder.
- **Gaussian Click Offset:** Butonların tam orta noktasına (bot imzası) değil, Gaussian dağılım kullanarak buton sınırları içinde rastgele noktalara tıklar.
- **Natural Scroll:** Sayfayı aniden kaydırmak yerine ease-in-out eğrisiyle yavaşça kaydırır, okuma simülasyonu için rastgele duraksamalar yapar ve bazen yukarı kaydırarak düzeltmeler uygular.
- **Typing Simulation:** Karakterler arası değişken bekleme süreleri, typo (yazım hatası) yapıp ardından backspace ile silip doğrusunu yazma simülasyonu içerir.

---

## 📦 Kurulum ve Entegrasyon

Saniyeler içinde projenize dahil edin:

```bash
npm install ai-vision-scraper
```

> [!TIP]  
> Sistem tamamen hafif ve bağımsız kalması adına ağır yapay zeka SDK'larını zorla yüklemez. Kendi kullandığınız sağlayıcıyı (Gemini, OpenAI, Claude vs.) kolayca motora enjekte edebilirsiniz.

---

## 💻 Hızlı Başlangıç (Google Gemini 2.5)

Tavsiye edilen F/P lideri model **Gemini 2.5 Flash** ile hızlı veri çekme:

```typescript
import { VisionEngine } from "ai-vision-scraper";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Gemini istemcinizi kurun
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function run() {
  // 2. VisionEngine'i AI sağlayıcınızla bağlayın
  const engine = new VisionEngine({
    aiProvider: async (prompt, imageBase64) => {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: "image/png", data: imageBase64 } }
      ]);
      return result.response.text();
    }
  });

  const url = "https://example-shop.com/deals";
  const prompt = "Ekranda gördüğün indirimli ürünlerin adını, eski fiyatını ve yeni fiyatını bul.";

  try {
    console.log("🚀 Görsel analiz ve bypass motoru başlatılıyor...");
    
    // 3. Chaos Engine & Stealth mod aktif olarak çalıştırın!
    const data = await engine.extract(url, prompt, {
      fullPage: false,       // Tüm sayfayı çekmek istiyorsanız true yapın
      stealth: true,        // 3 aşamalı anti-bot bypass aktif
      lightBehavior: true,  // Daha hızlı sonuç için hafif insan simülasyonu
    });

    console.log("✅ Kusursuz Yapılandırılmış JSON Çıktısı:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Aşılamayan Hata:", error);
  }
}

run();
```

---

## 💻 OpenAI (GPT-4o) ile Entegrasyon

```typescript
import { VisionEngine } from "ai-vision-scraper";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const engine = new VisionEngine({
  aiProvider: async (prompt, imageBase64) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ],
        },
      ],
    });
    return response.choices[0].message.content || "";
  }
});
```

---

## ⚙️ Ekran Görüntüsü & DOM Alma (REST API Modu)

VisionScrape sadece bir SDK değil, aynı zamanda Express tabanlı bir REST API olarak da çalışabilir. Gelişmiş mimarimiz veri kazımayı **Scrape** ve **Analyze** olarak ikiye böler. Bu sayede görsel boyutlarını küçülterek token maliyetlerini asimptotik olarak düşürürsünüz.

```bash
# Sunucuyu başlatın
cd Engine && npm run dev
```

### API Endpoint'leri

| Metot | Endpoint | Güvenlik | Açıklama |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Herkese Açık | Sunucu sağlık durumu ve RAM kullanımı |
| `POST` | `/api/fetch-site` | `x-api-key` Gerekli | Sayfaya stealth mod ile gidip base64 resim ve DOM döner |
| `POST` | `/api/analyze` | `x-api-key` Gerekli | Alınan resmi AI'ye yollayıp DOM doğrulamasından geçirir |

---

## 🚀 İlham Verici Fikirler: Neler Yapabilirsiniz?

VisionScrape ile klasik scraping dünyasının sınırlarını aşın:
1. 🛒 **E-Ticaret İstihbarat Ajanı:** Rakiplerinizin sayfalarındaki fiyatları saatlik olarak arka planda dolaşıp izleyen, olağandışı bir indirim yapılmışsa size anında Telegram veya Discord üzerinden bildiren otonom sistemler.
2. 📊 **Canlı Grafik Okuyucular:** Borsa ve kripto para platformlarındaki karmaşık canvas grafiklerini anlık olarak görsel analizden geçirip formasyon tespiti yapan otonom indikatörler.
3. 🏠 **Gayrimenkul & İlan Avcıları:** Emlak sitelerinde yeni bir ilan düştüğü an arabanın plakasını, evin konumunu fotoğraflardan tanıyıp analiz eden otonom ajanlar.

---

## 🤝 Katkıda Bulun & Destek Ol! 🌟

Bu proje, açık kaynak topluluğunun gücü ve internetin özgür kalması vizyonuyla geliştirilmektedir.

- **⭐ Star Bırakın:** Bu projenin daha fazla geliştiriciye ulaşması ve bot duvarlarına karşı savaşında yakıt olması için en yukarıdan bir yıldızınızı rica ediyoruz!
- **🛠️ Fork & PR:** Yeni bypass yöntemleri, optimizasyonlar veya yeni AI sağlayıcıları ile entegrasyonlar hazırlayıp PR göndermekten asla çekinmeyin!

**Limitleri zorlayın. Dijital sınırları görsel zeka ile aşın! 🚀🔥**
