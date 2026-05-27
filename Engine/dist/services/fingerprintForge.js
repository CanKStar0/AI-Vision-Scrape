/**
 * fingerprintForge.js — Browser Fingerprint Manipulation Engine
 *
 * PURPOSE: Prevent bot detection by making the browser appear as a real user device.
 *
 * Features:
 *   - 10+ realistic device profiles (Windows/Mac/Linux)
 *   - WebGL vendor/renderer spoofing (no more "Google SwiftShader")
 *   - Canvas fingerprint noise injection
 *   - Navigator property overrides (plugins, languages, memory, etc.)
 *   - Battery Status API spoofing
 *   - Site-based session persistence (same site = same profile)
 *   - Built-in rate limiter per domain
 *
 * ARCHITECTURE NOTE: This module is consumed by browserManager.js
 * via getProfileForSite() and getInitScript(). It does NOT launch browsers.
 */
// ─── Device Profile Pool ────────────────────────────────────────────────────────
const DEVICE_PROFILES = [
    {
        id: "win-chrome-intel-1",
        platform: "Win32",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        viewport: { width: 1920, height: 1080 },
        screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, colorDepth: 24 },
        deviceMemory: 16,
        hardwareConcurrency: 8,
        maxTouchPoints: 0,
        webgl: { vendor: "Intel Inc.", renderer: "Intel Iris OpenGL Engine" },
        languages: ["en-US", "en"],
        locale: "en-US",
        timezoneId: "America/New_York",
    },
    {
        id: "win-chrome-nvidia-1",
        platform: "Win32",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        viewport: { width: 1536, height: 864 },
        screen: { width: 1536, height: 864, availWidth: 1536, availHeight: 824, colorDepth: 24 },
        deviceMemory: 8,
        hardwareConcurrency: 12,
        maxTouchPoints: 0,
        webgl: { vendor: "NVIDIA Corporation", renderer: "NVIDIA GeForce GTX 1660 Ti/PCIe/SSE2" },
        languages: ["en-US", "en"],
        locale: "en-US",
        timezoneId: "America/Chicago",
    },
    {
        id: "win-chrome-amd-1",
        platform: "Win32",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        viewport: { width: 2560, height: 1440 },
        screen: { width: 2560, height: 1440, availWidth: 2560, availHeight: 1400, colorDepth: 24 },
        deviceMemory: 32,
        hardwareConcurrency: 16,
        maxTouchPoints: 0,
        webgl: { vendor: "ATI Technologies Inc.", renderer: "AMD Radeon RX 6800 XT" },
        languages: ["en-US", "en", "de"],
        locale: "en-US",
        timezoneId: "Europe/Berlin",
    },
    {
        id: "mac-chrome-apple-1",
        platform: "MacIntel",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        viewport: { width: 1440, height: 900 },
        screen: { width: 1440, height: 900, availWidth: 1440, availHeight: 875, colorDepth: 30 },
        deviceMemory: 8,
        hardwareConcurrency: 8,
        maxTouchPoints: 0,
        webgl: { vendor: "Apple", renderer: "Apple M1" },
        languages: ["en-US", "en"],
        locale: "en-US",
        timezoneId: "America/Los_Angeles",
    },
    {
        id: "mac-chrome-apple-2",
        platform: "MacIntel",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        viewport: { width: 2560, height: 1600 },
        screen: { width: 2560, height: 1600, availWidth: 2560, availHeight: 1575, colorDepth: 30 },
        deviceMemory: 16,
        hardwareConcurrency: 10,
        maxTouchPoints: 0,
        webgl: { vendor: "Apple", renderer: "Apple M2 Pro" },
        languages: ["en-US", "en", "fr"],
        locale: "en-US",
        timezoneId: "Europe/Paris",
    },
    {
        id: "win-chrome-intel-2",
        platform: "Win32",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        viewport: { width: 1366, height: 768 },
        screen: { width: 1366, height: 768, availWidth: 1366, availHeight: 728, colorDepth: 24 },
        deviceMemory: 4,
        hardwareConcurrency: 4,
        maxTouchPoints: 0,
        webgl: { vendor: "Intel Inc.", renderer: "Intel UHD Graphics 620" },
        languages: ["en-US", "en"],
        locale: "en-US",
        timezoneId: "Europe/London",
    },
    {
        id: "linux-chrome-nvidia-1",
        platform: "Linux x86_64",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        viewport: { width: 1920, height: 1080 },
        screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1053, colorDepth: 24 },
        deviceMemory: 16,
        hardwareConcurrency: 8,
        maxTouchPoints: 0,
        webgl: { vendor: "NVIDIA Corporation", renderer: "NVIDIA GeForce RTX 3070/PCIe/SSE2" },
        languages: ["en-US", "en"],
        locale: "en-US",
        timezoneId: "America/New_York",
    },
    {
        id: "win-chrome-nvidia-2",
        platform: "Win32",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        viewport: { width: 1920, height: 1200 },
        screen: { width: 1920, height: 1200, availWidth: 1920, availHeight: 1160, colorDepth: 24 },
        deviceMemory: 16,
        hardwareConcurrency: 8,
        maxTouchPoints: 0,
        webgl: { vendor: "NVIDIA Corporation", renderer: "NVIDIA GeForce RTX 4060/PCIe/SSE2" },
        languages: ["en-US", "en", "tr"],
        locale: "en-US",
        timezoneId: "Europe/Istanbul",
    },
    {
        id: "mac-chrome-apple-3",
        platform: "MacIntel",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        viewport: { width: 1680, height: 1050 },
        screen: { width: 1680, height: 1050, availWidth: 1680, availHeight: 1025, colorDepth: 30 },
        deviceMemory: 8,
        hardwareConcurrency: 8,
        maxTouchPoints: 0,
        webgl: { vendor: "Apple", renderer: "Apple M3" },
        languages: ["en-US", "en", "ja"],
        locale: "en-US",
        timezoneId: "Asia/Tokyo",
    },
    {
        id: "win-chrome-intel-3",
        platform: "Win32",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        viewport: { width: 1600, height: 900 },
        screen: { width: 1600, height: 900, availWidth: 1600, availHeight: 860, colorDepth: 24 },
        deviceMemory: 8,
        hardwareConcurrency: 6,
        maxTouchPoints: 0,
        webgl: { vendor: "Intel Inc.", renderer: "Intel HD Graphics 630" },
        languages: ["en-US", "en", "es"],
        locale: "en-US",
        timezoneId: "America/Mexico_City",
    },
];
// ─── Site-Based Session Persistence ─────────────────────────────────────────────
// Maps domain → { profileIndex, lastAccess, requestCount }
const siteSessionMap = new Map();
// ─── Rate Limiter ───────────────────────────────────────────────────────────────
const RATE_LIMIT = {
    maxRequestsPerMinute: 10,
    cooldownMs: 60_000,
    minDelayBetweenRequests: 2_000, // Minimum 2s between requests to same domain
};
/**
 * Extract the root domain from a URL string.
 * @param {string} url
 * @returns {string}
 */
