import { ConfigService } from '@nestjs/config';
export declare class PannsService {
    private readonly configService;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    health(): Promise<{
        ok: boolean;
        raw?: any;
    }>;
    predictFromFile(file: Express.Multer.File, deviceId?: string): Promise<any>;
}
