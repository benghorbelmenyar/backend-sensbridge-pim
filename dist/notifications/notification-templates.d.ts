export interface NotificationTemplate {
    title: string;
    body: string;
    data: Record<string, string>;
}
export declare const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate>;
export declare function applyTemplate(text: string, vars: Record<string, string>): string;
