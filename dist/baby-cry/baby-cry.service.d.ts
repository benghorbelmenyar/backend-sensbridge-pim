import { OnModuleInit } from '@nestjs/common';
import { BabyCryMlService } from './baby-cry-ml.service';
export type CryType = 'hungry' | 'pain' | 'tired' | 'discomfort' | 'other';
export interface BabyCryAnalysisResult {
    isCry: boolean;
    confidence: number;
    type?: CryType;
    typeConfidence?: number;
    intensity?: number;
    modelLoaded: boolean;
    message?: string;
}
export declare class BabyCryService implements OnModuleInit {
    private readonly mlService;
    constructor(mlService: BabyCryMlService);
    onModuleInit(): Promise<void>;
    getHealth(): {
        status: string;
        modelLoaded: boolean;
    };
    analyzeAudio(file: Express.Multer.File, _userId?: string): Promise<BabyCryAnalysisResult>;
}
