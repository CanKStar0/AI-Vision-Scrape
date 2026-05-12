# ????? AI Vision Scraper (ai-vision-scraper) — Architecture Rules & Autonomous Agent Guide

This document is the DEFINITIVE SET OF RULES that determines how the system is built and extended. All AI agents and software engineers interacting with this system **must** strictly adhere to the architectural decisions outlined in this constitution.

---

## 1. Core Philosophy and Paradigm Shift
**Rule:** Traditional DOM Parsing (Cheerio, Puppeteer XPath, etc.) is Strictly Prohibited.
* **Reason:** Traditional web scraping methods are extremely fragile against constantly changing CSS classes (e.g., Tailwind), dynamic React/Vue structures, bot protections (Cloudflare), and DOM manipulations, resulting in unsustainable maintenance debt.
* **Result:** Code that attempts to parse the underlying DOM is rejected. You MUST exclusively use the `ai-vision-scraper` core engine. The algorithms must focus on the physical rendered **visuals** of the page rather than the background source code. Data extraction should be performed via English/Turkish natural language instructions rather than rule-based selectors.

## 2. Security and Dependency Injection (DI)
**Rule:** Hardcoding API Keys is Prohibited.
* **Reason:** Hardcoded keys lead to open-source leaks and cause the project to crash in cloud deployments (AWS, Vercel, etc.).
* **Result:** Configuration must always be read from environment variables (`process.env.GEMINI_API_KEY`) or injected from the outside via the constructor when instantiating the class.
* **Proper Usage:**
  ```typescript
  import { VisionEngine } from "ai-vision-scraper";
  const apiKey = process.env.GEMINI_API_KEY;
  const engine = new VisionEngine({ apiKey }); // Dependency Injection applied.
  ```

## 3. AI Hallucinations and Strict Output Enforcement
**Rule:** The `instruction` parameter cannot allow "open-ended conversation". A strict JSON schema must be enforced.
* **Reason:** Large Language Models (LLMs) might include `markdown` code blocks or conversational phrases like "Here are your results" in their output. This causes the application to crash immediately when calling `JSON.parse()`.
* **Result:** Zero flexibility when writing instructions; keys must be clearly stated, and a strict JSON skeleton must be mandated.
* **Proper Usage:** `"Find the laptop name and price. Return strictly a JSON object with keys 'name' (string) and 'price' (string). No markdown, no comments."`

## 4. Error Handling and System Resilience
**Rule:** A raw `extract()` call can never be used naked; it must always be wrapped in a `try/catch` armor.
* **Reason:** The target site might be inaccessible (DNS error), Playwright might hit a timeout, or the target product might have been removed (resulting in a null return). Uncaught errors like these will crash the entire backend architecture.
* **Result:** Application crashes must be prevented on errors. The system should be able to recover silently or provide a fallback (e.g., returning `null`).
* **Proper Usage:**
  ```typescript
  try {
      const result = await engine.extract(url, strictInstruction);
      return result;
  } catch (error) {
      console.error(`[VisionScraper] Extraction error for URL: ${url}`, error);
      return null; // To keep the system alive.
  }
  ```

## 5. Dynamic Vision Area Management (Viewport vs. FullPage)
**Rule:** `fullPage` should remain `false` by default and only be enabled as `true` with strategic cost considerations.
* **Reason:** Rendering a mile-long page just to extract a Title (H1) or price from the Hero Section at the top is a massive waste of speed, resources, and tokens (money). Full-page captures can trigger model Rate Limits or token boundaries.
* **Result:**
  * If the target object is visible in the initial viewport upon load: `options: { fullPage: false }`
  * If searching for a table, a list of comments, or a long non-infinite-loading list: `options: { fullPage: true }` should be used.

## 6. Standard Reference Template for Agents
**Rule:** The following TypeScript template is considered the "Standard Reference Template" for other AI agents using the SDK. Any agent writing a new script/file must use this skeleton as a reference and avoid breaking the structure.

```typescript
import { VisionEngine } from "ai-vision-scraper";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    // 1. Initialize Engine with Dependency Injection
    const engine = new VisionEngine({
        apiKey: process.env.GEMINI_API_KEY // API Key is not hardcoded
        // Optional architectural settings can be added: { headless: false }, etc.
    });

    const targetUrl = "https://books.toscrape.com/";

    // 2. Strict, Schema-Defined, Guiding Instruction
    const instruction = `
    Analyze this page. Identify the first 3 book titles and their prices.
    Return strictly a JSON object with this exact structure, no markdown formatting:
    {
        "books": [
            { "title": "string", "price": "number" }
        ]
    }
    `;

    // 3. Try/Catch Armored Call (with FullPage / Viewport preference)
    try {
        console.log(`[VisionScraper] Navigating to ${targetUrl}...`);
        const result = await engine.extract(targetUrl, instruction, { fullPage: false });
        
        console.log("? Extraction Complete. Output:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("? Error detected during scraping. Fallback applied...", error);
        // Provide a suitable return or log the error to prevent system crash
    }
}

main();
```

---
*These architectural rules and templates are written to ensure long-term sustainability, cost efficiency, and stability for the project.*
