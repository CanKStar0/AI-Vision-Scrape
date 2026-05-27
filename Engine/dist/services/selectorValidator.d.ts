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
export function validateSelectors(results: Array<{
    label: any;
    value: any;
    selector: any;
    confidenceScore: any;
}>, dom: string): Array<{}>;
