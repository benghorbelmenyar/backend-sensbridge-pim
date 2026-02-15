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
exports.TranscriptionResponseDto = exports.TranscriptionSegment = void 0;
const swagger_1 = require("@nestjs/swagger");
class TranscriptionSegment {
    id;
    start;
    end;
    text;
}
exports.TranscriptionSegment = TranscriptionSegment;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TranscriptionSegment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TranscriptionSegment.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TranscriptionSegment.prototype, "end", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TranscriptionSegment.prototype, "text", void 0);
class TranscriptionResponseDto {
    id;
    text;
    detectedLanguage;
    confidence;
    duration;
    segments;
    createdAt;
}
exports.TranscriptionResponseDto = TranscriptionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TranscriptionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TranscriptionResponseDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TranscriptionResponseDto.prototype, "detectedLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TranscriptionResponseDto.prototype, "confidence", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TranscriptionResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TranscriptionSegment] }),
    __metadata("design:type", Array)
], TranscriptionResponseDto.prototype, "segments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], TranscriptionResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=transcription-response.dto.js.map