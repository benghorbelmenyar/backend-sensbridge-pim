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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHistorySchema = exports.NotificationHistory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let NotificationHistory = class NotificationHistory extends mongoose_2.Document {
    userId;
    type;
    title;
    body;
    data;
    fcmMessageId;
    sentAt;
    deliveredAt;
    readAt;
    clickedAt;
    error;
};
exports.NotificationHistory = NotificationHistory;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], NotificationHistory.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationHistory.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationHistory.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationHistory.prototype, "body", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], NotificationHistory.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationHistory.prototype, "fcmMessageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], NotificationHistory.prototype, "sentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], NotificationHistory.prototype, "deliveredAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], NotificationHistory.prototype, "readAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], NotificationHistory.prototype, "clickedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationHistory.prototype, "error", void 0);
exports.NotificationHistory = NotificationHistory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'notification_history' })
], NotificationHistory);
exports.NotificationHistorySchema = mongoose_1.SchemaFactory.createForClass(NotificationHistory);
exports.NotificationHistorySchema.index({ userId: 1, sentAt: -1 });
exports.NotificationHistorySchema.index({ type: 1 });
//# sourceMappingURL=notification-history.schema.js.map