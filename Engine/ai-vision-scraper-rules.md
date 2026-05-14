# 🧠 AI Vision Scraper (ai-vision-scraper) | The Autonomous Agent Protocol

This document serves as the **Standard Operating Procedure (SOP)** and **Technical Reference** for AI agents and developers interacting with the `ai-vision-scraper` library. It defines the architectural constraints, implementation patterns, and communication protocols required to maintain a state-of-the-art visual scraping engine.

---

## 🚀 1. Core Philosophy: The "Visual-First" Paradigm

Traditional scraping (DOM-based) is obsolete. Modern web development (Tailwind, Shadow DOM, Obfuscation) makes selector-based extraction fragile and high-maintenance.

- **Rule:** Never attempt to parse raw HTML/DOM unless for validation purposes.
- **Agent Instruction:** You must treat the web page as a **visual interface**. Data extraction is based on "What a human sees," not "What the source code says."
- **Benefit:** Resilience against layout shifts, class name changes, and dynamic framework rendering.

---

## 🛠 2. Architecture: Agnostic AI Provider Pattern

The engine is designed with a **Dependency Injection** pattern to avoid vendor lock-in. It provides the browser orchestration (Playwright + Stealth) and delegates the "intelligence" to a pluggable provider.

### The `AIProviderCallback` Interface
```typescript
export type AIProviderCallback = (prompt: string, imageBase64: string) => Promise<string>;
```

### Implementation Example (Gemini 1.5 Flash)
```typescript
const geminiProvider: AIProviderCallback = async (prompt, image) => {
  const result = await model.generateContent([prompt, { inlineData: { data: image, mimeType: "image/png" } }]);
  return result.response.text();
};

const engine = new VisionEngine({ aiProvider: geminiProvider });
```

---

## 📝 3. Agent Communication Protocol (Prompt Engineering)

When an agent generates instructions for the `extract()` method, it must adhere to the **Strict JSON Enforcement** protocol.

### ❌ Bad Instruction (Conversational)
> "Please look at the page and tell me the price of the first laptop you see."

### ✅ Good Instruction (Deterministic)
> "Identify the primary product title and current price. 
> Return strictly a JSON object with keys: 'productName' (string) and 'price' (number).
> No markdown formatting, no code blocks, no conversational text."

### Rule: Schema Definition
Agents MUST always provide a sample JSON schema in the instruction to minimize parsing errors.

---

## 🛡 4. Stability & Resilience (The "Armor" Rule)

Every interaction with the engine must be wrapped in a multi-layered error handling block.

1.  **Network Level:** Handle timeouts and navigation errors (Playwright).
2.  **AI Level:** Handle rate limits and content filter triggers (Provider).
3.  **Parsing Level:** Handle malformed JSON responses (LLM Hallucinations).

**Agent Requirement:** Always implement a fallback mechanism. If the AI fails to extract structured data, the system should log the raw response for debugging and return a standardized `null` or `{ error: string }`.

---

## ⚡ 5. Performance & Cost Optimization

Visual scraping is resource-intensive (Screenshot rendering + Token usage).

- **FullPage vs. Viewport:** 
    - Set `fullPage: false` (default) for Hero sections, headers, or specific elements visible above the fold.
    - Set `fullPage: true` ONLY for data tables, review lists, or footer-level information.
- **Wait Strategies:** Use `waitForTimeout(3000)` or `waitUntil: 'networkidle'` strategically to ensure lazy-loaded content is rendered before the screenshot is captured.

---

## 🔍 6. Selector Validation Layer (The Hybrid Approach)

While we prioritize visual extraction, we use a **validation layer** to cross-reference AI-generated findings with the DOM for 100% accuracy in enterprise applications.

1.  AI identifies an element visually and provides a "Best Guess" CSS selector.
2.  The engine runs `cheerio` against the page source to see if that selector exists and contains the expected data.
3.  A `confidenceScore` and `isValidated` flag are attached to the result.

---

## 📜 7. Standard Implementation Skeleton

```typescript
import { VisionEngine, AIProviderCallback } from "ai-vision-scraper";

async function runAgent() {
  // 1. Define your AI Processor (Agnostic)
  const myAI: AIProviderCallback = async (p, i) => { /* call GPT-4o or Gemini */ };

  // 2. Initialize
  const engine = new VisionEngine({ aiProvider: myAI });

  try {
    // 3. Execute with deterministic instruction
    const data = await engine.extract("https://example.com", `
      Extract product details. Return: { "title": string, "price": number }
    `, { fullPage: false });

    console.log("Extracted Data:", data);
  } catch (err) {
    console.error("Agent failed to extract data:", err.message);
  }
}
```

---
*This document is the definitive guide for AI Agents. Deviation from these rules results in system instability.*
