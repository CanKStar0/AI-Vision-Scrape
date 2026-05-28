# 📖 VisionScrape (ai-vision-scraper) – Kapsamlı Mimari, Geliştirici ve Yapay Zeka Ajanı Rehberi

*Sürüm: 1.0.0 | Kitle: İnsan Geliştiriciler (Developers) ve Otonom Kodlama Ajanları (AI Coding Agents)*

---

## 1. Giriş ve Projenin Vizyonu (Executive Summary & Vision)

Geleneksel web scraping (veri kazıma) teknikleri, onlarca yıldır Document Object Model (DOM) yapılarını ayrıştırmaya (parsing) odaklanmıştır. XPath, CSS selector veya Cheerio gibi kütüphanelerle yapılan bu kazıma işlemleri son derece hızlı olsa da, web'in modern evriminde bir o kadar da **kırılgandır (fragile)**. Herhangi bir Tailwind CSS derlemesi, React/Vue class isimlerinin değişmesi, Shadow DOM şifrelemeleri veya Cloudflare gibi Anti-Bot duvarları, geleneksel DOM tabanlı scraping senaryolarını anında çökertir.

**VisionScrape (ai-vision-scraper)**, veri kazıma paradigmasını tamamen değiştirerek **DOM tabanlı yapıdan, Görsel-Odaklı (Visual-first) bir modele** taşır. Bir insan ekrana baktığında arka plandaki CSS class karmaşasını görmez; sadece veriyi, tabloyu, ürün isimlerini veya fiyatları görür. VisionScrape, **Playwright**'ın gücünü kullanarak web sayfalarını bir insan gibi görüntüler, ekran görüntüleri alır ve bu görselleri Multimodal Yapay Zeka (Generative AI - OpenAI, Gemini, Anthropic vb.) modellerine aktararak yapılandırılmış JSON verisi çeker. 

**Projenin temel amacı şudur:** Bir web sitesi altyapısını geceden sabaha tamamen yenilese bile, ekrandaki görsel mizanpaj benzer kaldığı sürece VisionScrape **hiçbir kod güncellemesine gerek duymadan çalışmaya devam etmelidir.** 

Bu doküman, hem bu sistemin nasıl çalıştığını insan mühendislerin anlaması, hem de projeye sonradan dahil olan Otonom Kodlama Ajanlarının (Autonomous AI Agents) mimari standartları ihlal etmeden projeyi güvenle geliştirebilmesi için en az 2000-3000 kelimelik bir başucu kaynağı olarak hazırlanmıştır.

---

## 2. Temel Mimari Prensipler (Core Architectural Principles)

Projenin altyapısı, onu sıradan bir API'dan ayıran 3 temel felsefe üzerine inşa edilmiştir:

1. **AI Sağlayıcıdan Bağımsızlık (Agnostic AI Provider - No Vendor Lock-in):** 
   Uygulamanın çekirdek motoru (`VisionEngine`), içine katı olarak gömülmüş (hardcoded) bir OpenAI, Gemini veya Anthropic SDK'sı barındırmaz. Sistem, Dependency Injection (DI) prensibiyle çalışarak dışarıdan bir `aiProvider` callback fonksiyonu bekler. Ajanların, "sadece Gemini çalışır" veya "sadece OpenAI desteklenir" varsayımına düşmesi **kesinlikle yasaktır**. Sağlayıcılar arası anlık geçiş (hot-swap) desteklenir.
   
