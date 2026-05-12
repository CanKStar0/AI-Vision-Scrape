<div align="center">

# ????? VisionScrape (ai-vision-scraper)
**DOM Parsing Dönemi Bitti. Web Sitelerini Kodundan Deðil, GÖRÜNÜMÜNDEN Okuyan Yeni Nesil Yapay Zeka Kazýma Motoru!**

[![npm version](https://img.shields.io/npm/v/ai-vision-scraper.svg?style=flat-square)](https://www.npmjs.com/package/ai-vision-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## ?? Vizyonumuz: Neden VisionScrape?

Geleneksel web kazýma (web scraping) yöntemleri; sürekli deðiþen CSS sýnýflarý, karmaþýk React/Vue DOM yapýlarý ve acýmasýz bot koruma sistemleri (Cloudflare vs.) yüzünden artýk **sürdürülemez ve kýrýlgan** bir hale geldi. Bir site arayüzünü güncellediðinde, yazdýðýnýz yüzlerce satýrlýk XPath ve Cheerio kodlarý bir saniyede çöpe gider.

**VisionScrape bu kaosa son veriyor!**
Biz sistemi "kodlara" bakacak þekilde deðil, týpký **gerçek bir insan gibi ekrana bakacak** þekilde tasarladýk. Hedef url`yi verirsiniz, *doðal dille (Ýngilizce/Türkçe)* ne istediðinizi söylersiniz; gerisini arka planda VisionScrape ve **Seçtiðiniz Yapay Zeka (OpenAI, Gemini, Anthropic vs.)** halleder.

## ? Öne Çýkan Özellikler

- **?? Özgür AI Mimarisi:** Sisteme hiçbir yapay zeka saðlayýcýsý (Vendor Lock-in) KÝLÝTLÝ DEÐÝLDÝR! Ýster OpenAI (ChatGPT), ister Google Gemini, ister Anthropic (Claude) kullanýn.
- **?? XPath ve CSS Selector Yok:** Veriyi HTML tag`lerinden deðil, sayfanýn ekran görüntüsünün görsel analizinden (Vision) çeker. Site tasarýmý deðiþse bile kodunuz bozulmaz!
- **?? Akýllý Þema Dayatmasý (Strict JSON):** Yapay zekanýn saçmalamasýný engelleyen özel mimarimiz sayesinde, talimatlarýnýz her zaman %100 parse edilebilir, katý bir `JSON` formatýnda döner.
- **??? Bot Korumalarýný Aþar:** Playwright Stealth eklentisi sayesinde gerçek insan hareketlerini simüle eder, bloklanma riskini minimuma indirir.

---

## ?? Kurulum ve Ayarlama

Projeye saniyeler içinde dahil edin:

```bash
npm install ai-vision-scraper
```

Sistem tamamen "Agnostic" (baðýmsýz) olarak tasarlanmýþtýr. Bu yüzden `ai-vision-scraper` kütüphanesi aðýr AI eklentilerini cihazýnýza yüklemez. Kendi favori AI kütüphanenizi (örn: `@google/generative-ai` veya `openai`) ayrýca kurup motora enjekte edersiniz.

---

## ?? Hýzlý Baþlangýç (Google Gemini Örneði)

```bash
npm install @google/generative-ai
```

```typescript
import { VisionEngine } from "ai-vision-scraper";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("SENIN_GEMINI_API_ANAHTARIN");

async function main() {
    // 1. Motoru "Sizin Seçtiðiniz AI" ile Baþlatýn
    const engine = new VisionEngine({
        aiProvider: async (prompt, imageBase64) => {
            // Sistemin fýrlattýðý prompt ve kestiði ekran görüntüsünü Gemini`ye yolluyoruz.
            const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
            const result = await model.generateContent([
                { text: prompt },
                { inlineData: { mimeType: "image/png", data: imageBase64 } }
            ]);
            return result.response.text();
        }
    });

    const targetUrl = "https://books.toscrape.com/";

    // 2. Ne Ýstediðinizi Söyleyin
    const instruction = "Sayfada gördüðün ilk 3 kitabýn adýný ve fiyatýný bul ve JSON formatýnda dön.";

    try {
        console.log(`?? ${targetUrl} adresine uçuluyor...`);
        const result = await engine.extract(targetUrl, instruction, { fullPage: false });
        console.log("? Ýþlem Baþarýlý! Veri:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("? Hata:", error);
    }
}
main();
```

---

## ?? Hýzlý Baþlangýç (OpenAI GPT-4o Örneði)

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

    const result = await engine.extract("https://news.ycombinator.com/", "Bana ilk 5 haberin baþlýðýný dön.");
    console.log(result);
}
main();
```

---

## ?? Bize Katýl, Yýldýz Ver ve Destek Ol! ??

Bu proje, açýk kaynak topluluðunun gücü ve inovasyona inancýn bir eseri. Yýllardýr süregelen "kod kazýyarak" veri bulma ýzdýrabýna son veren, geleceðin "Görsel Zeka" odaklý sisteminin temellerini inþa ediyoruz. Lütfen sað üstten destek olmak için bize bir YILDIZ verin.
