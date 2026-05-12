/**
 * geminiService.js — Gemini AI Integration Service
 *
 * Wraps the @google/generative-ai SDK to provide structured analysis
 * of cropped website screenshots paired with DOM context.
 *
 * CRITICAL: Uses responseMimeType: "application/json" to guarantee
 * the model always returns parseable JSON.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

/**
 * Initialize the Gemini client. Called lazily on first analysis request.
 */
function ensureInitialized() {
  if (model) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Set it in your .env file."
    );
  }

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1, // Low creativity — we want precise, deterministic output
      maxOutputTokens: 2048,
    },
  });

  console.log("[GeminiService] ✅ Gemini model initialized (gemini-2.0-flash)");
}

// ─── System Prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a world-class web scraping and data extraction expert. You receive two inputs:

1. A **cropped screenshot** from a website — showing a specific region the user selected.
2. The **full HTML DOM** (source code) of that page.

Your task is to:
- Identify ALL distinct data elements visible in the cropped screenshot (e.g., prices, titles, product names, dates, ratings, stock tickers, addresses, etc.).
- For EACH identified element, find the most robust and non-fragile CSS selector in the DOM that targets it. Prefer selectors based on semantic attributes (data-*, id, aria-label) over deeply nested positional selectors.
- Assign a confidence score (0.0 to 1.0) indicating how certain you are about the match.

You MUST respond with a JSON array. Each element in the array must follow this exact schema:

[
  {
    "label": "A human-readable name for this data point (e.g. 'Product Price', 'Article Title')",
    "value": "The exact text/value visible in the screenshot (e.g. '$29.99', 'Breaking News')",
    "selector": "The CSS selector to extract this value from the DOM (e.g. 'h1.product-title', '[data-price]')",
    "confidenceScore": 0.95
  }
]

Rules:
- Always return a JSON array, even if only one element is found.
- If no data elements can be identified, return an empty array: []
- Never include explanations outside the JSON structure.
- Prefer shorter, more resilient selectors over long fragile ones.
- The "value" field must contain the exact text as it appears in the screenshot.`;

/**
 * Analyze a cropped screenshot region with DOM context using Gemini AI.
 *
 * @param {string} croppedImageBase64 — Pure base64 string (no data:image prefix)
 * @param {string} dom — The full or partial HTML DOM of the page
 * @returns {Promise<Array<{label: string, value: string, selector: string, confidenceScore: number}>>}
 */
export async function analyzeWithGemini(croppedImageBase64, dom) {
  ensureInitialized();

  // Truncate DOM to avoid token overflow (Gemini has context limits)
  const MAX_DOM_CHARS = 120_000; // ~30K tokens approx
  const truncatedDom =
    dom.length > MAX_DOM_CHARS
      ? dom.substring(0, MAX_DOM_CHARS) + "\n<!-- DOM truncated -->"
      : dom;

  console.log(
    `[GeminiService] 🧠 Analyzing... (image: ${(croppedImageBase64.length / 1024).toFixed(1)} KB, DOM: ${(truncatedDom.length / 1024).toFixed(1)} KB)`
  );

  const startTime = Date.now();

  try {
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          mimeType: "image/png",
          data: croppedImageBase64,
        },
      },
      `Here is the page's HTML DOM source code:\n\n${truncatedDom}`,
    ]);

    const responseText = result.response.text();
    const elapsed = Date.now() - startTime;

    console.log(
      `[GeminiService] ✅ Analysis complete in ${elapsed}ms`
    );

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      console.error(
        "[GeminiService] ⚠️ Failed to parse Gemini response as JSON:",
        responseText.substring(0, 200)
      );
      throw new Error("AI returned malformed JSON. Please try again.");
    }

    // Ensure it's an array
    const results = Array.isArray(parsed) ? parsed : [parsed];

    // Validate and normalize each result
    return results.map((item) => ({
      label: String(item.label || "Unknown"),
      value: String(item.value || ""),
      selector: String(item.selector || ""),
      confidenceScore: Math.min(
        1,
        Math.max(0, Number(item.confidenceScore) || 0)
      ),
    }));
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(
      `[GeminiService] ❌ Analysis failed after ${elapsed}ms:`,
      error.message
    );
    throw error;
  }
}
