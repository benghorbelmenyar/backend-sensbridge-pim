import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile } from '../schemas/user-profile.schema';
import { Alert } from '../schemas/alert.schema';
import { Device } from '../schemas/device.schema';
import { EventLog } from '../schemas/event-log.schema';

const defaultUsers = { total: 0, activeToday: 0, byProfile: [] };
const defaultAlerts = { totalToday: 0, criticalUnresolved: 0, byPriority: [] };
const defaultDevices = { total: 0, connected: 0, disconnected: 0, byType: [] };
const defaultEvents = { total: 0, totalToday: 0, topSounds: [] };

@Injectable()
export class StatsAdminService {
  private readonly logger = new Logger(StatsAdminService.name);

  constructor(
    @InjectModel(UserProfile.name)
    private readonly userModel: Model<UserProfile>,
    @InjectModel(Alert.name)
    private readonly alertModel: Model<Alert>,
    @InjectModel(Device.name)
    private readonly deviceModel: Model<Device>,
    @InjectModel(EventLog.name)
    private readonly eventModel: Model<EventLog>,
  ) {}

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

  private async getUserStats() {
    const total = await this.userModel.countDocuments();
    const activeToday = await this.userModel.countDocuments({
      lastConnection: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const byProfile = await this.userModel.aggregate([
      { $group: { _id: '$profileType', count: { $sum: 1 } } },
    ]);

    return { total, activeToday, byProfile };
  }

  private async getAlertStats() {
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

  private async getDeviceStats() {
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

  private async getEventStats() {
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

  async getAlertsTimeline(days: number = 7) {
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

  /** Timeline alertes groupée par type de son (Pleurs, Sirènes, Verre cassé, etc.) pour graphique Alerts Overview */
  async getAlertsTimelineByType(days: number = 7) {
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
}

