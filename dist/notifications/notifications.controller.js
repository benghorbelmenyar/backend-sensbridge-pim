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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const register_token_dto_1 = require("./dtos/register-token.dto");
const send_notification_dto_1 = require("./dtos/send-notification.dto");
const authentication_guard_1 = require("../guards/authentication.guard");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async registerToken(dto, req) {
        return this.notificationsService.registerToken(req.userId, dto.token);
    }
    async sendTest(req) {
        return this.notificationsService.sendToUser(req.userId, 'test', 'SenseBridge Test', 'If you see this, Firebase notifications are working!', { type: 'test', action: 'none' });
    }
    async removeToken(req) {
        return this.notificationsService.removeToken(req.userId);
    }
    async getHistory(req, page, limit) {
        const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10) || 20));
        return this.notificationsService.getHistory(req.userId, pageNum, limitNum);
    }
    async markAsRead(id, req) {
        return this.notificationsService.markAsRead(req.userId, id);
    }
    async subscribeTopic(dto, req) {
        return this.notificationsService.subscribeToTopic(req.userId, dto.topic);
    }
    async unsubscribeTopic(dto, req) {
        return this.notificationsService.unsubscribeFromTopic(req.userId, dto.topic);
    }
    async setEnabled(body, req) {
        return this.notificationsService.setNotificationEnabled(req.userId, body.enabled ?? true);
    }
    async send(dto) {
        return this.notificationsService.sendToUser(dto.userId, dto.type, dto.title, dto.body, dto.data, dto.imageUrl);
    }
    async sendBatch(dto) {
        return this.notificationsService.sendBatch(dto.userIds, dto.type, dto.title, dto.body, dto.data, dto.imageUrl);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('register-token'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register or update FCM token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token registered' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_token_dto_1.RegisterTokenDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "registerToken", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send a test notification to the current user (for testing FCM)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notification sent or error details' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendTest", null);
__decorate([
    (0, common_1.Delete)('token'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remove FCM token (e.g. on logout)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token removed' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "removeToken", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated history' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('subscribe-topic'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe to a notification topic' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscribed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SubscribeTopicDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "subscribeTopic", null);
__decorate([
    (0, common_1.Post)('unsubscribe-topic'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unsubscribe from a topic' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SubscribeTopicDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "unsubscribeTopic", null);
__decorate([
    (0, common_1.Patch)('settings/enabled'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enable or disable FCM notifications' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.NotificationEnabledDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "setEnabled", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send notification to a user (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "send", null);
__decorate([
    (0, common_1.Post)('send-batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Send notification to multiple users (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendBatchNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendBatch", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map