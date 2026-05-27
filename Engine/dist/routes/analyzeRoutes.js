/**
 * analyzeRoutes — AI analysis endpoint with DOM-based selector validation
 *
 * POST /api/analyze
 *   Body: { croppedImage: string (base64), dom: string }
 *   Returns: { success, results: Array<{label, value, selector, confidenceScore, isValidated, similarity}> }
 *
 * Flow:
 *   1. Send cropped image + DOM to Gemini AI
 *   2. Receive structured JSON with selectors
 *   3. VALIDATE each selector against the actual DOM using cheerio
 *   4. Return enriched results with isValidated flag
 */
import { Router } from "express";
import { analyzeWithGemini } from "../services/geminiService.js";
import { validateSelectors } from "../services/selectorValidator.js";
const router = Router();
// ─── POST /api/analyze ──────────────────────────────────────────────────────────
router.post("/analyze", async (req, res) => {
    const { croppedImage, dom } = req.body;
    // ── Input Validation ──
    if (!croppedImage || typeof croppedImage !== "string") {
        return res.status(400).json({
            success: false,
            error: "Request body must include a 'croppedImage' base64 string.",
        });
    }
    if (!dom || typeof dom !== "string") {
        return res.status(400).json({
            success: false,
            error: "Request body must include a 'dom' string.",
        });
    }
    // Strip the data:image/png;base64, prefix if present
    const rawBase64 = croppedImage.replace(/^data:image\/\w+;base64,/, "");
    // Basic sanity check on base64 size
    if (rawBase64.length < 100) {
        return res.status(400).json({
            success: false,
            error: "Cropped image is too small or invalid.",
        });
    }
    try {
        // ── Step 1: AI Analysis ──
        console.log("[Analyze] 🧠 Step 1/2 — AI analysis...");
        const rawResults = await analyzeWithGemini(rawBase64, dom);
        console.log(`[Analyze] ✅ AI found ${rawResults.length} data element(s)`);
        // ── Step 2: Selector Validation ──
        console.log("[Analyze] 🔍 Step 2/2 — Validating selectors against DOM...");
        const validatedResults = validateSelectors(rawResults, dom);
        const validCount = validatedResults.filter((r) => r.isValidated).length;
        const totalCount = validatedResults.length;
        console.log(`[Analyze] 🏁 Validation complete: ${validCount}/${totalCount} selectors verified`);
        return res.status(200).json({
            success: true,
            results: validatedResults,
        });
    }
    catch (error) {
        console.error("[Analyze] ❌ Analysis failed:", error.message);
        // Differentiate API key errors
        if (error.message.includes("API_KEY") ||
            error.message.includes("API key")) {
            return res.status(503).json({
                success: false,
                error: "AI service is not configured. Please set GEMINI_API_KEY.",
            });
        }
        return res.status(500).json({
            success: false,
            error: `Analysis failed: ${error.message}`,
        });
    }
});
export default router;
