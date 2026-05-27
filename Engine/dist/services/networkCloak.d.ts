/**
 * Build Chrome-identical headers in the EXACT order Chrome sends them.
 * Header ordering is critical — Cloudflare uses HTTP/2 header order for fingerprinting.
 *
 * @param {string} url — Target URL
 * @param {{ userAgent?: string, platform?: string }} [profileOverrides]
 * @returns {Record<string, string>}
 */
export function buildChromeHeaders(url: string, profileOverrides?: {
    userAgent?: string;
    platform?: string;
}): Record<string, string>;
/**
 * Build headers for API/XHR requests (different from navigation headers).
 * @param {string} url
 * @param {string} [referer] — Referer URL
 * @returns {Record<string, string>}
 */
export function buildXHRHeaders(url: string, referer?: string): Record<string, string>;
/**
 * Strategy 1: Direct fetch with Chrome-like headers.
 * Uses Node.js built-in fetch (undici under the hood).
 * JA3 won't be perfect but headers will be Chrome-identical.
 *
 * @param {string} url
 * @param {{ method?: string, body?: any, headers?: Record<string, string>, profileOverrides?: object }} [options]
 * @returns {Promise<{ status: number, headers: Record<string, string>, body: string, ok: boolean }>}
 */
export function fetchDirect(url: string, options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    profileOverrides?: object;
}): Promise<{
    status: number;
    headers: Record<string, string>;
    body: string;
    ok: boolean;
}>;
/**
 * Strategy 2: Fetch via Playwright page (SAFEST — uses browser's real TLS stack).
 * The request goes through Chrome's actual network layer, so JA3 is perfect.
 *
 * @param {import('playwright').Page} page — An active Playwright page
 * @param {string} url — URL to fetch
 * @param {{ method?: string, body?: any }} [options]
 * @returns {Promise<{ status: number, body: string, ok: boolean }>}
 */
export function fetchViaPage(page: import("playwright").Page, url: string, options?: {
    method?: string;
    body?: any;
}): Promise<{
    status: number;
    body: string;
    ok: boolean;
}>;
/**
 * Apply Chrome-like request interception to a Playwright context.
 * Intercepts all requests and replaces headers with Chrome-ordered ones.
 *
 * @param {import('playwright').BrowserContext} context
 */
export function interceptRequests(context: import("playwright").BrowserContext): Promise<void>;
/**
 * Clear all stored cookies.
 * @param {string} [domain] — Clear for specific domain, or all if omitted
 */
export function clearCookies(domain?: string): void;
/**
 * Get cookie count per domain (for debugging).
 * @returns {Record<string, number>}
 */
export function getCookieStats(): Record<string, number>;
declare namespace _default {
    export { buildChromeHeaders };
    export { buildXHRHeaders };
    export { fetchDirect };
    export { fetchViaPage };
    export { interceptRequests };
    export { clearCookies };
    export { getCookieStats };
}
export default _default;
