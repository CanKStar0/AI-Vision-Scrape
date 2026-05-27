/**
 * humanBehavior.js — Human-Like Behavior Simulation Engine (Chaos Engine)
 *
 * PURPOSE: Make automated browser interactions indistinguishable from real humans.
 * Bot detection systems (Cloudflare Turnstile, reCAPTCHA v3, DataDome) analyze:
 *   - Mouse movement patterns (linear = bot)
 *   - Click precision (center-click = bot)
 *   - Scroll behavior (instant scroll = bot)
 *   - Timing patterns (zero delay = bot)
 *
 * This module injects realistic imperfection into every interaction.
 *
 * ARCHITECTURE NOTE: Consumed by scrapeRoutes.js and VisionEngine.ts
 * after page navigation, BEFORE taking screenshots.
 */

// ─── Math Utilities ─────────────────────────────────────────────────────────────

/**
 * Random integer between min and max (inclusive).
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max.
 */
function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Gaussian-distributed random number (Box-Muller transform).
 * Returns value centered around `mean` with given `stddev`.
 */
function gaussianRandom(mean = 0, stddev = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * stddev + mean;
}

/**
 * Clamp a value between min and max.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Bezier Curve Mouse Movement ────────────────────────────────────────────────

/**
 * Calculate a point on a cubic Bezier curve.
 * @param {number} t — Parameter (0 to 1)
 * @param {number} p0 — Start point
 * @param {number} p1 — Control point 1
 * @param {number} p2 — Control point 2
 * @param {number} p3 — End point
 * @returns {number}
 */
