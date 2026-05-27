/**
 * networkCloak.js — TLS/JA3 Fingerprint Masking & Chrome-Identical HTTP Layer
 *
 * PURPOSE: When making direct HTTP requests (outside Playwright), Node.js's
 * default TLS fingerprint (JA3 hash) is instantly detected by Cloudflare,
 * Akamai, and DataDome. This module masks the network layer to appear
 * identical to a real Chrome browser.
 *
 * Features:
 *   - Chrome-ordered HTTP headers (order matters for HTTP/2 fingerprinting)
 *   - Client Hints headers (sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform)
 *   - Cookie jar management (persist Cloudflare challenge cookies)
 *   - Playwright page.request passthrough (safest JA3 bypass)
 *   - Header randomization to avoid static fingerprints
 *
 * ARCHITECTURE NOTE: This module provides two fetch strategies:
 *   1. fetchDirect(url) — Direct HTTP with Chrome-like headers (lighter)
 *   2. fetchViaPage(page, url) — Uses Playwright's browser network stack (safest)
 */
// ─── Cookie Jar ─────────────────────────────────────────────────────────────────
// Simple in-memory cookie store per domain
const cookieJar = new Map();
/**
 * Extract domain from URL.
 * @param {string} url
 * @returns {string}
 */
function extractDomain(url) {
    try {
        return new URL(url).hostname;
    }
    catch {
        return url;
    }
}
/**
 * Store cookies from Set-Cookie response headers.
 * @param {string} domain
 * @param {string | string[]} setCookieHeaders
 */
function storeCookies(domain, setCookieHeaders) {
    if (!setCookieHeaders)
        return;
    const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    let cookies = cookieJar.get(domain) || {};
    for (const header of headers) {
        const parts = header.split(";")[0]; // Get name=value part only
        const [name, ...valueParts] = parts.split("=");
        if (name && valueParts.length > 0) {
            cookies[name.trim()] = valueParts.join("=").trim();
        }
    }
    cookieJar.set(domain, cookies);
}
/**
 * Get stored cookies for a domain as a Cookie header string.
 * @param {string} domain
 * @returns {string}
 */
function getCookieString(domain) {
    const cookies = cookieJar.get(domain);
    if (!cookies || Object.keys(cookies).length === 0)
        return "";
    return Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
}
// ─── Chrome-Identical Header Profiles ───────────────────────────────────────────
/**
 * Chrome version profiles for Client Hints headers.
 * Rotated to avoid static fingerprinting.
 */
const CHROME_VERSIONS = [
    { major: "131", full: "131.0.0.0", brandOrder: "Chromium", brand2: "Not_A Brand" },
    { major: "130", full: "130.0.0.0", brandOrder: "Chromium", brand2: "Not?A_Brand" },
    { major: "129", full: "129.0.0.0", brandOrder: "Chromium", brand2: "Not)A;Brand" },
];
/**
 * Build Chrome-identical headers in the EXACT order Chrome sends them.
 * Header ordering is critical — Cloudflare uses HTTP/2 header order for fingerprinting.
 *
 * @param {string} url — Target URL
 * @param {{ userAgent?: string, platform?: string }} [profileOverrides]
 * @returns {Record<string, string>}
 */
