import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    private etherealTransporter;
    constructor(configService: ConfigService);
    private isMailConfigured;
    private getEtherealTransporter;
    sendPasswordResetEmail(email: string, otp: string): Promise<{
        success: boolean;
        messageId: any;
    }>;
    sendPasswordResetConfirmation(email: string, userName: string): Promise<void>;
    sendApprovalAcceptanceEmail(to: string, userName: string): Promise<void>;
}
