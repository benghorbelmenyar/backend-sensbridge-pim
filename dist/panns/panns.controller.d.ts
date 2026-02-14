import { PannsService } from './panns.service';
export declare class PannsController {
    private readonly pannsService;
    constructor(pannsService: PannsService);
    health(): Promise<{
        ok: boolean;
        backend: string;
        details: any;
    }>;
    predict(file: Express.Multer.File): Promise<any>;
}