export function buildChromeHeaders(url, profileOverrides = {}) {
    const chromeVersion = CHROME_VERSIONS[Math.floor(Math.random() * CHROME_VERSIONS.length)];
    const domain = extractDomain(url);
    const cookieHeader = getCookieString(domain);
    const ua = profileOverrides.userAgent ||
        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion.full} Safari/537.36`;
    const platform = profileOverrides.platform || "Win32";
    // IMPORTANT: These headers are ordered EXACTLY as Chrome sends them.
    // Changing the order WILL change the HTTP/2 fingerprint.
    const headers = {};
    // Pseudo-headers come first in HTTP/2 (handled by the client, but order of regular headers matters)
    headers["sec-ch-ua"] = `"${chromeVersion.brandOrder}";v="${chromeVersion.major}", "${chromeVersion.brand2}";v="99", "Google Chrome";v="${chromeVersion.major}"`;
    headers["sec-ch-ua-mobile"] = "?0";
    headers["sec-ch-ua-platform"] = `"${platform === "Win32" ? "Windows" : platform === "MacIntel" ? "macOS" : "Linux"}"`;
    headers["Upgrade-Insecure-Requests"] = "1";
    headers["User-Agent"] = ua;
    headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
    headers["Sec-Fetch-Site"] = "none";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-User"] = "?1";
    headers["Sec-Fetch-Dest"] = "document";
    headers["Accept-Encoding"] = "gzip, deflate, br, zstd";
    headers["Accept-Language"] = "en-US,en;q=0.9";
    headers["Cache-Control"] = "max-age=0";
    // Add stored cookies if available
    if (cookieHeader) {
        headers["Cookie"] = cookieHeader;
    }
    // Randomly add DNT header (some real users have it)
    if (Math.random() < 0.3) {
        headers["DNT"] = "1";
    }
    return headers;
}
/**
 * Build headers for API/XHR requests (different from navigation headers).
 * @param {string} url
 * @param {string} [referer] — Referer URL
 * @returns {Record<string, string>}
 */
export function buildXHRHeaders(url, referer) {
    const headers = buildChromeHeaders(url);
    // Override Accept for JSON APIs
    headers["Accept"] = "application/json, text/plain, */*";
    headers["Sec-Fetch-Site"] = referer ? "same-origin" : "cross-site";
    headers["Sec-Fetch-Mode"] = "cors";
    headers["Sec-Fetch-Dest"] = "empty";
    delete headers["Upgrade-Insecure-Requests"];
    delete headers["Cache-Control"];
    if (referer) {
        headers["Referer"] = referer;
        headers["Origin"] = new URL(referer).origin;
    }
    return headers;
}
// ─── Fetch Strategies ───────────────────────────────────────────────────────────
/**
 * Strategy 1: Direct fetch with Chrome-like headers.
 * Uses Node.js built-in fetch (undici under the hood).
 * JA3 won't be perfect but headers will be Chrome-identical.
 *
 * @param {string} url
 * @param {{ method?: string, body?: any, headers?: Record<string, string>, profileOverrides?: object }} [options]
 * @returns {Promise<{ status: number, headers: Record<string, string>, body: string, ok: boolean }>}
 */
export async function fetchDirect(url, options = {}) {
    const method = options.method || "GET";
    const chromeHeaders = buildChromeHeaders(url, options.profileOverrides);
    // Merge with any custom headers (custom headers take priority)
    const finalHeaders = { ...chromeHeaders, ...(options.headers || {}) };
    try {
        const response = await fetch(url, {
            method,
            headers: finalHeaders,
            body: options.body ? JSON.stringify(options.body) : undefined,
            redirect: "follow",
        });
        // Store any cookies from the response
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            storeCookies(extractDomain(url), setCookie);
        }
        const body = await response.text();
        return {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body,
            ok: response.ok,
        };
    }
    catch (error) {
        console.error(`[NetworkCloak] ❌ Direct fetch failed for "${url}": ${error.message}`);
        throw error;
    }
}
/**
 * Strategy 2: Fetch via Playwright page (SAFEST — uses browser's real TLS stack).
 * The request goes through Chrome's actual network layer, so JA3 is perfect.
 *
 * @param {import('playwright').Page} page — An active Playwright page
 * @param {string} url — URL to fetch
 * @param {{ method?: string, body?: any }} [options]
 * @returns {Promise<{ status: number, body: string, ok: boolean }>}
 */
export async function fetchViaPage(page, url, options = {}) {
    try {
        const response = await page.evaluate(async ({ url, method, body }) => {
            const res = await fetch(url, {
                method: method || "GET",
                headers: { "Accept": "application/json, text/plain, */*" },
                body: body ? JSON.stringify(body) : undefined,
                credentials: "include",
            });
            return {
                status: res.status,
                body: await res.text(),
                ok: res.ok,
            };
        }, { url, method: options.method, body: options.body });
        return response;
    }
    catch (error) {
        console.error(`[NetworkCloak] ❌ Page fetch failed for "${url}": ${error.message}`);
        throw error;
    }
}
/**
 * Apply Chrome-like request interception to a Playwright context.
 * Intercepts all requests and replaces headers with Chrome-ordered ones.
 *
 * @param {import('playwright').BrowserContext} context
 */
export async function interceptRequests(context) {
    await context.route("**/*", async (route) => {
        const request = route.request();
        // Only intercept document/XHR requests, let resources pass through
        const resourceType = request.resourceType();
        if (!["document", "xhr", "fetch"].includes(resourceType)) {
            return route.continue();
        }
        const url = request.url();
        const isNavigation = resourceType === "document";
        const headers = isNavigation
            ? buildChromeHeaders(url)
            : buildXHRHeaders(url, request.headers()["referer"]);
        return route.continue({ headers });
    });
}
/**
 * Clear all stored cookies.
 * @param {string} [domain] — Clear for specific domain, or all if omitted
 */
export function clearCookies(domain) {
    if (domain) {
        cookieJar.delete(domain);
    }
    else {
        cookieJar.clear();
    }
}
/**
 * Get cookie count per domain (for debugging).
 * @returns {Record<string, number>}
 */
export function getCookieStats() {
    const stats = {};
    for (const [domain, cookies] of cookieJar.entries()) {
        stats[domain] = Object.keys(cookies).length;
    }
    return stats;
}
export default {
    buildChromeHeaders,
    buildXHRHeaders,
    fetchDirect,
    fetchViaPage,
    interceptRequests,
    clearCookies,
    getCookieStats,
};