2. **Katı JSON Şeması Dayatması (Strict JSON Enforcement):**
   Büyük Dil Modelleri (LLM'ler) doğaları gereği konuşkan asistanlardır. "Merhaba", "İşte istediğiniz veriler" gibi konuşma balonları (halo effects) üretmeye eğilimlidirler. VisionScrape motoru, iç barındırdığı katı bir Sistem Promptu ile LLM'nin markdown ve sohbet üretmesini engeller. Hedef, sistemin `JSON.parse()` metoduyla her zaman hatasız çözebileceği bir response (yanıt) dizisi üretmektir.
   
3. **Hibrit Doğrulama Yaklaşımı (The Hybrid Validation Approach):**
   Görsel analiz harika çalışsa da yapay zeka halüsinasyon (hallucination) görmeye yatkındır. Kurumsal düzeyde güvenilirlik sağlamak adına arka planda **Levenshtein** mesafesini hesaplayan yerel bir DOM doğrulama katmanı kurgulanmıştır. Görselden çıkarılan veri, sayfanın kaynak HTML kodlarında teyit edilir.

---

## 3. Klasör ve Dosya Hiyerarşisi (Directory & File Hierarchy)

Proje root dizininde iki ana alan bulunur. Ana proje sarmalı ve `Engine` klasörü. Geliştirme faaliyetlerinin neredeyse tamamı `Engine` altında yapılır.

```text
VisionScrape
├── package.json                   # Root workspace bağımlılıkları
├── README.md                      # Proje genel tanıtımı
├── ai-vision-scraper-rules.md     # Ajanlar ve Geliştiriciler için Standart İşletim Prosedürü (SOP)
├── test-run.js                    # Temel root denemeleri
└── Engine/
    ├── package.json               # Engine katmanı (Express, Playwright, Cheerio) bağımlılıkları
    ├── tsconfig.json              # TypeScript derleme kuralları
    ├── README.md                  # Engine modülü dokümantasyonu
    ├── test.ts                    # Engine'e özel unit/integral testler
    ├── index.js                   # Derlenmiş başlatıcı (bootstrapper)
    ├── scripts/
    │   └── copy-rules.js          # Build aşamasında rules kopyalayıcı
    └── src/
        ├── index.ts               # Dış kullanımlar için VisionEngine'i export eder
        ├── VisionEngine.ts        # **SISTEMIN KALBI:** Playwright & AI arasındaki bağlayıcı motor
        ├── server.js              # Express REST API şeması ve scaffolding
        ├── middleware/
        │   └── authGuard.js       # Timing-Attack korumalı API Key güvenlik duvarı
        ├── routes/
        │   ├── analyzeRoutes.js   # 2. Aşama: Screenshot'ı AI'ye yollayıp doğrulayan (Validation) rota
        │   └── scrapeRoutes.js    # 1. Aşama: URL'e gidip Screenshot+DOM yakalayan rota
        └── services/
            ├── browserManager.js  # Playwright RAM yönetimi (Singleton Patter)
            └── selectorValidator.js# Levenshtein/Intersection tabanlı Hibrit DOM Validation logiciği
```

---

## 4. AI Motoru ve Entegrasyon Katmanı (`VisionEngine.ts`) - Deep Dive

Uygulamanın şüphesiz en kritik bileşeni `Engine/src/VisionEngine.ts` dosyasıdır. Harici bir SDK veya uygulama bu projeyi import ettiğinde, aslında bu sınıfla muhatap olur.

### 4.1. Kurucu (Constructor) ve Dependency Injection (DI) Metodolojisi
Sistemin esnekliğini sağlayan nokta `VisionEngineOptions` arayüzüdür.
```typescript
export type AIProviderCallback = (prompt: string, imageBase64: string) => Promise<string>;

export interface VisionEngineOptions {
  aiProvider: AIProviderCallback;
}
```
Uygulamayı başlatan geliştirici, `new VisionEngine({ aiProvider: myCustomFunction })` şeklinde motoru başlatır. Bu yapı, gelecekte farklı makine öğrenmesi API'leri çıktığında sistemin güncellenmeden kullanılabilmesini sağlar. Güvenlik tarafında ise; **API Key**'ler asla VisionEngine'in kendisine gömülmez. Sorumluluk, `aiProvider` metodunu sağlayan üst katmandadır.

### 4.2. `extract()` Metodu, Opsiyonlar ve Playwright Akışı
Engine'in temel iş fonksiyonu `extract(url, instruction, options)` metodudur. v1.0.5 itibarıyla bu fonksiyon inanılmaz bir evrim geçirmiştir:

1. **Bot Koruması Aşımı (Bot Bypass) ve Chaos Engine:** Sadece standart bir `stealth` plugin (eklenti) yetmez. `options.stealth` ve `options.lightBehavior` (İnsan davranışı simülasyonu / Chaos Engine) devreye sokulmuştur. Cloudflare ve Datadome gibi sistemleri aşmak için tarayıcı izleri tamamen maskelenir `Object.defineProperty(navigator, "webdriver", { get: () => undefined });`.
2. **Context Yönetimi:** Browser üzerinden yeni bir `newContext` açılır. Tarayıcı boyutu standart (1920x1080) tutulur, viewport ayarlanır ve sayfa `domcontentloaded` durumuna kadar beklenir. 
3. **Ekran Görüntüsü Boyutu (FullPage Flag):** Optimizasyon gereği `options.fullPage = false` varsayılandır. Eğer sayfanın altlarındaki veriler gerekliyse geliştirici bu flag'i true yapar.

### 4.3. Prompt Sanitization ve Data Serialization
AI ile konuşurken, dönen verinin her zaman sağı solu temizlenmiş bir string olması beklenemez. LLM'ler kimi zaman veriyi `` ```json `{ "data": 1 }` ``` `` şeklinde kod bloğu ile gönderir.
VisionScrape içerisinde yer alan `cleanJsonResponse(text: string): string` fonksiyonu bu problemin çözümüdür:
- Önce regex ile `^```(?:json)?\s*([\s\S]*?)\s*```$` kod blokları temizlenir.
- Ardından potansiyel XML `^<json>\s*([\s\S]*?)\s*<\/json>$` tag'leri kaldırılır.
- Dönen saf nesne JSON.parse ile decode edilir.

Herhangi bir JSON parse hatası veya AI dönüt hatası *MUTLAK* bir `try-catch` içerisinde yönetilmelidir. Aksi durumda Node prosesi çöker.

---

## 5. 3-Aşamalı Anti-Bot Sistemi (Chaos Engine) & Tarayıcı Yönetimi (`browserManager.js`)

v1.0.5 devralmasıyla klasik Playwright yönetimi yerini askeri düzeyde bir zırha bırakmıştır. VisionScrape, basit bir Headless tarayıcı sarmalı değil; siteleri kandıran 3 Aşamalı bir "Chaos Engine" donanımına sahiptir. `src/services/` klasöründe yer alan bu servisler şunlardır:

1. **`humanBehavior.js` (İnsan Davranışı Simülasyonu):** Fare aniden koordinata ışınlanmaz. Gauss dağılımı kullanılarak fare titretilir, hedefe önce yaklaşıp sonra tıklanır. `lightBehavior: true` opsiyonu ile sayfa render olurken bot rastgele scroll yaparak içeriğin tetiklenmesini (lazy-loading) doğal bir şekilde sağlar.
2. **`fingerprintForge.js` (Kimlik Sahteciliği):** Gelişmiş korumaları aşmak için her `context` açılışında WebGL görüntüleri (image data) maskelenir, Canvas üzerine mikroskobik Noise (Gürültü/Parazit) eklenir ve Battery API / ekran çözünürlüğü gibi donanım spesifikasyonları her sunucu isteğinde farklı gösterilir.
3. **`networkCloak.js` (Ağ Maskeleme):** Giden HTTP paketleri (headers, TLS fingerprint) gerçek bir Chrome ağ yapısına birebir benzetilerek Cloudflare / Akamai gibi analiz cihazlarına "ben gerçek Chrome'um" der.

Bunun yanı sıra Memory-leak (RAM Sızıntısı) önlemek için **Singleton** tasarım kalıbı geçerlidir:
- **`launch()` Süreci:** Sunucu (server.js) ayağa kalktığında ilk iş Chromium tek bir defa çalıştırılır. Yeni iz bırakmayan headless modu (new headless engine) zorunludur.
- **Resource Cleanup (Sızıntı Önleme):** İstek bitiminde oluşturulan `context` mutlaka `.close()` ile bellekten temizlenmelidir.

---

## 6. Hibrit DOM Doğrulama (Hybrid DOM Validation) - (`selectorValidator.js`)

VisionScrape'in sektördeki diğer "Görselden JSON'a" uygulamalarından ayrıldığı kilit nokta burasıdır. Halüsinasyonu engellemek.

Eğer sistemden ürün isimleri ve fiyatlar çekmek isteyip bunu API (örneğin `/api/analyze`) üzerinden yapıyorsanız, yapay zekadan şunu da bulması istenir: *"Gördüğün bu değer için DOM üzerinde CSS selector tahmin et!"*
Daha sonrasında devreye `selectorValidator.js` girer.

### 6.1. Doğrulama Algoritmasının İşleyişi (The Validation Algorithm)

1. İstek (Request), sistemin tarayıcıdan aldığı DOM yapısını (`<html>...</html>`) içeri alır.
2. `cheerio` kullanılarak çok hafif ve bellek dostu bir şekilde bu DOM hafızaya yüklenir.
3. Yapay zekanın "Şu selector'da: `.price-tag`" dediği nokta aranır.
4. Çıkan gerçek DOM text değeri ile Yapay Zekanın görselden analiz edip çıkardığı `value` karşılaştırılır.

### 6.2. Levenshtein Distance ve Fuzzy Match
Diyelim ki görsel de `MacBook Air M2` yazarken, HTML DOM'un içerisinde `MacBook Air M2 (8GB RAM)` yazıyor, ya da boşluk farklılıkları var. Dümdüz `===` (Eşittir) operatörü burada yetersiz kalır.
Mimaride gelişmiş bir **Similarity Ratio** hesabı gömülüdür:
- **Normalization (Normalizasyon):** Tüm beyaz boşluklar (whitespace), tab ve yeni satırlar tek bir boşluğa dönüştürülür ve metin tamamen küçük harfe (lowercase) çekilir.
- **Exact Intersection Containment:** Eğer bir veri, diğer veriyi tamamen kapsıyorsa (`includes`), uzunluklarına göre oranlanır.
- **Levenshtein Matrisi:** Dinamik programlama ile iki cümlenin birbirine ulaşabilmesi için kaç harfin değiştirilmesi, eklenmesi veya silinmesi gerektiği (Matrix operations) sayılır.
- **`VALIDATION_THRESHOLD = 0.6`**: Benzerlik oranı %60'in (0.6) üzerindeyse işlem **geçerli (isValidated: true)** kabul edilir. Bu oran esnek kurumsal kullanım içindir, özel istekler için artırılabilir.

---

## 7. Güvenlik, Kimlik Doğrulama ve API Katmanı (Security & API Layer)

Platform dışarı açılmaya hazır bir Express uygulaması (`server.js`) barındırır. Headless Chrome barındıran sunucular siber saldırganlar için eşsiz bir ddos aracıdır. Bu yüzden API Endpointleri korunur.

### `middleware/authGuard.js` — Timing Attack Koruması
Standard bir if bloğu (`if (req.headers['x-api-key'] === process.env.SECRET)`) kullanılamaz. Eğer böyle yapılsaydı, siber saldırganlar "Zamanlama Saldırısı (Timing Attack)" metotları kullanarak keyi karakter karakter tahmin edebilirdi (eşleşen karakter sayısı arttıkça response time nano-saniyeler uzar). 
Bunun yerine `crypto.timingSafeEqual` ve `Buffer.alloc` kullanılmıştır. Boyutlar karşılaştırılır ve ardından sabit zamanlı (constant-time) sorgulama yapılır.
Auth Guard "Fail-Closed" prensibiyle çalışır. Yani `.env` içerisinde `API_SECRET_KEY` atanmamışsa, sistem tamamen kendini kilitler ve kimseye yanıt vermez (Open by default yaklaşımı güdülmez).

CORS politikası ise oldukça dinamiktir. Virgülden (`,`) bölerek birden fazla domain (origin) sisteme whitelist üzerinden bağlanabilir, ki bu da çoklu-tenant (multi-tenant) senaryolara hazırlıktır. Payloads sınırı (limit) DOM verisinin büyüklüğü hesaba katılarak **50MB** olarak çok yüksek bir limitte tutulmuştur.

---

## 8. REST API Rotaları ve Akışı (REST API Routes & Flow)

Genel bir kazıma sürecini iki senkron ve state-less operasyona bölen iki temel Endpoint vardır.

* **1. `GET /api/health` — Sistem Kontrolü:** 
  Herkese açıktır (API Key gerektirmez), Load balancer (AWS ALB, Nginx vs) veya Datadog gibi agent'ların ping atması içindir. O anlık sunucu Memory Usage (`rss` ve `heapUsed`) değerlerini dönerek, sistemin OOM (Out of Memory) riskini monitor etme şansı verir.
  
* **2. `POST /api/fetch-site` — Birinci Aşama (Scrape Katmanı):**
  Buraya sadece hedeflenen `{ "url": "https://website.com" }` verilir. İstek geldiğinde arkadaki Playwright o siteye gider, sitenin Cloudflare bekleyişi varsa geçer. Daha sonra sitenin o an render edilmiş halinin **1) DOM HTML Tree'sini**, **2) Tam Sayfa (veya opsiyonel viewport) PNG Base64 Buffer'ını** hazırlayıp anında geri döner. Bu rota **AI** barındırmaz, sadece Browser çalıştırır.

