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
exports.TranscriptionSchema = exports.Transcription = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Transcription = class Transcription {
    userId;
    transcribedText;
    language;
    detectedLanguage;
    confidence;
    audioDuration;
    segments;
    processingTime;
    audioFileUrl;
};
exports.Transcription = Transcription;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transcription.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Transcription.prototype, "transcribedText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ length: 10, default: 'auto' }),
    __metadata("design:type", String)
], Transcription.prototype, "language", void 0);
__decorate([
    (0, mongoose_1.Prop)({ length: 10, default: 'unknown' }),
    __metadata("design:type", String)
], Transcription.prototype, "detectedLanguage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Transcription.prototype, "confidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Transcription.prototype, "audioDuration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: [] }),
    __metadata("design:type", Array)
], Transcription.prototype, "segments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Transcription.prototype, "processingTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Transcription.prototype, "audioFileUrl", void 0);
exports.Transcription = Transcription = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'transcriptions' })
], Transcription);
exports.TranscriptionSchema = mongoose_1.SchemaFactory.createForClass(Transcription);
//# sourceMappingURL=transcription.schema.js.map