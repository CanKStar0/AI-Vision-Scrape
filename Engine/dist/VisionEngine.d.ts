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
export interface ExtractOptions {
    fullPage?: boolean;
    /** Enable anti-detection stealth mode (default: true) */
    stealth?: boolean;
    /** Use light human behavior simulation for faster extraction (default: false) */
    lightBehavior?: boolean;
}
export declare class VisionEngine {
    private aiProvider;
    constructor(options: VisionEngineOptions);
    private buildPrompt;
    extract(url: string, instruction: string, options?: ExtractOptions): Promise<any>;
}
export default VisionEngine;
