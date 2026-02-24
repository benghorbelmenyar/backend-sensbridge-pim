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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WhisperClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhisperClientService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
let WhisperClientService = WhisperClientService_1 = class WhisperClientService {
    configService;
    logger = new common_1.Logger(WhisperClientService_1.name);
    whisperApiUrl;
    constructor(configService) {
        this.configService = configService;
        this.whisperApiUrl =
            this.configService.get('whisper.serviceUrl') ||
                this.configService.get('WHISPER_SERVICE_URL') ||
                'http://localhost:8000';
    }
    async transcribeAudio(audioBuffer, filename, language) {
        try {
            const formData = new form_data_1.default();
            formData.append('file', audioBuffer, {
                filename: filename || 'audio.mp3',
                contentType: this.getContentType(filename),
            });
            if (language && language !== 'auto') {
                formData.append('language', language);
            }
            const response = await axios_1.default.post(`${this.whisperApiUrl}/transcribe`, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 180000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });
            return response.data;
        }
        catch (error) {
            const message = error?.response?.data?.detail ||
                error?.message ||
                'Whisper service error';
            this.logger.error(`Transcription failed: ${message}`);
            throw new common_1.InternalServerErrorException(`Transcription failed: ${message}`);
        }
    }
    async checkHealth() {
        try {
            const response = await axios_1.default.get(`${this.whisperApiUrl}/`, {
                timeout: 5000,
            });
            return response.data?.status === 'healthy';
        }
        catch {
            return false;
        }
    }
    getContentType(filename) {
        const ext = filename?.split('.').pop()?.toLowerCase() || 'mp3';
        const mimeMap = {
            mp3: 'audio/mpeg',
            mpeg: 'audio/mpeg',
            wav: 'audio/wav',
            m4a: 'audio/x-m4a',
            ogg: 'audio/ogg',
            webm: 'audio/webm',
            flac: 'audio/flac',
        };
        return mimeMap[ext] || 'audio/mpeg';
    }
};
exports.WhisperClientService = WhisperClientService;
exports.WhisperClientService = WhisperClientService = WhisperClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhisperClientService);
//# sourceMappingURL=whisper-client.service.js.map