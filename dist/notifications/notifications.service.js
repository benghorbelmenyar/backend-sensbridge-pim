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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../auth/schemas/user.schema");
const notification_history_schema_1 = require("./schemas/notification-history.schema");
const firebase_config_1 = require("../config/firebase.config");
const notification_templates_1 = require("./notification-templates");
const MAX_BATCH_SIZE = 500;
const RATE_LIMIT_PER_USER_PER_HOUR = 100;
const NOTIFICATION_TTL_SECONDS = 24 * 60 * 60;
const logger = new common_1.Logger('NotificationsService');
let NotificationsService = class NotificationsService {
    userModel;
    notificationHistoryModel;
    constructor(userModel, notificationHistoryModel) {
        this.userModel = userModel;
        this.notificationHistoryModel = notificationHistoryModel;
    }
    async registerToken(userId, token) {
        if (!token || token.length < 10) {
            throw new common_1.BadRequestException('Invalid FCM token');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.notificationEnabled === false) {
            return { success: true };
        }
        await this.userModel.updateOne({ _id: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                fcmToken: token,
                fcmUpdatedAt: new Date(),
            },
        });
        logger.log(`FCM token registered for user ${userId}`);
        return { success: true };
    }
    async removeToken(userId) {
        await this.userModel.updateOne({ _id: new mongoose_2.Types.ObjectId(userId) }, { $unset: { fcmToken: 1 }, $set: { fcmUpdatedAt: new Date() } });
        logger.log(`FCM token removed for user ${userId}`);
        return { success: true };
    }
    async sendToUser(userId, type, title, body, data, imageUrl) {
        const user = await this.userModel.findById(userId).select('fcmToken notificationEnabled');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
        }
        else {
            await this.logToHistory(userId, type, title, body, data, undefined, result.error);
        }
        return result;
    }
    async sendBatch(userIds, type, title, body, data, imageUrl) {
        if (userIds.length > MAX_BATCH_SIZE) {
            throw new common_1.BadRequestException(`Max ${MAX_BATCH_SIZE} users per batch`);
        }
        const users = await this.userModel
            .find({ _id: { $in: userIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .select('_id fcmToken notificationEnabled');
        const tokenToUserId = new Map();
        const userMap = new Map();
        for (const u of users) {
            const uid = u._id.toString();
            userMap.set(uid, u);
            if (u.fcmToken && u.notificationEnabled !== false) {
                tokenToUserId.set(u.fcmToken, uid);
            }
        }
        const tokens = Array.from(tokenToUserId.keys());
        const payload = { title, body, data: data ?? {}, imageUrl };
        const results = [];
        for (const token of tokens) {
            results.push(await this.sendFcmMessage(token, payload));
        }
        let successCount = 0;
        const errors = [];
        results.forEach((r) => {
            if (r.messageId)
                successCount++;
            else if (r.error)
                errors.push(r.error);
        });
        const sentUserIds = new Set(tokenToUserId.values());
        await Promise.all(tokens.map((token, i) => {
            const uid = tokenToUserId.get(token);
            const res = results[i];
            return this.logToHistory(uid, type, title, body, data, res?.messageId, res?.error);
        }));
        await Promise.all(userIds
            .filter((uid) => !sentUserIds.has(uid))
            .map((uid) => this.logToHistory(uid, type, title, body, data, undefined, 'No token or disabled')));
        return { successCount, failureCount: results.length - successCount, errors };
    }
    async sendWithTemplate(userId, templateKey, variables) {
        const template = notification_templates_1.NOTIFICATION_TEMPLATES[templateKey];
        if (!template) {
            throw new common_1.BadRequestException(`Unknown template: ${templateKey}`);
        }
        const title = (0, notification_templates_1.applyTemplate)(template.title, variables);
        const body = (0, notification_templates_1.applyTemplate)(template.body, variables);
        const data = { ...template.data };
        return this.sendToUser(userId, data.type ?? templateKey, title, body, data);
    }
    async subscribeToTopic(userId, topic) {
        const user = await this.userModel.findById(userId).select('fcmToken');
        if (!user?.fcmToken) {
            throw new common_1.BadRequestException('No FCM token to subscribe');
        }
        try {
            if (!firebase_config_1.firebaseAdmin.apps.length) {
                throw new common_1.BadRequestException('FCM not configured');
            }
            await firebase_config_1.firebaseAdmin.messaging().subscribeToTopic([user.fcmToken], topic);
            return { success: true };
        }
        catch (error) {
            logger.error(`Subscribe to topic failed: ${error?.message}`);
            throw new common_1.BadRequestException(error?.message ?? 'Subscribe failed');
        }
    }
    async unsubscribeFromTopic(userId, topic) {
        const user = await this.userModel.findById(userId).select('fcmToken');
        if (!user?.fcmToken)
            return { success: true };
        try {
            if (!firebase_config_1.firebaseAdmin.apps.length)
                return { success: true };
            await firebase_config_1.firebaseAdmin.messaging().unsubscribeFromTopic([user.fcmToken], topic);
            return { success: true };
        }
        catch (error) {
            logger.error(`Unsubscribe from topic failed: ${error?.message}`);
            throw new common_1.BadRequestException(error?.message ?? 'Unsubscribe failed');
        }
    }
    async getHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.notificationHistoryModel
                .find({ userId: new mongoose_2.Types.ObjectId(userId) })
                .sort({ sentAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.notificationHistoryModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId) }),
        ]);
        return {
            items: items,
            total,
            page,
            limit,
        };
    }
    async markAsRead(userId, notificationId) {
        const result = await this.notificationHistoryModel.updateOne({
            _id: new mongoose_2.Types.ObjectId(notificationId),
            userId: new mongoose_2.Types.ObjectId(userId),
        }, { $set: { readAt: new Date() } });
        if (result.matchedCount === 0) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return { success: true };
    }
    async setNotificationEnabled(userId, enabled) {
        await this.userModel.updateOne({ _id: new mongoose_2.Types.ObjectId(userId) }, { $set: { notificationEnabled: enabled } });
        return { success: true };
    }
    async checkRateLimit(userId) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const count = await this.notificationHistoryModel.countDocuments({
            userId: new mongoose_2.Types.ObjectId(userId),
            sentAt: { $gte: oneHourAgo },
        });
        if (count >= RATE_LIMIT_PER_USER_PER_HOUR) {
            throw new common_1.BadRequestException('Notification rate limit exceeded');
        }
    }
    async sendFcmMessage(token, payload) {
        if (!firebase_config_1.firebaseAdmin.apps.length) {
            return { error: 'FCM not configured' };
        }
        const message = {
            token,
            notification: {
                title: this.sanitize(payload.title),
                body: this.sanitize(payload.body),
                ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
            },
            data: Object.fromEntries(Object.entries(payload.data).map(([k, v]) => [k, String(v)])),
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
            const messageId = await firebase_config_1.firebaseAdmin.messaging().send(message);
            return { messageId };
        }
        catch (error) {
            const msg = error?.message ?? 'Unknown FCM error';
            logger.warn(`FCM send failed: ${msg}`);
            return { error: msg };
        }
    }
    sanitize(text) {
        return text.slice(0, 500).replace(/[<>]/g, '');
    }
    async logToHistory(userId, type, title, body, data, fcmMessageId, error) {
        await this.notificationHistoryModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            type,
            title,
            body,
            data: data ?? {},
            fcmMessageId,
            sentAt: new Date(),
            error,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(notification_history_schema_1.NotificationHistory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map