function extractDomain(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    }
    catch {
        return url;
    }
}
/**
 * Check rate limit for a domain. Throws if limit exceeded.
 * @param {string} domain
 */
function checkRateLimit(domain) {
    const now = Date.now();
    const session = siteSessionMap.get(domain);
    if (!session)
        return; // First request — no limit
    // Clean up old request timestamps
    session.requestTimestamps = (session.requestTimestamps || []).filter((ts) => now - ts < RATE_LIMIT.cooldownMs);
    // Check requests per minute
    if (session.requestTimestamps.length >= RATE_LIMIT.maxRequestsPerMinute) {
        const oldestInWindow = session.requestTimestamps[0];
        const waitMs = RATE_LIMIT.cooldownMs - (now - oldestInWindow);
        throw new Error(`[FingerprintForge] ⛔ Rate limit exceeded for "${domain}". ` +
            `Max ${RATE_LIMIT.maxRequestsPerMinute} requests/minute. ` +
            `Try again in ${Math.ceil(waitMs / 1000)}s.`);
    }
    // Check minimum delay between requests
    if (session.lastAccess && now - session.lastAccess < RATE_LIMIT.minDelayBetweenRequests) {
        const waitMs = RATE_LIMIT.minDelayBetweenRequests - (now - session.lastAccess);
        throw new Error(`[FingerprintForge] ⛔ Too fast for "${domain}". ` +
            `Minimum ${RATE_LIMIT.minDelayBetweenRequests}ms between requests. ` +
            `Wait ${waitMs}ms.`);
    }
}
/**
 * Record a request for rate limiting.
 * @param {string} domain
 */
