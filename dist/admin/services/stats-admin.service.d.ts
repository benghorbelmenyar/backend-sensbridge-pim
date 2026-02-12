import { Model } from 'mongoose';
import { UserProfile } from '../schemas/user-profile.schema';
import { Alert } from '../schemas/alert.schema';
import { Device } from '../schemas/device.schema';
import { EventLog } from '../schemas/event-log.schema';
export declare class StatsAdminService {
    private readonly userModel;
    private readonly alertModel;
    private readonly deviceModel;
    private readonly eventModel;
    private readonly logger;
    constructor(userModel: Model<UserProfile>, alertModel: Model<Alert>, deviceModel: Model<Device>, eventModel: Model<EventLog>);
    getDashboardStats(): Promise<{
        users: {
            total: number;
            activeToday: number;
            byProfile: never[];
        } | {
            total: number;
            activeToday: number;
            byProfile: any[];
        };
        alerts: {
            totalToday: number;
            criticalUnresolved: number;
            byPriority: never[];
        } | {
            totalToday: number;
            criticalUnresolved: number;
            byPriority: any[];
        };
        devices: {
            total: number;
            connected: number;
            disconnected: number;
            byType: never[];
        } | {
            total: number;
            connected: number;
            disconnected: number;
            byType: any[];
        };
        events: {
            total: number;
            totalToday: number;
            topSounds: never[];
        } | {
            total: number;
            totalToday: number;
            topSounds: any[];
        };
    }>;
    private getUserStats;
    private getAlertStats;
    private getDeviceStats;
    private getEventStats;
    getAlertsTimeline(days?: number): Promise<any[]>;
    getAlertsTimelineByType(days?: number): Promise<any[]>;
}