* **3. `POST /api/analyze` — İkinci Aşama (Analiz ve Doğrulama Katmanı):** 
  İstemci (Client) bir önceki adımdan elde ettiği `Base64 Image` ve `DOM` stringlerini alır, yanına özel bir Instruction (Talimat) ekleyip bu rotaya postlar. Burada Playwright kullanılmaz, sadece Multimodal LLM (Gemini, vs) çağrılır (image + text) ve yanıt alındıktan sonra `.selectorValidator` mekanizmasına (bölüm 6) teslim edilir. Doğrulanmış veri JSON olarak dönülür.

Bu mikroservis tarzı yaklaşımın (Aşama 1 ayrı, Aşama 2 ayrı) çok büyük avantajı vardır: Frontend Veya Client uygulamaları sayfadan screenshot'ı alıp, o screenshot içinde istemedikleri alanları sansürleyip / kırpıp, küçültüp yapay zekaya sonradan teslim edebilir. Bu da Token kullanım maliyetlerini asimptotik oranlarda dibe çeker.

---

## 9. Yapay Zeka Ajanları İçin Katı Kurallar ve SOP (Strict Rules for Autonomous Agents)

Otonom kodlama asistanları (Örn. GitHub Copilot, Cursor, Gemini), bu projeye katkı sağlarken veya bug fix (hata ayıklama) yaparken `ai-vision-scraper-rules.md` ve hafızada (persistent memory) bulunan kurallara harfiyen uymalıdır:

