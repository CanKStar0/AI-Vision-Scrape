/**
 * Move the mouse along a Bezier curve from current position to target.
 * Simulates natural human hand movement with tremor and variable speed.
 *
 * @param {import('playwright').Page} page
 * @param {number} targetX
 * @param {number} targetY
 */
export function humanMouseMove(page: import("playwright").Page, targetX: number, targetY: number): Promise<void>;
/**
 * Click on an element with human-like imprecision.
 * - Moves mouse via Bezier curve to near the element
 * - Applies Gaussian offset (not dead-center)
 * - Adds pre-click hesitation delay
 *
 * @param {import('playwright').Page} page
 * @param {string} selector — CSS selector of target element
 * @param {{ maxOffsetRatio?: number }} [options]
 */
export function humanClick(page: import("playwright").Page, selector: string, options?: {
    maxOffsetRatio?: number;
}): Promise<void>;
/**
 * Scroll the page in a natural, human-like pattern.
 * Features:
 *   - Ease-in-out speed curve
 *   - Random reading pauses
 *   - Occasional overscroll correction (scroll up a bit)
 *   - Variable scroll distances
 *
 * @param {import('playwright').Page} page
 * @param {{ maxScrolls?: number, scrollDownRatio?: number }} [options]
 */
export function naturalScroll(page: import("playwright").Page, options?: {
    maxScrolls?: number;
    scrollDownRatio?: number;
}): Promise<void>;
/**
 * Simulate a random idle period where the "user" does nothing.
 * Mimics a real person pausing to read or think.
 *
 * @param {import('playwright').Page} page
 * @param {{ minMs?: number, maxMs?: number }} [options]
 */
export function randomIdle(page: import("playwright").Page, options?: {
    minMs?: number;
    maxMs?: number;
}): Promise<void>;
/**
 * Type text into a focused element with human-like timing.
 * Features:
 *   - Variable delay per character (50-150ms)
 *   - Occasional typo + backspace correction (10% chance per char)
 *   - Shift key simulation for uppercase
 *
 * @param {import('playwright').Page} page
 * @param {string} text — Text to type
 * @param {{ typoChance?: number }} [options]
 */
export function humanType(page: import("playwright").Page, text: string, options?: {
    typoChance?: number;
}): Promise<void>;
/**
 * Run a complete human behavior simulation on a page.
 * Call this AFTER page navigation and BEFORE taking screenshots.
 *
 * Sequence:
 *   1. Random idle pause (thinking/reading)
 *   2. Small mouse movements
 *   3. Natural scroll down the page
 *   4. Final idle before screenshot
 *
 * @param {import('playwright').Page} page
 * @param {{ light?: boolean }} [options] — If light=true, minimal simulation (faster)
 */
export function simulateHumanBehavior(page: import("playwright").Page, options?: {
    light?: boolean;
}): Promise<void>;
declare namespace _default {
    export { humanMouseMove };
    export { humanClick };
    export { naturalScroll };
    export { randomIdle };
    export { humanType };
    export { simulateHumanBehavior };
}
export default _default;
