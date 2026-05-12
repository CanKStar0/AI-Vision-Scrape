/**
 * browserManager.js — Singleton Playwright Browser Manager
 *
 * CRITICAL DESIGN DECISION:
 * We launch a SINGLE Chromium instance when the server boots and reuse it
 * for every incoming request. Per-request isolation is achieved via
 * browser.newContext() → context.newPage(). The context (and all its pages)
 * MUST be closed in a `finally` block after each request to prevent OOM.
 *
 * Exposed API:
 *   .launch()          → Boots the singleton browser (called once at startup)
 *   .createContext()    → Returns a fresh BrowserContext for a single request
 *   .isReady()          → Returns true if the browser instance is alive
 *   .shutdown()         → Gracefully closes the browser (called on SIGINT/SIGTERM)
 */

import { chromium } from "playwright";

class BrowserManager {
  constructor() {
    /** @type {import('playwright').Browser | null} */
    this._browser = null;
    this._launching = false;
  }

  /**
   * Launch the singleton Chromium instance.
   * Safe to call multiple times — will no-op if already running.
   */
  async launch() {
    if (this._browser) {
      console.log("[BrowserManager] ♻️  Browser already running — skipping launch.");
      return;
    }

    if (this._launching) {
      console.log("[BrowserManager] ⏳ Launch already in progress — skipping.");
      return;
    }

    this._launching = true;

    try {
      console.log("[BrowserManager] 🚀 Launching headless Chromium...");

      this._browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage", // Prevents /dev/shm overflow in Docker
          "--disable-gpu",
          "--disable-extensions",
          "--disable-background-networking",
          "--disable-default-apps",
          "--no-first-run",
        ],
      });

      // Listen for unexpected disconnect
      this._browser.on("disconnected", () => {
        console.error("[BrowserManager] ⚠️  Browser disconnected unexpectedly!");
        this._browser = null;
      });

      console.log("[BrowserManager] ✅ Chromium is ready.");
    } catch (error) {
      console.error("[BrowserManager] ❌ Failed to launch Chromium:", error.message);
      this._browser = null;
      throw error;
    } finally {
      this._launching = false;
    }
  }

  /**
   * Create an isolated browser context for a single scrape request.
   * Each context gets its own cookies, cache, and storage — perfect isolation.
   *
   * @returns {Promise<import('playwright').BrowserContext>}
   */
  async createContext() {
    if (!this._browser) {
      throw new Error("Browser is not launched. Call .launch() first.");
    }

    return this._browser.newContext({
      // Mimic a real desktop browser
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "Europe/Istanbul",
      // Block unnecessary resources to speed up page load & save memory
      bypassCSP: true,
    });
  }

  /**
   * Check if the browser singleton is alive and accepting contexts.
   * @returns {boolean}
   */
  isReady() {
    return this._browser !== null && this._browser.isConnected();
  }

  /**
   * Gracefully close the browser. Called during server shutdown.
   */
  async shutdown() {
    if (!this._browser) {
      console.log("[BrowserManager] ℹ️  No browser to shut down.");
      return;
    }

    try {
      console.log("[BrowserManager] 🛑 Shutting down Chromium...");
      await this._browser.close();
      console.log("[BrowserManager] ✅ Chromium closed gracefully.");
    } catch (error) {
      console.error("[BrowserManager] ❌ Error during shutdown:", error.message);
    } finally {
      this._browser = null;
    }
  }
}

// Export a single instance — this is the Singleton
const browserManager = new BrowserManager();
export default browserManager;
