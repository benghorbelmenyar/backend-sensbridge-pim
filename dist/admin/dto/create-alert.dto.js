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
exports.CreateAlertDto = exports.ALERT_PRIORITY_LABELS = exports.ALERT_PRIORITY = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
exports.ALERT_PRIORITY = ['P1', 'P2', 'P3'];
exports.ALERT_PRIORITY_LABELS = {
    P1: 'CRITIQUE',
    P2: 'IMPORTANT',
    P3: 'INFORMATIF',
};
class CreateAlertDto {
    userId;
    priority;
    message;
    soundType;
    metadata;
}
exports.CreateAlertDto = CreateAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID utilisateur concerné' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Priorité : P1=CRITIQUE (incendie, bébé intense), P2=IMPORTANT, P3=INFORMATIF',
        enum: exports.ALERT_PRIORITY,
    }),
    (0, class_validator_1.IsEnum)(exports.ALERT_PRIORITY),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message de l\'alerte' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type de son détecté (ex: baby_cry, fire_alarm, doorbell, phone, siren, horn, glass_break, knocking, alarm_clock)',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "soundType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAlertDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-alert.dto.js.map