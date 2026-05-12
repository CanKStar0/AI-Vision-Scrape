<div align="center">

# 👁️🤖 VisionScrape (ai-vision-scraper)

**DOM Parsing Dönemi Bitti. Web Sitelerini Kodundan Değil, GÖRÜNÜMÜNDEN Okuyan Yeni Nesil Yapay Zeka Kazıma Motoru!**

[![npm version](https://img.shields.io/npm/v/ai-vision-scraper.svg?style=for-the-badge&color=blue)](https://www.npmjs.com/package/ai-vision-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/CanKStar0/VisionEngine/pulls)

</div>

---

## 🚀 Vizyonumuz: Neden VisionScrape?

Geleneksel web kazıma (web scraping) yöntemleri; sürekli değişen CSS sınıfları (Tailwind vb.), karmaşık React/Vue DOM yapıları ve acımasız bot koruma sistemleri (Cloudflare vs.) yüzünden artık **sürdürülemez ve kırılgan** bir hale geldi. Bir site arayüzünü güncellediğinde, büyük emeklerle yazdığınız yüzlerce satırlık XPath ve Cheerio kodları bir saniyede çöpe gider.

> **VisionScrape bu kaosa son veriyor!**

Biz sistemi "kodlara" bakacak şekilde değil, tıpkı **gerçek bir insan gibi ekrana bakacak** şekilde tasarladık. Hedef URL'yi verirsiniz, *doğal dille (İngilizce/Türkçe)* ne istediğinizi söylersiniz; gerisini arka planda VisionScrape'in gelişmiş Playwright tarayıcı altyapısı ve **Sizin Seçtiğiniz Yapay Zeka (OpenAI, Gemini, Anthropic vs.)** halleder.

---

## ✨ Öne Çıkan Özellikler

- **🧠 Özgür AI Mimarisi (Agnostic):** Sisteme hiçbir yapay zeka sağlayıcısı (Vendor Lock-in) KİLİTLİ DEĞİLDİR! İster OpenAI (ChatGPT), ister Google Gemini, ister Anthropic (Claude) kullanın. Motor sadece aracılık yapar.
- **🚫 XPath ve CSS Selector Yok:** Veriyi HTML etiketlerinden değil, sayfanın ekran görüntüsünün görsel analizinden (Vision) çeker. Site tasarımı baştan aşağı değişse bile kodunuz tıkır tıkır çalışır!
- **🤖 Akıllı Şema Dayatması (Strict JSON):** Yapay zekanın halüsinasyonlar görüp saçmalamasını veya sohbet etmesini engelleyen özel mimarimiz sayesinde, talimatlarınız her zaman %100 parse edilebilir, katı bir `JSON` formatında döner.
- **🛡️ Bot Korumalarını Aşar:** Playwright Stealth eklentisi sayesinde gerçek insan navigasyonunu simüle eder (WebDriver sancağını siler), bloklanma riskini minimuma indirir.

---

## 📦 Kurulum ve Ayarlama

Projeye saniyeler içinde dahil edin:

```bash
npm install ai-vision-scraper
```

Sistem tamamen "Agnostic" (bağımsız) olarak tasarlanmıştır. Bu yüzden `ai-vision-scraper` kütüphanesi ağır AI eklentilerini cihazınıza zorla yüklemez. Kendi favori AI kütüphanenizi (örn: `@google/generative-ai` veya `openai`) projeye dahil edip motora enjekte edersiniz.

---

## 💻 Hızlı Başlangıç (Google Gemini Örneği)

Tavsiye Ettiğimiz Yapay Zeka Gemini 1.5/2.5 Flash'tır, kurmak için:
```bash
npm install @google/generative-ai
```

Projeye entegre edip veriyi çekmek şu kadar kolay:

```typescript
import { VisionEngine } from "ai-vision-scraper";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Kendi anahtarınızla Gemini'yi başlatın
const genAI = new GoogleGenerativeAI("SENIN_GEMINI_API_ANAHTARIN");

async function main() {
    // 2. Motoru kullanmak istediğimiz Yapay Zeka ile (Gemini) ayağa kaldırıyoruz
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

    const targetUrl = "https://books.toscrape.com/";

    // 3. Ne İstediğinizi Söyleyin (Doğal dil ile yönlendirme)
    const instruction = "Sayfada gördüğün ilk 3 kitabın adını ve fiyatını bul ve dürüstçe JSON formatında dön.";

    try {
        console.log(`🚀 ${targetUrl} adresine uçuluyor...`);
        
        // 4. Extraction İşlemi - Hedef siteye bağlan ve analiz et!
        const result = await engine.extract(targetUrl, instruction, { fullPage: false });
        
        console.log("✅ İşlem Başarılı! Yapay Zekanın Çıkardığı Veri:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("❌ Hata Oluştu:", error);
    }
}
main();
```

---

## 💻 Harekete Geç (OpenAI GPT-4o Örneği)

Ben ChatGPT'den vazgeçmem diyenlerdenseniz:
```bash
npm install openai
```

```typescript
import { VisionEngine } from "ai-vision-scraper";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: "SENIN_OPENAI_ANAHTARIN" });

async function main() {
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

    console.log("🚀 Hacker News taranıyor...");
    // Sadece bir cümlelik komut!
    const result = await engine.extract("https://news.ycombinator.com/", "Bana ilk 5 haberin başlığını dön.");
    
    console.log("Haberler:", result);
}
main();
```

---

## 💡 Sınırları Zorlayacak Proje Fikirleri

Bu motor sadece basit bir veri çekici değil, dijital dünyayı sizin adınıza 7/24 görsel olarak gözetleyen otonom bir gözdür:

1. 🛒 **E-Ticaret İstihbarat Ajanı:** Rakiplerinizin sayfalarındaki fiyatları saatlik olarak arka planda dolaşıp izleyen, olağandışı bir indirim yapılmışsa size Telegram veya Discord üzerinden saniyeler içinde "Saldır!" mesajı atan otonom bir sistem.
2. 📈 **Kripto & Borsa Dinamik Analizi:** Çılgın grafiklerin ve karmaşık canvas elementlerinin yer aldığı, normal botların hiçbir zaman okuyamayacağı borsa sitelerinde sadece **"Grafikteki güncel formasyon değerini ve rengi al"** diyerek canlı veri akışı yakalamak.
3. 🏠 **Otonom Gayrimenkul & Araç Avcısı:** Sahibinden gibi platformlarda saatlerce gezmek yerine, belirlediğiniz filtrelerde yeni bir ev/araba ilanı düştüğünde arabanın plakasını, fotoğrafını ve net bilgilerini okuyan süper hızlı bir bot.

---

## 🤝 Bize Katıl, Yıldız Ver ve Destek Ol! 🌟

Bu proje, açık kaynak topluluğunun gücü ve inovasyona inancın bir eseri olarak kuruldu. Yıllardır süregelen "kod kazıyarak" veya "XPath avlayarak" veri bulma ızdırabına son veren, geleceğin **"Görsel Zeka" (Vision)** odaklı sisteminin temellerini inşa ediyoruz.

**Nasıl Destek Olabilirsin?**
- **⭐ Yıldıza Tıkla:** Lütfen en yukarıdaki **Star** butonuna basarak projenin dünyanın her yerindeki geliştiriciler tarafından görülmesine ve en tepeye çıkmasına en büyük katkıyı hemen şimdi sağla. Çünkü sizin yıldızlarınız bu projenin yakıtı!
- **🛠️ Forkla ve Katkıda Bulun:** Projeyi iyileştir veya GitHub Issues kısmında vizyoner fikirlerini paylaş. Anthropic veya Llama gibi yeni yapay zeka modelleriyle test edip PR atmaktan aska çekinme.
- **📣 Ateşi Yay:** Kurduğun çılgın otonom sistemleri X (Twitter), LinkedIn, veya Reddit gibi platformlarda etiketleyerek paylaş!

Birkaç kod satırı ile internetin bütün algısını alt üst ediyor, dijital sınırları yıkıyorsun...
Masaüstünün başına geç. Limit sadece sensin...
**Hemen fırlatmaya hazırlan! 🚀🔥**
