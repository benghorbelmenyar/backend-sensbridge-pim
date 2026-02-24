import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dtos/register-token.dto';
import { SendNotificationDto, SendBatchNotificationDto, SubscribeTopicDto, NotificationEnabledDto } from './dtos/send-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    registerToken(dto: RegisterTokenDto, req: any): Promise<{
        success: boolean;
    }>;
    sendTest(req: any): Promise<{
        messageId?: string;
        error?: string;
    }>;
    removeToken(req: any): Promise<{
        success: boolean;
    }>;
    getHistory(req: any, page?: string, limit?: string): Promise<{
        items: import("./schemas/notification-history.schema").NotificationHistory[];
        total: number;
        page: number;
        limit: number;
    }>;
    markAsRead(id: string, req: any): Promise<{
        success: boolean;
    }>;
    subscribeTopic(dto: SubscribeTopicDto, req: any): Promise<{
        success: boolean;
    }>;
    unsubscribeTopic(dto: SubscribeTopicDto, req: any): Promise<{
        success: boolean;
    }>;
    setEnabled(body: NotificationEnabledDto, req: any): Promise<{
        success: boolean;
    }>;
    send(dto: SendNotificationDto): Promise<{
        messageId?: string;
        error?: string;
    }>;
    sendBatch(dto: SendBatchNotificationDto): Promise<{
        successCount: number;
        failureCount: number;
        errors: string[];
    }>;
}
