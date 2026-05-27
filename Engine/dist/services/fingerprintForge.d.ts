/**
 * Get a consistent fingerprint profile for a given URL.
 * Same domain always gets the same profile (session persistence).
 * Rate limiting is enforced.
 *
 * @param {string} url — The target URL
 * @returns {{ profile: object, domain: string }}
 */
export function getProfileForSite(url: string): {
    profile: object;
    domain: string;
};
/**
 * Build the init script that overrides browser fingerprint properties.
 * This script is injected into every page via page.addInitScript().
 *
 * @param {object} profile — A device profile from the pool
 * @returns {string} — JavaScript code to inject
 */
export function buildInitScript(profile: object): string;
/**
 * Get current rate limit status for a domain.
 * @param {string} url
 * @returns {{ domain: string, requestCount: number, profileId: string | null, isLimited: boolean }}
 */
export function getRateLimitStatus(url: string): {
    domain: string;
    requestCount: number;
    profileId: string | null;
    isLimited: boolean;
};
/**
 * Clear session data for a specific domain or all domains.
 * @param {string} [domain] — If omitted, clears ALL sessions
 */
export function clearSessions(domain?: string): void;
declare namespace _default {
    export { getProfileForSite };
    export { buildInitScript };
    export { getRateLimitStatus };
    export { clearSessions };
}
export default _default;
