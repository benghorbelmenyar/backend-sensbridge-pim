import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(email: string, otp: string): Promise<{
        success: boolean;
        messageId: any;
    }>;
    sendPasswordResetConfirmation(email: string, userName: string): Promise<void>;
}
