export declare class NotificationEnabledDto {
    enabled?: boolean;
}
export declare class SendNotificationDto {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export declare class SendBatchNotificationDto {
    userIds: string[];
    type: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export declare class SubscribeTopicDto {
    topic: string;
}
