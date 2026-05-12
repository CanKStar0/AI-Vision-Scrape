import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
chromium.use(stealth());
dotenv.config();
function cleanJsonResponse(text) {
    const trimmed = text.trim();
    const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fencedMatch) {
        return fencedMatch[1].trim();
    }
    const tagMatch = trimmed.match(/^<json>\s*([\s\S]*?)\s*<\/json>$/i);
    if (tagMatch) {
        return tagMatch[1].trim();
    }
    return trimmed;
}
export class VisionEngine {
    model;
    constructor(options) {
        const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("FATAL ERROR: API Key is missing. Provide it via options or GEMINI_API_KEY env variable.");
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({
            model: "models/gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
                maxOutputTokens: 2048,
            },
        });
    }
    buildPrompt(instruction) {
        return [
            "You are a data extraction engine.",
            "Return ONLY valid JSON based on the user's instruction.",
            "Do not include markdown, code fences, tags, or extra commentary.",
            "Use double quotes for all keys and string values.",
            "If the instruction implies multiple items, return a JSON array.",
            "If the instruction implies a single result, return a JSON object.",
            `Instruction: ${instruction}`,
        ].join("\n");
    }
    async extract(url, instruction, options = { fullPage: false }) {
        if (!url || typeof url !== "string") {
            throw new Error("A valid URL string is required.");
        }
        if (!instruction || typeof instruction !== "string") {
            throw new Error("A valid instruction string is required.");
        }
        let browser = null;
        try {
            browser = await chromium.launch({
                headless: true,
                args: ["--disable-blink-features=AutomationControlled"],
            });
            const context = await browser.newContext({
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                viewport: { width: 1920, height: 1080 },
                locale: "en-US",
                timezoneId: "Europe/Istanbul",
            });
            const page = await context.newPage();
            // Bot korumalarını atlatmak için Navigator.webdriver sancağını sil
            await page.addInitScript(() => {
                Object.defineProperty(navigator, "webdriver", { get: () => undefined });
            });
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
            await page.waitForTimeout(3000);
            const screenshotBuffer = await page.screenshot({
                fullPage: options.fullPage,
            });
            const screenshotBase64 = screenshotBuffer.toString("base64");
            const prompt = this.buildPrompt(instruction);
            const result = await this.model.generateContent([
                { text: prompt },
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: screenshotBase64,
                    },
                },
            ]);
            const rawText = result.response.text();
            const cleanedText = cleanJsonResponse(rawText);
            try {
                return JSON.parse(cleanedText);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new Error(`Failed to parse JSON from Gemini: ${message}`);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`VisionEngine extraction failed: ${message}`);
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
export default VisionEngine;
