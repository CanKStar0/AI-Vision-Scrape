import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import dotenv from "dotenv";

chromium.use(stealth());

dotenv.config();

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

function cleanJsonResponse(text: string): string {
  const trimmed = text.trim();

  // Code fence block parsing (e.g. ```json ... ```)
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  // XML-like tags (e.g. <json> ... </json>)
  const tagMatch = trimmed.match(/^<json>\s*([\s\S]*?)\s*<\/json>$/i);
  if (tagMatch) {
    return tagMatch[1].trim();
  }

  return trimmed;
}

/**
 * A generic function type that takes a prompt and a base64 encoded image,
 * and uses ANY AI model (OpenAI, Gemini, Anthropic, etc.) to evaluate it
 * and return the models text response.
 */
export type AIProviderCallback = (prompt: string, imageBase64: string) => Promise<string>;

export interface VisionEngineOptions {
  /**
   * The custom AI provider you want to use.
   * Resolves the vendor lock-in. You can connect it to OpenAI GPT-4o, Anthropic Claude 3.5, Gemini 1.5 Pro, etc.
   */
  aiProvider: AIProviderCallback;
}

export class VisionEngine {
  private aiProvider: AIProviderCallback;

  constructor(options: VisionEngineOptions) {
    if (!options || typeof options.aiProvider !== "function") {
      throw new Error(
        "FATAL ERROR: aiProvider is missing. You must provide an AI processor callback to VisionEngine."
      );
    }

    this.aiProvider = options.aiProvider;
  }

  private buildPrompt(instruction: string): string {
    return [
      "You are an advanced data extraction engine parsing visual content.",
      "Analyze the attached page screenshot.",
      "Return ONLY valid JSON based on the users instruction below.",
      "Do not include markdown, code fences, tags, or extra commentary.",
      "Use double quotes for all keys and string values.",
      "If the instruction implies multiple items, return a JSON array.",
      "If the instruction implies a single result, return a JSON object.",
      `Instruction: ${instruction}`
    ].join("\n");
  }

  public async extract(url: string, instruction: string, options: { fullPage?: boolean } = { fullPage: false }): Promise<any> {
    if (!url || typeof url !== "string") {
      throw new Error("A valid URL string is required.");
    }

    if (!instruction || typeof instruction !== "string") {
      throw new Error("A valid instruction string is required.");
    }

    let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

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
      
      // Remove Navigator.webdriver for escaping simple bot protections
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

      // Agnostic AI Call (Delegated to user implementation)
      const rawText = await this.aiProvider(prompt, screenshotBase64);
      
      const cleanedText = cleanJsonResponse(rawText);

      try {
        return JSON.parse(cleanedText) as JsonValue;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse JSON from the AI Provider: ${message} \nRaw Response: ${rawText}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`VisionEngine extraction failed: ${message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export default VisionEngine;
