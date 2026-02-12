import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
export declare class AppController {
    private readonly appService;
    private readonly configService;
    constructor(appService: AppService, configService: ConfigService);
    getHello(): string;
    loginPage(res: Response): void;
}
