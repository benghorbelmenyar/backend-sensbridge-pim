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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PannsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
let PannsService = class PannsService {
    configService;
    baseUrl;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl =
            this.configService.get('panns.baseUrl') ||
                process.env.PANNS_API_URL ||
                'http://localhost:8002';
    }
    async health() {
        try {
            const res = await axios_1.default.get(`${this.baseUrl}/health`, { timeout: 5000 });
            return { ok: res.status === 200, raw: res.data };
        }
        catch (error) {
            return { ok: false, raw: error.message ?? String(error) };
        }
    }
    async predictFromFile(file, deviceId) {
        if (!file || !file.buffer) {
            throw new common_1.InternalServerErrorException('No file buffer provided to PANNs service');
        }
        const form = new form_data_1.default();
        form.append('file', file.buffer, {
            filename: file.originalname || 'audio.wav',
            contentType: file.mimetype || 'audio/wav',
        });
        if (deviceId) {
            form.append('device_id', deviceId);
        }
        try {
            const res = await axios_1.default.post(`${this.baseUrl}/v1/sound/predict`, form, {
                headers: form.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 60000,
            });
            return res.data;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Error calling PANNs backend: ${error.message ?? String(error)}`);
        }
    }
};
exports.PannsService = PannsService;
exports.PannsService = PannsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PannsService);
//# sourceMappingURL=panns.service.js.map