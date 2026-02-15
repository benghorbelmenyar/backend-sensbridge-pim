/**
 * Notification service: FCM send, token registration, history, rate limiting.
 */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { NotificationHistory } from './schemas/notification-history.schema';
import { firebaseAdmin } from '../config/firebase.config';
import { NOTIFICATION_TEMPLATES, applyTemplate } from './notification-templates';

const MAX_BATCH_SIZE = 500;
const RATE_LIMIT_PER_USER_PER_HOUR = 100;
const NOTIFICATION_TTL_SECONDS = 24 * 60 * 60;

const logger = new Logger('NotificationsService');

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(NotificationHistory.name)
    private notificationHistoryModel: Model<NotificationHistory>,
  ) {}

  async registerToken(userId: string, token: string): Promise<{ success: boolean }> {
    if (!token || token.length < 10) {
      throw new BadRequestException('Invalid FCM token');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.notificationEnabled === false) {
      return { success: true };
    }
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          fcmToken: token,
          fcmUpdatedAt: new Date(),
        },
      },
    );
    logger.log(`FCM token registered for user ${userId}`);
    return { success: true };
  }

  async removeToken(userId: string): Promise<{ success: boolean }> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $unset: { fcmToken: 1 }, $set: { fcmUpdatedAt: new Date() } },
    );
    logger.log(`FCM token removed for user ${userId}`);
    return { success: true };
  }

  async sendToUser(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    imageUrl?: string,
  ): Promise<{ messageId?: string; error?: string }> {
    const user = await this.userModel.findById(userId).select('fcmToken notificationEnabled');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.fcmToken) {
      logger.warn(`No FCM token for user ${userId}`);
      await this.logToHistory(userId, type, title, body, data, undefined, 'No FCM token');
      return { error: 'No FCM token' };
    }
    if (user.notificationEnabled === false) {
      return { error: 'Notifications disabled' };
    }
    await this.checkRateLimit(userId);
    const result = await this.sendFcmMessage(user.fcmToken, {
      title,
      body,
      data: data ?? {},
      imageUrl,
    });
    if (result.messageId) {
      await this.logToHistory(userId, type, title, body, data, result.messageId);
    } else {
      await this.logToHistory(userId, type, title, body, data, undefined, result.error);
    }
    return result;
  }

  async sendBatch(
    userIds: string[],
    type: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    imageUrl?: string,
  ): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
    if (userIds.length > MAX_BATCH_SIZE) {
      throw new BadRequestException(`Max ${MAX_BATCH_SIZE} users per batch`);
    }
    const users = await this.userModel
      .find({ _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } })
      .select('_id fcmToken notificationEnabled');
    const tokenToUserId = new Map<string, string>();
    const userMap = new Map<string, User>();
    for (const u of users) {
      const uid = u._id.toString();
      userMap.set(uid, u);
      if (u.fcmToken && u.notificationEnabled !== false) {
        tokenToUserId.set(u.fcmToken, uid);
      }
    }
    const tokens = Array.from(tokenToUserId.keys());
    const payload = { title, body, data: data ?? {}, imageUrl };
    const results: { messageId?: string; error?: string }[] = [];
    for (const token of tokens) {
      results.push(await this.sendFcmMessage(token, payload));
    }
    let successCount = 0;
    const errors: string[] = [];
    results.forEach((r) => {
      if (r.messageId) successCount++;
      else if (r.error) errors.push(r.error);
    });
    const sentUserIds = new Set(tokenToUserId.values());
    await Promise.all(
      tokens.map((token, i) => {
        const uid = tokenToUserId.get(token)!;
        const res = results[i];
        return this.logToHistory(
          uid,
          type,
          title,
          body,
          data,
          res?.messageId,
          res?.error,
        );
      }),
    );
    await Promise.all(
      userIds
        .filter((uid) => !sentUserIds.has(uid))
        .map((uid) =>
          this.logToHistory(uid, type, title, body, data, undefined, 'No token or disabled'),
        ),
    );
    return { successCount, failureCount: results.length - successCount, errors };
  }

  async sendWithTemplate(
    userId: string,
    templateKey: string,
    variables: Record<string, string>,
  ): Promise<{ messageId?: string; error?: string }> {
    const template = NOTIFICATION_TEMPLATES[templateKey];
    if (!template) {
      throw new BadRequestException(`Unknown template: ${templateKey}`);
    }
    const title = applyTemplate(template.title, variables);
    const body = applyTemplate(template.body, variables);
    const data = { ...template.data };
    return this.sendToUser(userId, data.type ?? templateKey, title, body, data);
  }

  async subscribeToTopic(userId: string, topic: string): Promise<{ success: boolean }> {
    const user = await this.userModel.findById(userId).select('fcmToken');
    if (!user?.fcmToken) {
      throw new BadRequestException('No FCM token to subscribe');
    }
    try {
      if (!firebaseAdmin.apps.length) {
        throw new BadRequestException('FCM not configured');
      }
      await firebaseAdmin.messaging().subscribeToTopic([user.fcmToken], topic);
      return { success: true };
    } catch (error: any) {
      logger.error(`Subscribe to topic failed: ${error?.message}`);
      throw new BadRequestException(error?.message ?? 'Subscribe failed');
    }
  }

  async unsubscribeFromTopic(userId: string, topic: string): Promise<{ success: boolean }> {
    const user = await this.userModel.findById(userId).select('fcmToken');
    if (!user?.fcmToken) return { success: true };
    try {
      if (!firebaseAdmin.apps.length) return { success: true };
      await firebaseAdmin.messaging().unsubscribeFromTopic([user.fcmToken], topic);
      return { success: true };
    } catch (error: any) {
      logger.error(`Unsubscribe from topic failed: ${error?.message}`);
      throw new BadRequestException(error?.message ?? 'Unsubscribe failed');
    }
  }

  async getHistory(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    items: NotificationHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.notificationHistoryModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.notificationHistoryModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);
    return {
      items: items as NotificationHistory[],
      total,
      page,
      limit,
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<{ success: boolean }> {
    const result = await this.notificationHistoryModel.updateOne(
      {
        _id: new Types.ObjectId(notificationId),
        userId: new Types.ObjectId(userId),
      },
      { $set: { readAt: new Date() } },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { success: true };
  }

  async setNotificationEnabled(userId: string, enabled: boolean): Promise<{ success: boolean }> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { notificationEnabled: enabled } },
    );
    return { success: true };
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.notificationHistoryModel.countDocuments({
      userId: new Types.ObjectId(userId),
      sentAt: { $gte: oneHourAgo },
    });
    if (count >= RATE_LIMIT_PER_USER_PER_HOUR) {
      throw new BadRequestException('Notification rate limit exceeded');
    }
  }

  private async sendFcmMessage(
    token: string,
    payload: {
      title: string;
      body: string;
      data: Record<string, string>;
      imageUrl?: string;
    },
  ): Promise<{ messageId?: string; error?: string }> {
    if (!firebaseAdmin.apps.length) {
      return { error: 'FCM not configured' };
    }
    const message: import('firebase-admin').messaging.Message = {
      token,
      notification: {
        title: this.sanitize(payload.title),
        body: this.sanitize(payload.body),
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: Object.fromEntries(
        Object.entries(payload.data).map(([k, v]) => [k, String(v)]),
      ),
      android: {
        priority: 'high',
        ttl: NOTIFICATION_TTL_SECONDS * 1000,
      },
      apns: {
        payload: { aps: { 'content-available': 1 } },
        fcmOptions: {},
      },
    };
    try {
      const messageId = await firebaseAdmin.messaging().send(message);
      return { messageId };
    } catch (error: any) {
      const msg = error?.message ?? 'Unknown FCM error';
      logger.warn(`FCM send failed: ${msg}`);
      return { error: msg };
    }
  }

  private sanitize(text: string): string {
    return text.slice(0, 500).replace(/[<>]/g, '');
  }

  private async logToHistory(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    fcmMessageId?: string,
    error?: string,
  ): Promise<void> {
    await this.notificationHistoryModel.create({
      userId: new Types.ObjectId(userId),
      type,
      title,
      body,
      data: data ?? {},
      fcmMessageId,
      sentAt: new Date(),
      error,
    });
  }
}
