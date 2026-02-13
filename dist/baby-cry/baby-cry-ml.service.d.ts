declare const CRY_TYPES: readonly ["hungry", "pain", "tired", "discomfort", "other"];
export interface BabyCryInferenceResult {
    isCry: boolean;
    confidence: number;
    type: (typeof CRY_TYPES)[number];
    typeConfidence: number;
    intensity: number;
}
export declare class BabyCryMlService {
    private readonly logger;
    private session;
    private modelLoaded;
    private modelPath;
    private modelDataPath;
    private modelsDir;
    constructor();
    loadModel(): Promise<boolean>;
    isLoaded(): boolean;
    analyze(buffer: Buffer): Promise<BabyCryInferenceResult | null>;
}
export {};
