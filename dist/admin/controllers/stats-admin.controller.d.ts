import { StatsAdminService } from '../services/stats-admin.service';
export declare class StatsAdminController {
    private readonly statsService;
    constructor(statsService: StatsAdminService);
    getDashboard(): Promise<{
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
    getAlertsTimeline(days?: number): Promise<any[]>;
    getAlertsTimelineByType(days?: number): Promise<any[]>;
}
