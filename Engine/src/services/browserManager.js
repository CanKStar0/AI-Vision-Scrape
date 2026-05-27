/**
 * browserManager.js — Singleton Playwright Browser Manager (Anti-Detection Enhanced)
 *
 * CRITICAL DESIGN DECISION:
 * We launch a SINGLE Chromium instance when the server boots and reuse it
 * for every incoming request. Per-request isolation is achieved via
 * browser.newContext() → context.newPage(). The context (and all its pages)
 * MUST be closed in a `finally` block after each request to prevent OOM.
 *
 * ANTI-DETECTION ENHANCEMENTS:
 *   - Uses headless: "new" (Chrome's new headless mode — harder to detect)
 *   - Integrates FingerprintForge for per-site device profile persistence
 *   - Injects anti-detection init scripts into every page
 *   - Chrome-like launch arguments to avoid automation signatures
 *   - NetworkCloak request interception for Chrome-identical headers
 *
 * Exposed API:
 *   .launch()                     → Boots the singleton browser (called once at startup)
 *   .createStealthContext(url)    → Returns a fingerprint-forged context for a URL
 *   .createContext()              → Legacy method (basic context, no fingerprinting)
 *   .isReady()                    → Returns true if the browser instance is alive
 *   .shutdown()                   → Gracefully closes the browser (called on SIGINT/SIGTERM)
 */

import { chromium } from "playwright";
import { getProfileForSite, buildInitScript } from "./fingerprintForge.js";
import { interceptRequests } from "./networkCloak.js";

class BrowserManager {
  constructor() {
    /** @type {import('playwright').Browser | null} */
    this._browser = null;
    this._launching = false;
  }

  /**
   * Launch the singleton Chromium instance with anti-detection args.
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
      console.log("[BrowserManager] 🚀 Launching headless Chromium (new headless mode)...");

      this._browser = await chromium.launch({
        // ─── NEW HEADLESS MODE ───────────────────────────────────────────
        // Chrome's "new" headless mode uses the full browser engine,
        // making it much harder for anti-bot systems to detect.
        // Unlike old headless, it renders identically to headed Chrome.
        headless: true,
        args: [
          // ─── Core stability (Docker/CI compatibility) ──────────────────
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",       // Prevents /dev/shm overflow in Docker
          "--disable-gpu",
          "--no-first-run",

          // ─── Anti-Detection arguments ──────────────────────────────────
          "--disable-blink-features=AutomationControlled",  // Remove automation flag
          "--disable-features=IsolateOrigins,site-per-process",
          "--disable-extensions",
          "--disable-background-networking",
          "--disable-default-apps",
          "--disable-infobars",              // No "Chrome is being controlled" bar
          "--disable-component-update",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-ipc-flooding-protection",
          "--enable-features=NetworkService,NetworkServiceInProcess",
          "--window-size=1920,1080",

          // ─── Reduce fingerprint surface ────────────────────────────────
          "--metrics-recording-only",
          "--no-default-browser-check",
          "--password-store=basic",
          "--use-mock-keychain",
          "--export-tagged-pdf",
        ],

        // Ignore default args that expose automation
        ignoreDefaultArgs: [
          "--enable-automation",    // This flag sets navigator.webdriver = true
        ],
      });

      // Listen for unexpected disconnect
      this._browser.on("disconnected", () => {
        console.error("[BrowserManager] ⚠️  Browser disconnected unexpectedly!");
        this._browser = null;
      });

      console.log("[BrowserManager] ✅ Chromium is ready (anti-detection mode).");
    } catch (error) {
      console.error("[BrowserManager] ❌ Failed to launch Chromium:", error.message);
      this._browser = null;
      throw error;
    } finally {
      this._launching = false;
    }
  }

  /**
   * Create an anti-detection browser context with full fingerprint forging.
   * Uses site-based session persistence — same domain gets same profile.
   *
   * @param {string} url — The target URL (used for profile selection + rate limiting)
   * @returns {Promise<import('playwright').BrowserContext>}
   */
  async createStealthContext(url) {
    if (!this._browser) {
      throw new Error("Browser is not launched. Call .launch() first.");
    }

    // Get persistent profile for this site (includes rate limit check)
    const { profile, domain } = getProfileForSite(url);

    console.log(
      `[BrowserManager] 🎭 Creating stealth context for "${domain}" ` +
      `(Profile: ${profile.id}, GPU: ${profile.webgl.renderer})`
    );

    // Create context with profile-matched settings
    const context = await this._browser.newContext({
      viewport: profile.viewport,
      userAgent: profile.userAgent,
      locale: profile.locale,
      timezoneId: profile.timezoneId,
      bypassCSP: true,
      // Randomize color scheme preference
      colorScheme: Math.random() > 0.5 ? "light" : "dark",
      // Reduce media features fingerprint
      reducedMotion: "no-preference",
      forcedColors: "none",
    });

    // ─── Inject anti-detection init script ───────────────────────────────
    // This runs BEFORE any page JavaScript, overriding fingerprint APIs
    const initScript = buildInitScript(profile);
    await context.addInitScript(initScript);

    // ─── Intercept requests for Chrome-identical headers ─────────────────
    await interceptRequests(context);

    return context;
  }

  /**
   * Legacy: Create a basic isolated browser context (no fingerprinting).
   * Kept for backward compatibility. Prefer createStealthContext() for scraping.
   *
   * @returns {Promise<import('playwright').BrowserContext>}
   */
  async createContext() {
    if (!this._browser) {
      throw new Error("Browser is not launched. Call .launch() first.");
    }

    return this._browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "Europe/Istanbul",
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
