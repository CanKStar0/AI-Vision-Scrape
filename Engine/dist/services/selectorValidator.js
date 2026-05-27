/**
 * selectorValidator.js — DOM-based CSS Selector Validation
 *
 * After Gemini produces selectors, we validate each one by running it
 * against the ACTUAL page DOM using cheerio (lightweight, no browser needed).
 *
 * Comparison logic:
 *   - Normalize whitespace and casing
 *   - Check if the DOM-extracted text CONTAINS the AI-claimed value (or vice versa)
 *   - Use a similarity ratio for fuzzy matching
 */
import * as cheerio from "cheerio";
/**
 * Normalize a string for comparison:
 * - Collapse all whitespace to single spaces
 * - Trim leading/trailing whitespace
 * - Lowercase
 */
function normalize(str) {
    return str.replace(/\s+/g, " ").trim().toLowerCase();
}
/**
 * Calculate a simple similarity ratio between two strings.
 * Returns a value between 0.0 (no match) and 1.0 (exact match).
 *
 * Uses longest common substring ratio.
 */
function similarityRatio(a, b) {
    if (!a || !b)
        return 0;
    const normA = normalize(a);
    const normB = normalize(b);
    if (normA === normB)
        return 1.0;
    // Check containment (one string inside the other)
    if (normA.includes(normB) || normB.includes(normA)) {
        const shorter = Math.min(normA.length, normB.length);
        const longer = Math.max(normA.length, normB.length);
        return shorter / longer;
    }
    // Levenshtein-based similarity for short strings
    if (normA.length < 200 && normB.length < 200) {
        const distance = levenshteinDistance(normA, normB);
        const maxLen = Math.max(normA.length, normB.length);
        return Math.max(0, 1 - distance / maxLen);
    }
    return 0;
}
/**
 * Levenshtein distance between two strings.
 */
function levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++)
        dp[i][0] = i;
    for (let j = 0; j <= n; j++)
        dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
            else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
}
// Minimum similarity threshold to consider a match valid
const VALIDATION_THRESHOLD = 0.6;
/**
 * Validate an array of AI-generated results against the actual DOM.
 *
 * For each result, runs the CSS selector on the DOM, extracts text,
 * and compares it with the AI-claimed value.
 *
 * @param {Array<{label, value, selector, confidenceScore}>} results
 * @param {string} dom — The raw HTML DOM string
 * @returns {Array<{...result, isValidated, domText, similarity}>}
 */
export function validateSelectors(results, dom) {
    let $;
    try {
        $ = cheerio.load(dom);
    }
    catch (err) {
        console.error("[Validator] ⚠️ Failed to parse DOM with cheerio:", err.message);
        // If DOM can't be parsed, mark all as unvalidated
        return results.map((r) => ({
            ...r,
            isValidated: false,
            domText: null,
            similarity: 0,
        }));
    }
    return results.map((result) => {
        const { selector, value } = result;
        try {
            // Run the CSS selector against the DOM
            const elements = $(selector);
            if (elements.length === 0) {
                console.log(`[Validator] ❌ Selector not found: "${selector}"`);
                return {
                    ...result,
                    isValidated: false,
                    domText: null,
                    similarity: 0,
                };
            }
            // Get the text content of the first matching element
            const domText = elements.first().text().trim();
            // Compare with AI-claimed value
            const similarity = similarityRatio(domText, value);
            const isValidated = similarity >= VALIDATION_THRESHOLD;
            if (isValidated) {
                console.log(`[Validator] ✅ "${result.label}" — validated (${(similarity * 100).toFixed(0)}% match)`);
            }
            else {
                console.log(`[Validator] ❌ "${result.label}" — FAILED (${(similarity * 100).toFixed(0)}% match)`);
                console.log(`             AI value:  "${value}"`);
                console.log(`             DOM text:  "${domText.substring(0, 100)}${domText.length > 100 ? "..." : ""}"`);
            }
            return {
                ...result,
                isValidated,
                domText: domText.substring(0, 500), // Cap for response size
                similarity: Math.round(similarity * 100) / 100,
            };
        }
        catch (err) {
            // Invalid selector syntax, etc.
            console.log(`[Validator] ⚠️ Selector error for "${selector}": ${err.message}`);
            return {
                ...result,
                isValidated: false,
                domText: null,
                similarity: 0,
            };
        }
    });
}
