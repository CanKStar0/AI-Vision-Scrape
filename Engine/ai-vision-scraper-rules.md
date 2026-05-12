# 👁️🤖 AI Vision Scraper (ai-vision-scraper) — Mimari Anayasa ve Kullanım Kılavuzu

Bu doküman, sistemin nasıl inşa edileceğini ve genişletileceğini belirleyen KESİN KURALLAR BÜTÜNÜDÜR. Sisteme müdahale edecek tüm yapay zeka ajanlarının ve mühendislerin, bu anayasadaki mimari kararlara harfiyen uyması **zorunludur**.

---

## 1. Temel Felsefe ve Paradigma Değişimi
**Kural:** DOM Parsing Gelenekleri (Cheerio, Puppeteer XPath vs.) Kesinlikle Yasaktır.
* **Sebep:** Geleneksel web kazıma yöntemleri; hedef sitelerin sürekli değişen CSS sınıfları (Tailwind vb.), dinamik React/Vue yapıları, bot korumaları (Cloudflare) ve DOM manipülasyonları karşısında sürekli kırılgandır ve sürdürülemez bir bakım borcu yaratır.
* **Sonuç:** Temsili DOM parse etme kodları reddedilmiştir. Sadece `ai-vision-scraper` kütüphanesi kullanılacaktır. Algoritmalar sitenin arka plan koduna değil, fiziksel render edilen **görüntüsüne** odaklanmalıdır. Veri çıkarımı, kural bazlı seçiciler (selectors) ile değil İngilizce/Türkçe doğal dil algoritmaları üzerinden yapılmalıdır.

## 2. Güvenlik ve Bağımlılık Enjeksiyonu (Dependency Injection)
**Kural:** API Key'lerin Koda Gömülmesi (Hardcoding) Yasaktır.
* **Sebep:** Sabitlenmiş anahtarlar, açık kaynak sızıntılarına ve cloud (AWS, Vercel vb.) dağıtımlarında projenin çökmesine neden olur.
* **Sonuç:** Yapılandırma daima çevre değişkenlerinden (`process.env.GEMINI_API_KEY`) okunmalı veya sınıf (class) ayağa kaldırılırken constructor ile dışarıdan enjekte edilmelidir.
* **Doğru Kullanım:**
  ```typescript
  import { VisionEngine } from "ai-vision-scraper";
  const apiKey = process.env.GEMINI_API_KEY;
  const engine = new VisionEngine({ apiKey }); // Dependency Injection uygulanmıştır.
  ```

## 3. Yapay Zeka Halüsinasyonları ve Çıktı Dayatması
**Kural:** `instruction` (talimat) parametresi "açık uçlu sohbete" izin veremez. Katı bir JSON şeması dayatılmalıdır.
* **Sebep:** Büyük dil modelleri (LLM), çıktılarına `markdown` kod blokları, "İşte sonuçlarınız" gibi sohbet kelimeleri ekleyebilir. Bu durum uygulamanın JSON.parse() komutunda direkt Crash (Çökme) yemesine sebep olur.
* **Sonuç:** Talimat yazılırken esneklik sıfır olmalı, alanlar (keys) net bir şekilde aktarılmalı ve kesin bir JSON iskeleti şart koşulmalıdır.
* **Doğru Kullanım:** `"Find the laptop name and price. Return strictly a JSON object with keys 'name' (string) and 'price' (string). No markdown, no comments."`

## 4. Hata Yönetimi ve Sistemin Hayatta Kalması (Resilience)
**Kural:** Saf `extract()` çağrısı asla çıplak kullanılamaz; daima `try/catch` zırhı ile sarmalanacaktır.
* **Sebep:** Hedef site erişilemez olabilir (DNS hatası), Playwright timeout (zaman aşımı) alabilir ya da hedeflenen ürün satıstan kaldırıldığı için sayfada olmayabilir (model null dönebilir). Yakalanmayan bu tip hatalar backend mimarisini komple çökertecektir.
* **Sonuç:** Hata durumlarında uygulamanın çökmesi engellenmeli, sistem sessizce recover edebilecek veya fallback sunacak (örneğin `return null;` yapacak) şekilde boilerplate yapılandırılmalıdır.
* **Doğru Kullanım:**
  ```typescript
  try {
      const result = await engine.extract(url, strictInstruction);
      return result;
  } catch (error) {
      console.error(`[VisionScraper] Extraction error for URL: ${url}`, error);
      return null; // Sistemin ayakta kalması için.
  }
  ```

## 5. Dinamik Görüş Alanı Yönetimi (Viewport vs. FullPage)
**Kural:** `fullPage` varsayılan olarak kapalı `false` kalmalı, yalnızca gerekli durumlarda maliyet hesabıyla `true` yapılmalıdır.
* **Sebep:** Sayfanın sadece en üstünde (Hero Section) bulunan bir başlık (H1) veya fiyat verisi için kilometrelerce uzunluktaki tüm sayfayı render edip yapay zekaya göndermek devasa bir hız, kaynak ve token (para) israfıdır. Tam sayfa çekimler model limitlerini (Rate Limits) veya token kısıtlamalarını tetikleyebilir.
* **Sonuç:**
  * Eğer aranan nesne, sayfa yüklendiğinde görünen ilk perspektifte ise: `options: { fullPage: false }`
  * Eğer bir tablo, yorum listesi veya sonsuz loding dışı geniş bir liste aranıyorsa: `options: { fullPage: true }` kullanılmalıdır.

## 6. Ajanlar İçin Örnek Referans Kod (Şablon)
**Kural:** Aşağıdaki TypeScript şablonu, SDK'yı kullanacak diğer yapay zeka ajanları için "Standart Referans Şablon" olarak kabul edilmelidir. Yeni bir script/dosya yazacak olan ajanlar bu iskeleti örnek alacak ve yapıyı bozmayacaktır.

```typescript
import { VisionEngine } from 'ai-vision-scraper';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    // 1. Dependency Injection ile Engine başlatma
    const engine = new VisionEngine({
        apiKey: process.env.GEMINI_API_KEY // API Key koda gömülmedi
        // Opsiyonel mimari ayarlar eklenebilir: { headless: false } vb.
    });

    const targetUrl = 'https://books.toscrape.com/';

    // 2. Katı, Şeması Belirli, Yönlendirici Instruction (Talimat)
    const instruction = `
    Analyze this page. Identify the first 3 book titles and their prices.
    Return strictly a JSON object with this exact structure, no markdown formatting:
    {
        "books": [
            { "title": "string", "price": "number" }
        ]
    }
    `;

    // 3. Try/Catch Zırhı ile Çağrı (FullPage / Viewport tercihi ile)
    try {
        console.log(`[VisionScraper] ${targetUrl} adresine gidiliyor...`);
        const result = await engine.extract(targetUrl, instruction, { fullPage: false });
        
        console.log('✅ İşlem Tamam. Çıktı:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Kazıma sırasında hata tespit edildi. Fallback uygulanıyor...', error);
        // Sistemin çökmemesi için uygun bir dönüş yap veya hatayı logla
    }
}

main();
```

---
*Bu mimari kurallar ve şablonlar, projede sürdürülebilirlik, maliyet verimliliği ve stabiliteyi uzun vadeli garanti altına almak için yazılmıştır.*