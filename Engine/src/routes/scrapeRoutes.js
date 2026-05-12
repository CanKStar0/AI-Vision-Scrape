/**
 * scrapeRoutes — Core scraping endpoints
 *
 * POST /api/fetch-site
 *   Body: { url: string }
 *   Returns: { success, screenshot (base64), dom (string), pageTitle }
 */

import { Router } from "express";
import browserManager from "../services/browserManager.js";

const router = Router();

/**
 * Validate a URL string (must be http or https).
 * @param {string} urlString
 * @returns {boolean}
 */
function isValidUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ─── POST /api/fetch-site ───────────────────────────────────────────────────────
router.post("/fetch-site", async (req, res) => {
  const { url } = req.body;

  // ── Input Validation ──
  if (!url || typeof url !== "string") {
    return res.status(400).json({
      success: false,
      error: "Request body must include a valid 'url' string.",
    });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({
      success: false,
      error: `Invalid URL: "${url}". Only http/https protocols are accepted.`,
    });
  }

  // ── Browser Health Check ──
  if (!browserManager.isReady()) {
    return res.status(503).json({
      success: false,
      error: "Browser engine is not ready. Please try again shortly.",
    });
  }

  let context = null;

  try {
    // 1. Create an isolated context + page
    context = await browserManager.createContext();
    const page = await context.newPage();

    console.log(`[Scrape] 🌐 Navigating to: ${url}`);

    // 2. Navigate — wait until network is idle
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    // 3. Capture full-page screenshot as base64
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: "png",
    });
    const screenshotBase64 = screenshotBuffer.toString("base64");

    // 4. Extract DOM innerHTML
    const dom = await page.evaluate(() => document.body.innerHTML);

    // 5. Grab page title for metadata
    const pageTitle = await page.title();

    // 6. Get page dimensions (useful for coordinate mapping later)
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.body.scrollWidth,
      scrollHeight: document.body.scrollHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }));

    console.log(`[Scrape] ✅ Success — "${pageTitle}" (DOM: ${(dom.length / 1024).toFixed(1)} KB)`);

    return res.status(200).json({
      success: true,
      screenshot: `data:image/png;base64,${screenshotBase64}`,
      dom,
      pageTitle,
      dimensions,
    });
  } catch (error) {
    console.error(`[Scrape] ❌ Error scraping "${url}":`, error.message);

    // Differentiate timeout from other errors
    if (error.message.includes("Timeout") || error.message.includes("timeout")) {
      return res.status(408).json({
        success: false,
        error: `Navigation timeout: The page at "${url}" did not finish loading within 30 seconds.`,
      });
    }

    return res.status(500).json({
      success: false,
      error: `Scraping failed: ${error.message}`,
    });
  } finally {
    // ── CRITICAL: Always dispose the context to prevent memory leaks ──
    if (context) {
      await context.close().catch((err) => {
        console.error("[Scrape] ⚠️ Failed to close context:", err.message);
      });
    }
  }
});

export default router;

