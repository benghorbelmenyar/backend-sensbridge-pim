import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { NotificationHistory } from './schemas/notification-history.schema';
export declare class NotificationsService {
    private userModel;
    private notificationHistoryModel;
    constructor(userModel: Model<User>, notificationHistoryModel: Model<NotificationHistory>);
    registerToken(userId: string, token: string): Promise<{
        success: boolean;
    }>;
    removeToken(userId: string): Promise<{
        success: boolean;
    }>;
    sendToUser(userId: string, type: string, title: string, body: string, data?: Record<string, string>, imageUrl?: string): Promise<{
        messageId?: string;
        error?: string;
    }>;
    sendBatch(userIds: string[], type: string, title: string, body: string, data?: Record<string, string>, imageUrl?: string): Promise<{
        successCount: number;
        failureCount: number;
        errors: string[];
    }>;
    sendWithTemplate(userId: string, templateKey: string, variables: Record<string, string>): Promise<{
        messageId?: string;
        error?: string;
    }>;
    subscribeToTopic(userId: string, topic: string): Promise<{
        success: boolean;
    }>;
    unsubscribeFromTopic(userId: string, topic: string): Promise<{
        success: boolean;
    }>;
    getHistory(userId: string, page?: number, limit?: number): Promise<{
        items: NotificationHistory[];
        total: number;
        page: number;
        limit: number;
    }>;
    markAsRead(userId: string, notificationId: string): Promise<{
        success: boolean;
    }>;
    setNotificationEnabled(userId: string, enabled: boolean): Promise<{
        success: boolean;
    }>;
    private checkRateLimit;
    private sendFcmMessage;
    private sanitize;
    private logToHistory;
}
