"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StatsAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsAdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_profile_schema_1 = require("../schemas/user-profile.schema");
const alert_schema_1 = require("../schemas/alert.schema");
const device_schema_1 = require("../schemas/device.schema");
const event_log_schema_1 = require("../schemas/event-log.schema");
const defaultUsers = { total: 0, activeToday: 0, byProfile: [] };
const defaultAlerts = { totalToday: 0, criticalUnresolved: 0, byPriority: [] };
const defaultDevices = { total: 0, connected: 0, disconnected: 0, byType: [] };
const defaultEvents = { total: 0, totalToday: 0, topSounds: [] };
let StatsAdminService = StatsAdminService_1 = class StatsAdminService {
    userModel;
    alertModel;
    deviceModel;
    eventModel;
    logger = new common_1.Logger(StatsAdminService_1.name);
    constructor(userModel, alertModel, deviceModel, eventModel) {
        this.userModel = userModel;
        this.alertModel = alertModel;
        this.deviceModel = deviceModel;
        this.eventModel = eventModel;
    }
    async getDashboardStats() {
        const [users, alerts, devices, events] = await Promise.all([
            this.getUserStats().catch((err) => {
                this.logger.warn('getUserStats failed', err?.message);
                return defaultUsers;
            }),
            this.getAlertStats().catch((err) => {
                this.logger.warn('getAlertStats failed', err?.message);
                return defaultAlerts;
            }),
            this.getDeviceStats().catch((err) => {
                this.logger.warn('getDeviceStats failed', err?.message);
                return defaultDevices;
            }),
            this.getEventStats().catch((err) => {
                this.logger.warn('getEventStats failed', err?.message);
                return defaultEvents;
            }),
        ]);
        return {
            users,
            alerts,
            devices,
            events,
        };
    }
    async getUserStats() {
        const total = await this.userModel.countDocuments();
        const activeToday = await this.userModel.countDocuments({
            lastConnection: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });
        const byProfile = await this.userModel.aggregate([
            { $group: { _id: '$profileType', count: { $sum: 1 } } },
        ]);
        return { total, activeToday, byProfile };
    }
    async getAlertStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalToday = await this.alertModel.countDocuments({
            createdAt: { $gte: today },
        });
        const criticalUnresolved = await this.alertModel.countDocuments({
            priority: 'P1',
            acknowledged: false,
        });
        const byPriority = await this.alertModel.aggregate([
            { $match: { createdAt: { $gte: today } } },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);
        return { totalToday, criticalUnresolved, byPriority };
    }
    async getDeviceStats() {
        const total = await this.deviceModel.countDocuments();
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const connected = await this.deviceModel.countDocuments({
            $or: [
                { isConnected: true },
                { lastSync: { $gte: fiveMinutesAgo } },
            ],
        });
        const byType = await this.deviceModel.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
        ]);
        return { total, connected, disconnected: Math.max(0, total - connected), byType };
    }
    async getEventStats() {
        const total = await this.eventModel.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalToday = await this.eventModel.countDocuments({
            createdAt: { $gte: today },
        });
        const topSounds = await this.eventModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            },
            {
                $group: {
                    _id: '$soundLabel',
                    count: { $sum: 1 },
                    avgConfidence: { $avg: '$confidence' },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        return { total, totalToday, topSounds };
    }
    async getAlertsTimeline(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const timeline = await this.alertModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                        },
                        priority: '$priority',
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.date': 1 } },
        ]);
        return timeline;
    }
    async getAlertsTimelineByType(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const timeline = await this.alertModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                        },
                        soundType: '$soundType',
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.date': 1 } },
        ]);
        return timeline;
    }
};
exports.StatsAdminService = StatsAdminService;
exports.StatsAdminService = StatsAdminService = StatsAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_profile_schema_1.UserProfile.name)),
    __param(1, (0, mongoose_1.InjectModel)(alert_schema_1.Alert.name)),
    __param(2, (0, mongoose_1.InjectModel)(device_schema_1.Device.name)),
    __param(3, (0, mongoose_1.InjectModel)(event_log_schema_1.EventLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], StatsAdminService);
//# sourceMappingURL=stats-admin.service.js.map