1. **Paradigma:** "DOM Parse işlemini ben halledeyim" diyerek asla Axios + Cheerio üzerinden hedef siteye HTTP Request atarak scraping denemesi yapma. Sayfayı Playwright render etmeli ve veriyi AI Image-to-Text motoru almalıdır.
2. **Güvenlik / DI:** API anahtarlarını, Token'leri veya `process.env.GEMINI_API_KEY` gibi environment variable isimlerini asla `src/` içindeki modüllere, özellikle de `VisionEngine.ts` içine gömme. Bunlar her zaman dış dünyadan (constructor config üzerinden veya route requestlerinden) Dependency Injection (DI) yoluyla içeri sızdırılmalıdır.
3. **Prompt Mühendisliği / Yapı:** Promptları güncellediğinde, "AI Lütfen sadece JSON dön" şeklinde değil, sistematik kurallar çerçevesinde tut (Bkz `cleanJsonResponse` fonksiyonu uyumu). Markdown blokları ve yersiz konuşmaları filtreleyecek agresif sistem direktifleri yazmayı sürdür.
4. **Hata Yakalama (Resilience):** DNS kopması, Timeout (Süre aşımı), Target sunucunun yanıt vermemesi, ya da LLM sunucularının (Örn. OpenAI 502 Bad Gateway hatası) çökmesi scraping dünyasında **kaçınılmaz bir normdur**. Hiçbir metod asla Exception fırlatarak (Node Crash edişi) uygulamayı öldürmemeli. Tüm extract veya fetch işlemleri `try-catch` bloklarına hapsolmalı, hata halinde Error basılıp sistemin akışı null response ile devam ettirilmelidir.
5. **Full-Page (Görüş Ölçekleme):** Tarayıcı ekran boyutu varsayılan olarak Viewport'tur (`fullPage: false`). LLM'e base64 stringini aktarırken karakter tasarrufu yapmak kritik önemdedir. Kullanıcı aksi yönde bir API argümanı (options config) kullanmadıkça kodlarda bunu kendi başına true yapma.
6. **Dark/Light Theme Tutarsızlığı (UI Ajanları İçin Not):** Eğer VisionScrape için bir Admin UI (Gösterge Paneli) dashboard tasarlanırsa, Hafıza kurallarına uygun olarak: Koyu/Açık tema dengesi korunmalı, mavi tonlar temalar arası değişmemeli (hue-shift olmamalı) tercihleri akılda tutulmalıdır.

