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
exports.SpeechService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transcription_schema_1 = require("./schemas/transcription.schema");
const whisper_client_service_1 = require("./whisper-client.service");
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIMETYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-m4a',
    'audio/m4a',
    'audio/mp4',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
];
let SpeechService = class SpeechService {
    transcriptionRepo;
    whisperClient;
    constructor(transcriptionRepo, whisperClient) {
        this.transcriptionRepo = transcriptionRepo;
        this.whisperClient = whisperClient;
    }
    async transcribeAudio(audioFile, userId, language = 'auto') {
        this.validateAudioFile(audioFile);
        const langParam = language === 'auto' ? undefined : language;
        const result = await this.whisperClient.transcribeAudio(audioFile.buffer, audioFile.originalname, langParam);
        const transcription = new this.transcriptionRepo({
            userId,
            transcribedText: result.text,
            language,
            detectedLanguage: result.language,
            confidence: 1,
            audioDuration: result.duration,
            segments: result.segments,
            processingTime: result.processing_time * 1000,
        });
        const saved = await transcription.save();
        return this.toResponseDto(saved);
    }
    async getTranscriptionHistory(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.transcriptionRepo
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.transcriptionRepo.countDocuments({ userId }).exec(),
        ]);
        return {
            items: items.map((t) => this.toResponseDto(t)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, userId) {
        const doc = await this.transcriptionRepo
            .findOne({ _id: id, userId })
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException('Transcription not found');
        }
        return doc;
    }
    validateAudioFile(file) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No audio file provided');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File too large. Maximum size: 25MB`);
        }
        const mimetype = file.mimetype?.toLowerCase();
        if (!mimetype || !ALLOWED_MIMETYPES.includes(mimetype)) {
            throw new common_1.BadRequestException('Invalid file format. Allowed: MP3, WAV, M4A, OGG, WEBM, FLAC');
        }
    }
    toResponseDto(doc) {
        const d = doc;
        const id = d._id?.toString?.() || d.id;
        return {
            id,
            text: d.transcribedText,
            detectedLanguage: d.detectedLanguage,
            confidence: d.confidence ?? 1,
            duration: d.audioDuration ?? 0,
            segments: (d.segments || []).map((s) => ({
                id: s.id,
                start: s.start,
                end: s.end,
                text: s.text,
            })),
            createdAt: d.createdAt,
        };
    }
};
exports.SpeechService = SpeechService;
exports.SpeechService = SpeechService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transcription_schema_1.Transcription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        whisper_client_service_1.WhisperClientService])
], SpeechService);
//# sourceMappingURL=speech.service.js.map