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
exports.CreateAlertDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAlertDto {
    label;
    score;
    category;
    detectedAt;
    actionTaken;
}
exports.CreateAlertDto = CreateAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Detected sound label', example: 'Fire Alarm' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Confidence score (0-1)', example: 0.95 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateAlertDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alert category',
        enum: ['informative', 'danger'],
        example: 'danger',
    }),
    (0, class_validator_1.IsEnum)(['informative', 'danger']),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detection timestamp',
        example: '2024-01-01T12:00:00Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateAlertDto.prototype, "detectedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action taken by user',
        enum: ['acknowledge', 'ignore', 'emergency', 'safe', 'none'],
        default: 'none',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['acknowledge', 'ignore', 'emergency', 'safe', 'none']),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "actionTaken", void 0);
//# sourceMappingURL=create-alert.dto.js.map