function cubicBezier(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/**
 * Generate Bezier curve path points between two coordinates.
 * Returns an array of {x, y} points along the curve.
 *
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @param {number} [steps=25] — Number of intermediate points
 * @returns {Array<{x: number, y: number}>}
 */
function generateBezierPath(startX, startY, endX, endY, steps = 25) {
  // Randomized control points for natural-looking curves
  const cp1x = startX + (endX - startX) * randFloat(0.1, 0.4) + randInt(-80, 80);
  const cp1y = startY + (endY - startY) * randFloat(0.0, 0.3) + randInt(-60, 60);
  const cp2x = startX + (endX - startX) * randFloat(0.6, 0.9) + randInt(-50, 50);
  const cp2y = startY + (endY - startY) * randFloat(0.7, 1.0) + randInt(-40, 40);

  const actualSteps = randInt(Math.max(15, steps - 10), steps + 10);
  const points = [];

  for (let i = 0; i <= actualSteps; i++) {
    const t = i / actualSteps;
    let x = cubicBezier(t, startX, cp1x, cp2x, endX);
    let y = cubicBezier(t, startY, cp1y, cp2y, endY);

    // Add micro-jitter (human hand tremor: ±1-3px)
    x += gaussianRandom(0, 1.5);
    y += gaussianRandom(0, 1.5);

    points.push({ x: Math.round(x), y: Math.round(y) });
  }

  return points;
}

/**
 * Move the mouse along a Bezier curve from current position to target.
 * Simulates natural human hand movement with tremor and variable speed.
 *
 * @param {import('playwright').Page} page
 * @param {number} targetX
 * @param {number} targetY
 */
export async function humanMouseMove(page, targetX, targetY) {
  // Get current mouse position (default to random starting point if unknown)
  const viewport = page.viewportSize();
  const startX = randInt(100, (viewport?.width || 1920) / 2);
  const startY = randInt(100, (viewport?.height || 1080) / 2);

  const path = generateBezierPath(startX, startY, targetX, targetY);

  for (const point of path) {
    await page.mouse.move(point.x, point.y);
    // Variable delay between micro-movements (5-25ms)
    await sleep(randInt(5, 25));
  }
}

// ─── Humanized Click ────────────────────────────────────────────────────────────

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
export async function humanClick(page, selector, options = {}) {
  const maxOffsetRatio = options.maxOffsetRatio || 0.3;

  try {
    const element = page.locator(selector).first();
    const box = await element.boundingBox();

    if (!box) {
      console.warn(`[HumanBehavior] ⚠️ Element not visible: "${selector}"`);
      return;
    }

    // Gaussian offset from center (not perfect center click)
    const offsetX = gaussianRandom(0, box.width * maxOffsetRatio * 0.5);
    const offsetY = gaussianRandom(0, box.height * maxOffsetRatio * 0.5);

    const clickX = clamp(
      Math.round(box.x + box.width / 2 + offsetX),
      Math.round(box.x + 2),
      Math.round(box.x + box.width - 2)
    );
    const clickY = clamp(
      Math.round(box.y + box.height / 2 + offsetY),
      Math.round(box.y + 2),
      Math.round(box.y + box.height - 2)
    );

    // Move mouse to target via Bezier curve
    await humanMouseMove(page, clickX, clickY);

    // Pre-click hesitation (50-200ms)
    await sleep(randInt(50, 200));

    // Click
    await page.mouse.click(clickX, clickY);

    // Post-click micro-pause (30-100ms)
    await sleep(randInt(30, 100));
  } catch (error) {
    console.warn(`[HumanBehavior] ⚠️ Click failed for "${selector}": ${error.message}`);
  }
}

// ─── Natural Scroll Behavior ────────────────────────────────────────────────────

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
export async function naturalScroll(page, options = {}) {
  const maxScrolls = options.maxScrolls || randInt(3, 8);
  const scrollDownRatio = options.scrollDownRatio || 0.7; // 70% of viewport per scroll

  const viewport = page.viewportSize();
  const viewportHeight = viewport?.height || 1080;

  for (let i = 0; i < maxScrolls; i++) {
    // Variable scroll distance (50-120% of configured ratio)
    const scrollAmount = Math.round(
      viewportHeight * scrollDownRatio * randFloat(0.5, 1.2)
    );

    // Smooth scroll via multiple small steps (ease-in-out)
    const steps = randInt(5, 12);
    for (let step = 0; step < steps; step++) {
      // Ease-in-out curve
      const t = step / steps;
      const eased = t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const deltaY = Math.round((scrollAmount / steps) * (0.5 + eased));

      await page.mouse.wheel(0, deltaY);
      await sleep(randInt(20, 60));
    }

    // Reading pause (500ms - 2.5s)
    await sleep(randInt(500, 2500));

    // Occasional overscroll correction (30% chance)
    if (Math.random() < 0.3 && i > 0) {
      const correctionAmount = randInt(50, 150);
      await page.mouse.wheel(0, -correctionAmount);
      await sleep(randInt(200, 600));
    }

    // Random mouse movement during reading
    if (Math.random() < 0.4) {
      const moveX = randInt(200, (viewport?.width || 1920) - 200);
      const moveY = randInt(200, viewportHeight - 200);
      await humanMouseMove(page, moveX, moveY);
    }
  }
}

// ─── Random Idle Pause ──────────────────────────────────────────────────────────

/**
 * Simulate a random idle period where the "user" does nothing.
 * Mimics a real person pausing to read or think.
 *
 * @param {import('playwright').Page} page
 * @param {{ minMs?: number, maxMs?: number }} [options]
 */
export async function randomIdle(page, options = {}) {
  const minMs = options.minMs || 1000;
  const maxMs = options.maxMs || 4000;
  const idleTime = randInt(minMs, maxMs);

  // Sometimes move the mouse to a "parked" position during idle
  if (Math.random() < 0.5) {
    const viewport = page.viewportSize();
    const parkX = randInt(100, (viewport?.width || 1920) - 100);
    const parkY = randInt(100, (viewport?.height || 1080) - 100);
    await page.mouse.move(parkX, parkY);
  }

  await sleep(idleTime);
}

// ─── Typing Simulation ─────────────────────────────────────────────────────────

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
export async function humanType(page, text, options = {}) {
  const typoChance = options.typoChance || 0.08;
  const nearbyKeys = {
    a: "sq", b: "vn", c: "xv", d: "sf", e: "wr", f: "dg", g: "fh",
    h: "gj", i: "uo", j: "hk", k: "jl", l: "kp", m: "n,", n: "bm",
    o: "ip", p: "ol", q: "wa", r: "et", s: "ad", t: "ry", u: "yi",
    v: "cb", w: "qe", x: "zc", y: "tu", z: "xs",
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Typo simulation
    if (Math.random() < typoChance && nearbyKeys[char.toLowerCase()]) {
      const wrongChars = nearbyKeys[char.toLowerCase()];
      const wrongChar = wrongChars[Math.floor(Math.random() * wrongChars.length)];

      await page.keyboard.press(wrongChar);
      await sleep(randInt(100, 300)); // Notice the typo
      await page.keyboard.press("Backspace");
      await sleep(randInt(50, 150));
    }

    // Type the correct character
    await page.keyboard.press(char);

    // Variable inter-key delay
    const delay = char === " " ? randInt(80, 200) : randInt(50, 150);
    await sleep(delay);
  }
}

// ─── Full Human Simulation Sequence ─────────────────────────────────────────────

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
export async function simulateHumanBehavior(page, options = {}) {
  const isLight = options.light || false;

  try {
    console.log("[HumanBehavior] 🧑 Simulating human behavior...");

    // Step 1: Initial idle (user "looking" at the page)
    await randomIdle(page, {
      minMs: isLight ? 500 : 1000,
      maxMs: isLight ? 1500 : 3000,
    });

    // Step 2: Random mouse movement (user moving cursor around)
    const viewport = page.viewportSize();
    const moveX = randInt(300, (viewport?.width || 1920) - 300);
    const moveY = randInt(200, (viewport?.height || 1080) - 200);
    await humanMouseMove(page, moveX, moveY);

    // Step 3: Natural scroll (unless light mode)
    if (!isLight) {
      await naturalScroll(page, { maxScrolls: randInt(2, 5) });

      // Scroll back to top for screenshot
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await sleep(randInt(500, 1000));
    }

    // Step 4: Final idle before action
    await randomIdle(page, { minMs: 300, maxMs: isLight ? 800 : 1500 });

    console.log("[HumanBehavior] ✅ Human behavior simulation complete.");
  } catch (error) {
    // Non-fatal — log and continue
    console.warn(`[HumanBehavior] ⚠️ Behavior simulation error (non-fatal): ${error.message}`);
  }
}

export default {
  humanMouseMove,
  humanClick,
  naturalScroll,
  randomIdle,
  humanType,
  simulateHumanBehavior,
};
