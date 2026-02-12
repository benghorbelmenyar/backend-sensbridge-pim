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
exports.NotificationPreferencesSchema = exports.NotificationPreferences = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let NotificationPreferences = class NotificationPreferences extends mongoose_2.Document {
    userId;
    channels;
    nightMode;
    customVibrations;
    soundSettings;
};
exports.NotificationPreferences = NotificationPreferences;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationPreferences.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        enum: ['Visuel', 'Haptique', 'Audio'],
        default: ['Visuel'],
    }),
    __metadata("design:type", Array)
], NotificationPreferences.prototype, "channels", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationPreferences.prototype, "nightMode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], NotificationPreferences.prototype, "customVibrations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], NotificationPreferences.prototype, "soundSettings", void 0);
exports.NotificationPreferences = NotificationPreferences = __decorate([
    (0, mongoose_1.Schema)()
], NotificationPreferences);
exports.NotificationPreferencesSchema = mongoose_1.SchemaFactory.createForClass(NotificationPreferences);
//# sourceMappingURL=notification-preferences.schema.js.map