export default browserManager;
declare const browserManager: BrowserManager;
declare class BrowserManager {
    /** @type {import('playwright').Browser | null} */
    _browser: import("playwright").Browser | null;
    _launching: boolean;
    /**
     * Launch the singleton Chromium instance with anti-detection args.
     * Safe to call multiple times — will no-op if already running.
     */
    launch(): Promise<void>;
    /**
     * Create an anti-detection browser context with full fingerprint forging.
     * Uses site-based session persistence — same domain gets same profile.
     *
     * @param {string} url — The target URL (used for profile selection + rate limiting)
     * @returns {Promise<import('playwright').BrowserContext>}
     */
    createStealthContext(url: string): Promise<import("playwright").BrowserContext>;
    /**
     * Legacy: Create a basic isolated browser context (no fingerprinting).
     * Kept for backward compatibility. Prefer createStealthContext() for scraping.
     *
     * @returns {Promise<import('playwright').BrowserContext>}
     */
    createContext(): Promise<import("playwright").BrowserContext>;
    /**
     * Check if the browser singleton is alive and accepting contexts.
     * @returns {boolean}
     */
    isReady(): boolean;
    /**
     * Gracefully close the browser. Called during server shutdown.
     */
    shutdown(): Promise<void>;
}
