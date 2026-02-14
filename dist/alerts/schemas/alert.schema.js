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
exports.AlertSchema = exports.Alert = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Alert = class Alert extends mongoose_2.Document {
    userId;
    label;
    score;
    category;
    detectedAt;
    actionTaken;
};
exports.Alert = Alert;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Alert.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Alert.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Alert.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['informative', 'danger'] }),
    __metadata("design:type", String)
], Alert.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Alert.prototype, "detectedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        default: 'none',
        enum: ['acknowledge', 'ignore', 'emergency', 'safe', 'none'],
    }),
    __metadata("design:type", String)
], Alert.prototype, "actionTaken", void 0);
exports.Alert = Alert = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
    })
], Alert);
exports.AlertSchema = mongoose_1.SchemaFactory.createForClass(Alert);
exports.AlertSchema.index({ userId: 1, detectedAt: -1 });
exports.AlertSchema.index({ userId: 1, category: 1 });
//# sourceMappingURL=alert.schema.js.map