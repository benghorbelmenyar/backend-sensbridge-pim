import { BabyCryService, BabyCryAnalysisResult } from './baby-cry.service';
export declare class BabyCryController {
    private readonly babyCryService;
    constructor(babyCryService: BabyCryService);
    getHealth(): {
        status: string;
        modelLoaded: boolean;
    };
    analyze(file: Express.Multer.File, userId?: string): Promise<BabyCryAnalysisResult>;
}
