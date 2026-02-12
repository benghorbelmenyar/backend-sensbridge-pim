export declare const ALERT_PRIORITY: readonly ["P1", "P2", "P3"];
export declare const ALERT_PRIORITY_LABELS: Record<string, string>;
export declare class CreateAlertDto {
    userId: string;
    priority: string;
    message: string;
    soundType: string;
    metadata?: Record<string, any>;
}