---

## 10. Kurulum, Geliştirme ve Deployment Metodolojileri (Setup, Dev & Deployment Methods)

Geliştirici veya DevOps ekibi için sistem ayağa kaldırma adımları:

1. **Gereksinimler:** Node.js (v18+), npm/yarn.
2. **Başlangıç:**
   `cd Engine`
   `npm install`
   Kurulumda Playwright binary dosyalarını (`npx playwright install chromium`) yüklediğinizden emin olun. (Sistem diğer tarayıcılara ihtiyaç duymaz, sadece Chromium gerekir).
3. **Environment (.env):** 
   `Engine/.env` dosyası oluşturulmalıdır.
   ```env
   # API'ye bağlanacak clientlerin kullanacağı anahtar
   API_SECRET_KEY=super_gizli_anahtar_buraya
   # Cors'un izin vereceği uygulamalar (frontend / client sunucuları)
   ALLOWED_ORIGINS=http://localhost:3000,https://benim-uygulamam.com
   # İsteğe bağlı, Eğer test.js vb dıştan Gemini kullanılacaksa (SDK kullanımı)
   GEMINI_API_KEY=AI_xxxx
   ```
4. **Çalıştırma:**
   `npm run build` ile TypeScript kaynakları JavaScript'e çevrilir (`dist/` klasörü). 
   Geliştirme için `npm run dev` kullanılmalıdır.

