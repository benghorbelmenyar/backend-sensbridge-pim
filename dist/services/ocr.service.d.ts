import { ConfigService } from '@nestjs/config';
interface OcrAnalysisResult {
    isValid: boolean;
    confidence: number;
    extractedData: {
        fullName?: string;
        cardNumber?: string;
        expiryDate?: string;
        disabilityType?: string;
    };
    reason?: string;
}
export declare class OcrService {
    private configService;
    private genAI;
    constructor(configService: ConfigService);
    analyzeHandicapCard(imagePath: string): Promise<OcrAnalysisResult>;
    private getMimeType;
    verifyNameMatch(extractedName: string | undefined, userName: string): boolean;
}
export {};