function recordRequest(domain) {
    const now = Date.now();
    const session = siteSessionMap.get(domain);
    if (session) {
        session.lastAccess = now;
        session.requestCount = (session.requestCount || 0) + 1;
        if (!session.requestTimestamps)
            session.requestTimestamps = [];
        session.requestTimestamps.push(now);
    }
}
/**
 * Get a consistent fingerprint profile for a given URL.
 * Same domain always gets the same profile (session persistence).
 * Rate limiting is enforced.
 *
 * @param {string} url — The target URL
 * @returns {{ profile: object, domain: string }}
 */
export function getProfileForSite(url) {
    const domain = extractDomain(url);
    // Check rate limit before proceeding
    checkRateLimit(domain);
    let session = siteSessionMap.get(domain);
    if (!session) {
        // First visit — assign a random profile
        const profileIndex = Math.floor(Math.random() * DEVICE_PROFILES.length);
        session = {
            profileIndex,
            lastAccess: Date.now(),
            requestCount: 1,
            requestTimestamps: [Date.now()],
        };
        siteSessionMap.set(domain, session);
        console.log(`[FingerprintForge] 🎭 New session for "${domain}" → Profile: "${DEVICE_PROFILES[profileIndex].id}"`);
    }
    else {
        // Record the request
        recordRequest(domain);
    }
    const profile = DEVICE_PROFILES[session.profileIndex];
    return { profile, domain };
}
/**
 * Generate a random battery level for Battery Status API spoofing.
 * @returns {{ level: number, charging: boolean, chargingTime: number, dischargingTime: number }}
 */
function generateBatteryStatus() {
    const level = 0.2 + Math.random() * 0.75; // 20% - 95%
    const charging = Math.random() > 0.6;
    return {
        level: Math.round(level * 100) / 100,
        charging,
        chargingTime: charging ? Math.floor(Math.random() * 3600) : Infinity,
        dischargingTime: charging ? Infinity : Math.floor(3600 + Math.random() * 14400),
    };
}
/**
 * Build the init script that overrides browser fingerprint properties.
 * This script is injected into every page via page.addInitScript().
 *
 * @param {object} profile — A device profile from the pool
 * @returns {string} — JavaScript code to inject
 */
