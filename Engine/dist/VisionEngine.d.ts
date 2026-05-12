export declare class VisionEngine {
    private model;
    constructor(options?: {
        apiKey?: string;
    });
    private buildPrompt;
    extract(url: string, instruction: string, options?: {
        fullPage?: boolean;
    }): Promise<any>;
}
export default VisionEngine;
