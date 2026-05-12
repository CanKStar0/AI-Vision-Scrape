<div align="center">

# 👁️🤖 VisionScrape (ai-vision-scraper)
**DOM Parsing Dönemi Bitti. Web Sitelerini Kodundan Değil, GÖRÜNÜMÜNDEN Okuyan Yeni Nesil Yapay Zeka Kazıma Motoru!**

[![npm version](https://img.shields.io/npm/v/ai-vision-scraper.svg?style=flat-square)](https://www.npmjs.com/package/ai-vision-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🚀 Vizyonumuz: Neden VisionScrape?

Geleneksel web kazıma (web scraping) yöntemleri; sürekli değişen CSS sınıfları, karmaşık React/Vue DOM yapıları ve acımasız bot koruma sistemleri (Cloudflare vs.) yüzünden artık **sürdürülemez ve kırılgan** bir hale geldi. Bir site arayüzünü güncellediğinde, yazdığınız yüzlerce satırlık XPath ve Cheerio kodları bir saniyede çöpe gider.

**VisionScrape bu kaosa son veriyor!**
Biz sistemi "kodlara" bakacak şekilde değil, tıpkı **gerçek bir insan gibi ekrana bakacak** şekilde tasarladık. Hedef url'yi verirsiniz, *doğal dille (İngilizce/Türkçe)* ne istediğinizi söylersiniz; gerisini arka planda çalışan **Google Gemini AI** ve **Playwright** motoru halleder.

## ✨ Öne Çıkan Özellikler

- **🚫 XPath ve CSS Selector Yok:** Veriyi HTML tag'lerinden değil, sayfanın ekran görüntüsünün görsel analizinden (Vision) çeker. Site tasarımı değişse bile kodunuz bozulmaz!
- **🤖 Akıllı Şema Dayatması (Strict JSON):** Yapay zekanın saçmalamasını engelleyen özel mimarimiz sayesinde, talimatlarınız her zaman %100 parse edilebilir, katı bir `JSON` formatında döner.
- **🛡️ Bot Korumalarını Aşar:** Playwright Stealth eklentisi sayesinde gerçek insan hareketlerini simüle eder, bloklanma riskini minimuma indirir.
- **⚡ Akıllı Görüş Alanı Yönetimi (Viewport/FullPage):** Zekice tasarlanmış mimarisi sayesinde, sadece gereken alanı işleyerek API maliyetlerini düşürür ve hızı maksimuma çıkarır.
- **📜 Otonom Anayasa Entegrasyonu:** Kurduğunuz an, projenize bir `ai-vision-scraper-rules.md` anayasası entegre olur ve takımınızdaki diğer mühendislere/yapay zekalara nasıl proje geliştirileceğini öğretir.

---

## 📦 Kurulum ve Ayarlama

Projeye saniyeler içinde dahil edin:

```bash
npm install ai-vision-scraper
```

Sistemin çalışması için tek ihtiyacınız olan şey Google Gemini API anahtarıdır. Projenizin ana dizininde bir `.env` dosyası oluşturun:

```env
GEMINI_API_KEY=senin_api_anahtarin_buraya_gelecek
```

---

## 💻 Hızlı Başlangıç (Quick Start)

Hiçbir karmaşık ayar yok. Otonom motoru projeye dahil et, komutunu ver ve veriyi al.

```typescript
import { VisionEngine } from 'ai-vision-scraper';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    // 1. Motoru Dependency Injection ile Başlatın
    const engine = new VisionEngine({
        apiKey: process.env.GEMINI_API_KEY
    });

    const targetUrl = 'https://books.toscrape.com/';

    // 2. Ne İstediğinizi Doğal Dille Ancak JSON Formatında İsteyin
    const instruction = `
    Sayfayı analiz et. Gördüğün ilk 3 kitabın ismini ve fiyatını bul.
    Sadece aşağıdaki JSON formatında veri döndür, markdown veya yorum ekleme:
    {
        "books": [
            { "title": "string", "price": "number" }
        ]
    }
    `;

    try {
        console.log(`🚀 ${targetUrl} adresine uçuluyor...`);
        
        // 3. Veriyi Çek!
        const result = await engine.extract(targetUrl, instruction, { fullPage: false });
        
        console.log('✅ İşlem Başarılı! Yapay Zekanın Bulduğu Veri:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Sistem hatayı kendi içinde absorbe etti. Olası sebep:', error);
    }
}

main();
```

---

## 💡 Sınırları Zorlayacak Proje Fikirleri

Bu motor sadece basit bir veri çekici değil, dijital dünyayı sizin için izleyen otonom bir gözdür. İşte yapabileceklerinizden bazıları:

1. **E-Ticaret İstihbarat Ajanı:** Rakiplerinizin sayfalarındaki fiyatları saatlik olarak çeken, eğer indirim yapılmışsa size Telegram/Discord üzerinden uyarı atan otonom bir sistem.
2. **Kripto/Borsa Dinamik Analizi:** Grafiklerin ve karmaşık canvas elementlerinin yer aldığı, XPath ile veri çekilemeyen kripto sitelerinde sadece "Grafikteki güncel trend değerini bana dön" diyerek JSON verisi almak.
3. **Sosyal Medya Duygu Analizörü (Sentiment Analysis):** Twitter(X) veya Reddit sayfalarını gezerek atılan son gönderilerin olumlu/olumsuz duygu analizini görsel tabanlı olarak yapıp istatistik çıkartan bir bot.
4. **Otonom Gayrimenkul Avcısı:** İlan sitelerinde saatlerce gezmek yerine, belirlediğiniz filtrelerde yeni bir ev/araba ilanı düştüğünde fotoğrafını ve bilgilerini JSON olarak veritabanınıza kaydeden bir akıllı sekreter.

---

## 🤝 Bize Katıl, Yıldız Ver ve Destek Ol! 🌟

Bu proje, açık kaynak topluluğunun gücü ve inovasyona inancın bir eseri. Yıllardır süregelen "kod kazıyarak" veri bulma ızdırabına son veren, geleceğin "Görsel Zeka" odaklı sisteminin temellerini inşa ediyoruz. 

**Nasıl Destek Olabilirsin?**
1. **⭐ Yıldız Ver:** Yukarıdaki **Star** butonuna basarak projenin dünyanın her yerindeki geliştiriciler tarafından görülmesine ve büyümesine en büyük katkıyı hemen şimdi sağlayabilirsin. 
2. **🛠️ Forkla ve Katkıda Bulun:** Projeyi geliştir, GitHub issues kısmında fikirlerini paylaş. Yeni yapay zeka entegrasyonları, performans iyileştirmeleri ve PR'lar her zaman memnuniyetle karşılanır.
3. **📣 Paylaş:** Kurduğun çılgın otonom sistemleri X (Twitter), LinkedIn, Medium veya Reddit'te projeyi tag'leyerek paylaş. Seni izlemek bizi inanılmaz motive ediyor!

Birkaç kod satırı ile internetin dijital sınırlarını yıkıyorsun. Limit sensin, fırlatmaya hazırlan! 🚀🔥