export function buildInitScript(profile) {
    const battery = generateBatteryStatus();
    // We return a string that will be evaluated in the browser context
    return `
    // ═══════════════════════════════════════════════════════════════════════
    // FingerprintForge — Anti-Detection Init Script
    // Profile: ${profile.id}
    // ═══════════════════════════════════════════════════════════════════════

    // 1. Remove webdriver flag
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

    // 2. Override navigator properties
    Object.defineProperty(navigator, 'platform', { get: () => '${profile.platform}' });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => ${profile.deviceMemory} });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => ${profile.hardwareConcurrency} });
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => ${profile.maxTouchPoints} });
    Object.defineProperty(navigator, 'languages', { get: () => ${JSON.stringify(profile.languages)} });
    Object.defineProperty(navigator, 'language', { get: () => '${profile.languages[0]}' });

    // 3. Chrome plugins mock (Chrome default 5 plugins)
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const pluginData = [
          { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
          { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
          { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        ];
        const plugins = Object.create(PluginArray.prototype);
        pluginData.forEach((p, i) => {
          const plugin = Object.create(Plugin.prototype);
          Object.defineProperties(plugin, {
            name: { value: p.name, enumerable: true },
            filename: { value: p.filename, enumerable: true },
            description: { value: p.description, enumerable: true },
            length: { value: 1, enumerable: true },
          });
          Object.defineProperty(plugins, i, { value: plugin, enumerable: true });
        });
        Object.defineProperty(plugins, 'length', { value: pluginData.length });
        return plugins;
      }
    });

    // 4. WebGL vendor/renderer spoofing
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
      const UNMASKED_VENDOR = 0x9245;
      const UNMASKED_RENDERER = 0x9246;
      if (param === UNMASKED_VENDOR) return '${profile.webgl.vendor}';
      if (param === UNMASKED_RENDERER) return '${profile.webgl.renderer}';
      return originalGetParameter.call(this, param);
    };
    // Also for WebGL2
    if (typeof WebGL2RenderingContext !== 'undefined') {
      const originalGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function(param) {
        const UNMASKED_VENDOR = 0x9245;
        const UNMASKED_RENDERER = 0x9246;
        if (param === UNMASKED_VENDOR) return '${profile.webgl.vendor}';
        if (param === UNMASKED_RENDERER) return '${profile.webgl.renderer}';
        return originalGetParameter2.call(this, param);
      };
    }

    // 5. Canvas fingerprint noise injection
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
      const ctx = this.getContext('2d');
      if (ctx && this.width > 0 && this.height > 0) {
        try {
          const imageData = ctx.getImageData(0, 0, Math.min(this.width, 2), Math.min(this.height, 2));
          // Add imperceptible noise to a single pixel
          imageData.data[0] = (imageData.data[0] + Math.floor(Math.random() * 3)) % 256;
          ctx.putImageData(imageData, 0, 0);
        } catch(e) { /* CORS or empty canvas — ignore */ }
      }
      return originalToDataURL.call(this, type, quality);
    };

    // 6. Battery Status API spoofing
    if (navigator.getBattery) {
      navigator.getBattery = () => Promise.resolve({
        level: ${battery.level},
        charging: ${battery.charging},
        chargingTime: ${battery.chargingTime === Infinity ? 'Infinity' : battery.chargingTime},
        dischargingTime: ${battery.dischargingTime === Infinity ? 'Infinity' : battery.dischargingTime},
        addEventListener: () => {},
        removeEventListener: () => {},
      });
    }

    // 7. window.chrome runtime mock
    if (!window.chrome) {
      window.chrome = {};
    }
    if (!window.chrome.runtime) {
      window.chrome.runtime = {
        connect: () => {},
        sendMessage: () => {},
        onMessage: { addListener: () => {} },
      };
    }

    // 8. Screen properties
    Object.defineProperty(screen, 'width', { get: () => ${profile.screen.width} });
    Object.defineProperty(screen, 'height', { get: () => ${profile.screen.height} });
    Object.defineProperty(screen, 'availWidth', { get: () => ${profile.screen.availWidth} });
    Object.defineProperty(screen, 'availHeight', { get: () => ${profile.screen.availHeight} });
    Object.defineProperty(screen, 'colorDepth', { get: () => ${profile.screen.colorDepth} });
    Object.defineProperty(screen, 'pixelDepth', { get: () => ${profile.screen.colorDepth} });

    // 9. Outer dimensions (browser chrome simulation)
    Object.defineProperty(window, 'outerWidth', { get: () => ${profile.screen.width} });
    Object.defineProperty(window, 'outerHeight', { get: () => ${profile.screen.height + 85} });

    // 10. Permissions API — return "prompt" instead of bot-signature "denied"
    if (navigator.permissions) {
      const originalQuery = navigator.permissions.query;
      navigator.permissions.query = (params) => {
        if (params.name === 'notifications') {
          return Promise.resolve({ state: Notification.permission || 'prompt', onchange: null });
        }
        return originalQuery.call(navigator.permissions, params);
      };
    }

    // 11. Notification permission
    Object.defineProperty(Notification, 'permission', { get: () => 'default' });

    // 12. Connection API (NetworkInformation)
    if (navigator.connection) {
      Object.defineProperty(navigator.connection, 'rtt', { get: () => ${50 + Math.floor(Math.random() * 100)} });
      Object.defineProperty(navigator.connection, 'downlink', { get: () => ${5 + Math.round(Math.random() * 20)} });
      Object.defineProperty(navigator.connection, 'effectiveType', { get: () => '4g' });
    }
  `;
}
/**
 * Get current rate limit status for a domain.
 * @param {string} url
 * @returns {{ domain: string, requestCount: number, profileId: string | null, isLimited: boolean }}
 */
export function getRateLimitStatus(url) {
    const domain = extractDomain(url);
    const session = siteSessionMap.get(domain);
    if (!session) {
        return { domain, requestCount: 0, profileId: null, isLimited: false };
    }
    const now = Date.now();
    const recentRequests = (session.requestTimestamps || []).filter((ts) => now - ts < RATE_LIMIT.cooldownMs);
    return {
        domain,
        requestCount: session.requestCount || 0,
        profileId: DEVICE_PROFILES[session.profileIndex]?.id || null,
        isLimited: recentRequests.length >= RATE_LIMIT.maxRequestsPerMinute,
    };
}
/**
 * Clear session data for a specific domain or all domains.
 * @param {string} [domain] — If omitted, clears ALL sessions
 */
export function clearSessions(domain) {
    if (domain) {
        siteSessionMap.delete(domain);
        console.log(`[FingerprintForge] 🗑️  Session cleared for "${domain}"`);
    }
    else {
        siteSessionMap.clear();
        console.log("[FingerprintForge] 🗑️  All sessions cleared.");
    }
}
export default {
    getProfileForSite,
    buildInitScript,
    getRateLimitStatus,
    clearSessions,
};
