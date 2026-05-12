<div align="center">

# 👁️🤖 AI Vision Scraper

**Yeni Nesil, Görüntü İşleme Tabanlı Web Kazıma ve Veri Çıkarma Motoru**

[![npm version](https://img.shields.io/npm/v/ai-vision-scraper?style=for-the-badge&color=007ec6)](https://www.npmjs.com/package/ai-vision-scraper)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Playwright Powered](https://img.shields.io/badge/Powered_by-Playwright-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-FFA700?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

*Kırılgan CSS seçicileri (selectors) yazmayı bırakın. Ne istediğinizi sadece Türkçe (veya İngilizce) tarif edin, yapay zeka sizin için web sitesine baksın ve veriyi temiz bir JSON olarak çıkarsın.*

<br/>

[Özellikler](#-özellikler) •
[Kurulum](#-kurulum) •
[Nasıl Çalışır](#-nasıl-çalışır) •
[Kullanım & Örnekler](#-kullanım-kılavuzu-ve-örnekler) •
[SSS](#-sıkça-sorulan-sorular-sss)

</div>

---

## 🚀 Hoş Geldiniz: Web Kazımanın Geleceği

Geleneksel web scraping (kazıma) yöntemleri artık çalışmıyor. Modern web siteleri sürekli güncelleniyor, class isimleri dinamik olarak değişiyor (Tailwind, CSS-in-JS), DOM yapıları her gün farklı bir form alıyor. Klasik kodladığınız kazıyıcılar siz daha projeyi canlıya almadan kırılıyor.

**AI Vision Scraper**, DOM'u tamamen görmezden gelerek bu sorunu kökünden çözer. Hedef adresinize son derece gizli (bot korumalarını atlatan) yeteneklere sahip bir tarayıcı (Playwright) ile gider, ekranın yüksek çözünürlüklü bir fotoğrafını çeker ve Google'ın en yeni ve yetenekli vizyon modellerini (**Gemini Flash**) kullanarak tıpkı bir insanın web sitesine baktığı gibi ekrana bakar. Gördüğü veriyi sizin verdiğiniz komuta göre ayııklar ve **garantili bir JSON formatında** size teslim eder.

Kısacası: Hedefin koduyla değil, **görüntüsüyle** iş yapar!

<br/>

## 🎯 Özellikler

- 🧠 **Sıfır Parser Bakımı:** Hayatınızdan `XPath` veya `CSS Selector` kavramlarını tamamen çıkarın. İnsan diliyle talimat verin.
- 🥷 **Ultimate Stealth (Gizlilik/Ninja) Modu:** Paketin çekirdeği bot korumalarını (Cloudflare vb.) aşmak için tasarlandı. Özel User-Agent yöneticisi, iz bırakmayan tarayıcı kimlikleri, `navigator.webdriver` manipülasyonu ve insan-benzeri çözünürlük ayarları varsayılan olarak gelir.
- 🧱 **Kusursuz JSON Çıktısı (Strict JSON):** Yapay zeka halüsinasyonları veya markdown içeren cevaplar `(```json ... ```)` sorun olmaktan çıktı. Gelişmiş temizleme mimarimiz size doğrudan kodunuzda kullanabileceğiniz, ayrıştırılmış (`JSON.parse`) nesneler (object/array) döndürür.
- ⚡ **Otomatik Tarayıcı Yönetimi:** Paket, NPM üzerinden kurulduğu an Playwright Chromium motorunu otomatik indirir. Sizin ya da projenizi indiren başka bir takım arkadaşınızın ortam kurmasına gerek kalmaz.
- 🛡️ **%100 TypeScript & Tip Güvenliği:** Sıfırdan TypeScript ile kodlandı. İnanılmaz bir geliştirici deneyimi (DevEx) sunar.

<br/>

## 📦 Kurulum

Sistemi projenize dahil etmek inanılmaz derecede kolaydır. NPM veya Yarn ile saniyeler içinde indirebilirsiniz:

```bash
# NPM kullanarak
npm install ai-vision-scraper

# Yarn kullanarak 
yarn add ai-vision-scraper
```

> **🔥 Önemli Not (Postinstall):** Bu paket indirilirken arka planda `postinstall` betiği çalışır ve ihtiyaç duyulan Chromium tarayıcı motorunu otomatik yükler. Herhangi bir ekstra tarayıcı konfigürasyonu yapmanıza kesinlikle gerek yoktur.

<br/>

## 🔑 Konfigürasyon

Sistemin "gözlerini" açabilmesi için tek ihtiyacınız olan şey ücretsiz bir **Google Gemini API Anahtarıdır** (Gemini 1.5/2.5 modellerini kullanır). 

API anahtarınızı sisteme iki farklı şekilde enjekte edebilirsiniz:

### 1. Çevresel Değişken (Önerilen)
Projenizin ana dizinine bir `.env` (environment) dosyası oluşturun ve anahtarınızı oraya koyun. SDK bunu otomatik okuyacaktır:
```env
GEMINI_API_KEY=AIzaSy_BURAYA_KENDI_GIZLI_ANAHTARINIZI_YAZIN
```

### 2. Sınıf Üzerinden (Constructor Injection)
Eğer anahtarları bir veri tabanından asenkron olarak çekiyorsanız ya da dinamik bir SaaS platformu yaratıyorsanız, parametre olarak doğrudan sağlayabilirsiniz:
```typescript
import { VisionEngine } from "ai-vision-scraper";

const engine = new VisionEngine({ 
  apiKey: "AIzaSy_BURAYA_KENDI_GIZLI_ANAHTARINIZI_YAZIN" 
});
```

<br/>

## 💻 Kullanım Kılavuzu ve Örnekler

Bu paket tamamen asenkron `async/await` altyapısı üzerine kuruludur. İşte sistemin ne kadar pratik olduğunu gösteren çeşitli zorluklardaki senaryolar:

### 🟢 Senaryo 1: Basit Tekil Veri Çekimi
Sadece tek bir nesne yakalamak istiyorsanız yapmanız gereken budur.

```typescript
import { VisionEngine } from "ai-vision-scraper";

async function basitKazima() {
    // 1. Motoru başlatın
    const engine = new VisionEngine(); 
    
    // 2. Hedef siteyi ve isteği belirleyin
    const url = "https://books.toscrape.com/";
    const instruction = "Bu sayfada gördüğün ilk kitabın adını ve fiyatını bul. Sadece JSON formatında dön.";

    try {
        console.log("🚀 Motor Ateşleniyor. Hedefe uçuluyor...");
        
        // 3. Veriyi dışarı çıkart!
        const result = await engine.extract(url, instruction);
        
        console.log("\n✨ === YAPAY ZEKA ÇIKTISI === ✨");
        console.dir(result, { depth: null, colors: true });
        
        // Örnek Çıktı:
        // {
        //   "name": "A Light in the Attic",
        //   "price": "£51.77"
        // }

    } catch (error) {
        console.error("❌ Operasyon Başarısız:", error);
    }
}

basitKazima();
```

### 🔴 Senaryo 2: Gelişmiş Dizi (Array) ve Liste Çekimi
Yapay zeka sayesinde sayfadaki birden çok veriyi, kendi belirlediğiniz şema üzerinden JSON dizisi (Array) olarak çekebilirsiniz. Listeler, emlak ilanları, borsa verileri için harikadır.

```typescript
import { VisionEngine } from "ai-vision-scraper";

async function cokluVeriCekimi() {
    const engine = new VisionEngine();
    
    const url = "https://my-sneaker-store.com/new-arrivals";
    
    // Talimatları ne kadar net tutarsanız çıktı o kadar başarılı olur.
    const instruction = `
      Ekranda gördüğün en popüler 3 spor ayakkabıyı incele.
      Bu ayakkabılar için bir JSON listesi (array) oluştur.
      Her bir obje (nesne) kesinlikle şu anahtarlara sahip olmalı:
      - 'brand' (Marka adı, örneğin Nike)
      - 'model' (Ayakkabı modeli)
      - 'price' (Fiyat, string olarak)
      - 'inStock' (Eğer sepete ekle butonu varsa true, yoksa false)
    `;

    const result = await engine.extract(url, instruction);
    console.log(result);

    // AI mucizevi bir şekilde sayfayı yorumlar ve döner:
    // [
    //   { "brand": "Nike", "model": "Air Max 90", "price": "$129.99", "inStock": true },
    //   { "brand": "Adidas", "model": "Ultraboost", "price": "$159.00", "inStock": true },
    //   { "brand": "Puma", "model": "Run", "price": "$90.00", "inStock": false }
    // ]
}
```

<br/>

## ⚙️ Nasıl Çalışır? (Kaputun Altındakiler)

Bu kütüphanenin arka planda sizin için yaptığı ağır işler şunlardır:

1. **Gizlilik Taraması:** `VisionEngine`, bir Playwright/Chromium instansı ayağa kaldırır. Ancak standart bir bot olmadığını kanıtlamak için modern tarayıcı User-Agent bilgileri kullanır ve "AutomationControlled" güvenlik bayraklarını sistemden temizler.
2. **Akıllı Bekleme:** Sayfanın sadece kaynak kodunun (DOM) inmesi yetmez, içeriklerin (özellikle React/Vue/Angular gibi SPA'lerde) ekrana basılması gerekir. Motor, ekran rölantiye geçene ve iskelet yüklenene kadar bekler. Gerekirse fazladan koruma süresi (`waitForTimeout`) uygular.
3. **Optik Çekim:** Hedeflenen ekranın tertemiz bir fotoğrafı yüksek kalite (PNG) formatında bellekte tamponlanır (`Buffer`). Bu işlem veriyi hiçbir sunucu bellek sızıntısına yol açmadan yapar.
4. **LLM İletişimi:** Bu optik tampon, sizin "System Prompt" veya verdiğiniz komutlarla Google'ın devasa yapay zeka vizyon asistanı (Gemini 1.5/2.5 Flash) modeline iletilir. Model sadece `application/json` basacak şekilde sıkı ayarlarla yapılandırılmıştır.
5. **JSON Filtrasyonu:** Eğer AI bazen ısrarcı davranıp başa/sona yorum katarsa (Örn: "İşte sonuç: ```json ... ```"), SDK'nın dahili temizlik algoritması (Regex Regex) gereksiz her metni yırtıp atar.
6. **Güvenli Temizlik:** Hedef çalışsa da, patlasa da bir `finally` bloğu o koca tarayıcıyı havada asılı bırakmaz ve sunucu raminizin ("Out of Memory" OOM) çökmemesi için motorları başarıyla kapatır.

<br/>

## 🤔 Sıkça Sorulan Sorular (SSS)

**S: Neden GPT-4o Vision değil de Gemini Flash?**  
C: Gemini 1.5 ve 2.5 Flash modelleri inanılmaz derecede hızlıdır, multimodal özellikleri doğuştandır, maliyet açısından sektördeki en uygun fiyatlı ve cömert kotalı modellerdir. Ayrıca `responseMimeType: application/json` formatına en sağlam tepki gösteren model sistemlerinden biridir.

**S: Hız durumu nasıl? API istekleri çok uzun sürüyor mu?**  
C: Chromium'un sayfaya gitmesi, beklemesi (network idle, dom load) ağınızın hızına bağlı olarak 3-5 saniye alır. Gemini 1.5 Flash'in görüntüyü yorumlayıp JSON dönmesi ortalama 2-3 saniye sürer. Toplamda 5 - 8 Saniye (soğuk başlangıç dahil değil) gibi bir sürede sonuç kapınızda olur. Otomasyon senaryolarında bu süre muazzam bir değerdir.

**S: Ya sayfa çok uzunsa ve aşağıya inmek (Scroll) gerekirse?**  
C: Şu anki sürümde `fullPage: true/false` ayarları bulunmaktadır ve motor tüm dökümanın fotoğrafını çekebilir (viewport taşsa bile). Çok ağır ve sonsuz loding (infinite scroll) yapan sayfalar için ileride sayfa içi aksiyon API'ları eklenecektir.

<br/>

## 🛡️ Hata Yönetimi Arıza Durumları

Sistem size güvenli ve tutarlı Error'lar fırlatır. "Zorla kapatılmalara" mahal vermez:
- _Eğer Chromium inmezse/açılamazsa:_ Net bir mesaj ve kurulum önerisi atar.
- _Eğer sayfa ölü bir linkse(404) / DNS kopuksa_ : Network exception fırlatılır.
- _Eğer API Key yoksa:_ FATAL ERROR the API key is missing mesajı verir.

*(Tavsiye: Kendi `extract()` fonksiyonunuzu her zaman kendi `try-catch` bloklarınızın arasına ekleyerek kendi uygulamanızın güvenliğini artırın)*

<br/>

## 🤝 Geliştirme (Contributing)

Bu proje açık kaynaklıdır (Open Source). Topluluğun gücüne inanıyoruz. Projeye katkıda bulunmak isteyen kodlayıcılar için Pull Request (PR) süreçleri her zaman açıktır. Repoyu çatallayın (fork), vizyon getirecek bir özellik katın ve bizimle paylaşın.

<br/>

## 📝 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. 

Gönül rahatlığıyla kullanabilir, ticari projelerinizde yer verebilir veya üzerinde değişiklikler yapıp dağıtabilirsiniz.

---
<div align="center">
  <i>Sürekli bozulan eski tip örümcek ağlarından yorulan tüm geliştiriciler için sevgiyle kodlandı ❤️</i>
</div>