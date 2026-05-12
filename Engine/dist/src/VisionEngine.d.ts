type JsonValue = string | number | boolean | null | {
    [key: string]: JsonValue;
} | JsonValue[];
export declare class VisionEngine {
    private model;
    constructor(options?: {
        apiKey?: string;
    });
    private buildPrompt;
    extract(url: string, instruction: string): Promise<JsonValue>;
}
export default VisionEngine;