**Docker/Kubernetes Deployment Önerileri:**
VisionScrape'in Production'da Dockerize edilmesi gerektiğinde `mcr.microsoft.com/playwright:v1.43.0-jammy` gibi resmi resmi imajlar kullanılmalıdır. Alpine Linux imajlarında Chromium build süreçleri sıkıntı yaratır ve kütüphane eksikliği oluşur (libnss3, libatk, libdrm gibi font ve C++ kütüphaneleri eksiktir).
Sistem RAM tahsisi container başına **minimum 2GB RAM** olmalıdır. Her açılan Context 50-100MB RAM tüketimi yapacaktır (Full page boyutuna göre değişir).

---

## 11. Gelecek Vizyonu ve Genişleme İmkanları (Future Vision & Scalability)

VisionScrape'in mevcut yapısı geleceğe hazırdır. Önümüzdeki güncellemelerde eklenebilecek genişleme yapıları şunlardır:

1. **Kuyruk (Queue) Mimarisi Entegrasyonu:** BullMQ veya RabbitMQ implementasyonu. Eğer anında 5000 site analizi girmesi gerekirse Express API bunu RAM'de kaldıramaz. Analiz ve Scrape endpointlerinin arasına Redise bağlı asenkron kuyruk yapısı örülebilir.
2. **Action/Interact (Tıklama ve Form Doldurma):** Şu anda sistem URL'e gidip anlık DOM+Image alıyor. İleride Instruction kısmından şu talimatlar işlenebilir: "Ekranda Giriş Yap butonuna tıkla, kullanıcı adı kısmına admin@mail.com yaz, sonra ekran görüntüsü al." Bu yapı, VisionEngine.ts içinde Playwright'ın `page.locator().click()` logiciğiyle GPT ajanları tarafından yönlendirilebilir.
3. **Model Ensembles (Çapraz Model Karşılaştırma):** API analizini hem Gemini'ye hem OpenAI GPT-4o'ya atıp, gelen JSON verilerindeki anahtar-değer (Key-Value) farklılıklarını ölçüp hata payını (confidence score) devasa düşüren bir üst kontrol modülü eklenebilir.

---

*Bu doküman projenin kalbidir. Mimaride yapılacak her köklü yapısal değişiklik veya paradigma değişimi, bu evrak üzerinden güncellenip hem yapay zeka ajanlarına hem de developer topluluğuna duyurulmalıdır.*
