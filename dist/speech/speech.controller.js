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
exports.SpeechController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const authentication_guard_1 = require("../guards/authentication.guard");
const transcribe_audio_dto_1 = require("./dto/transcribe-audio.dto");
const speech_service_1 = require("./speech.service");
const whisper_client_service_1 = require("./whisper-client.service");
let SpeechController = class SpeechController {
    speechService;
    whisperClient;
    constructor(speechService, whisperClient) {
        this.speechService = speechService;
        this.whisperClient = whisperClient;
    }
    async health() {
        const ok = await this.whisperClient.checkHealth();
        return { ok, service: 'whisper' };
    }
    async transcribeAudio(req, audioFile, dto) {
        return this.speechService.transcribeAudio(audioFile, req.userId, dto?.language || 'auto');
    }
    async getHistory(req, page = 1, limit = 10) {
        return this.speechService.getTranscriptionHistory(req.userId, Number(page) || 1, Number(limit) || 10);
    }
    async getTranscription(id, req) {
        const doc = await this.speechService.findOne(id, req.userId);
        return {
            id: doc._id.toString(),
            text: doc.transcribedText,
            detectedLanguage: doc.detectedLanguage,
            confidence: doc.confidence,
            duration: doc.audioDuration,
            segments: doc.segments,
            createdAt: doc.createdAt,
        };
    }
};
exports.SpeechController = SpeechController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Whisper service connectivity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Whisper service status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpeechController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('transcribe'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audioFile', {
        limits: { fileSize: 25 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Transcribe audio to text via Whisper service' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                audioFile: { type: 'string', format: 'binary' },
                language: { type: 'string', enum: ['fr', 'en', 'ar', 'auto'] },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transcription successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or format' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, transcribe_audio_dto_1.TranscribeAudioDto]),
    __metadata("design:returntype", Promise)
], SpeechController.prototype, "transcribeAudio", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get transcription history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'History retrieved' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], SpeechController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get transcription by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transcription found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transcription not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpeechController.prototype, "getTranscription", null);
exports.SpeechController = SpeechController = __decorate([
    (0, swagger_1.ApiTags)('Speech'),
    (0, common_1.Controller)('api/v1/speech'),
    __metadata("design:paramtypes", [speech_service_1.SpeechService,
        whisper_client_service_1.WhisperClientService])
], SpeechController);
//# sourceMappingURL=speech.controller.js.map