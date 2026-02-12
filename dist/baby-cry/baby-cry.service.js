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
exports.BabyCryService = void 0;
const common_1 = require("@nestjs/common");
const baby_cry_ml_service_1 = require("./baby-cry-ml.service");
function guessTypeFromFilename(filename) {
    if (!filename || typeof filename !== 'string')
        return undefined;
    const lower = filename.toLowerCase();
    if (lower.includes('-hu') || lower.endsWith('-hu.wav'))
        return 'hungry';
    if (lower.includes('-bu') || lower.endsWith('-bu.wav'))
        return 'discomfort';
    if (lower.includes('-bp') || lower.endsWith('-bp.wav'))
        return 'pain';
    if (lower.includes('-ti') || lower.endsWith('-ti.wav'))
        return 'tired';
    if (lower.includes('-dc') || lower.endsWith('-dc.wav'))
        return 'discomfort';
    return undefined;
}
let BabyCryService = class BabyCryService {
    mlService;
    constructor(mlService) {
        this.mlService = mlService;
    }
    async onModuleInit() {
        await this.mlService.loadModel();
    }
    getHealth() {
        return {
            status: 'ok',
            modelLoaded: this.mlService.isLoaded(),
        };
    }
    async analyzeAudio(file, _userId) {
        if (!file) {
            return {
                isCry: false,
                confidence: 0,
                modelLoaded: this.mlService.isLoaded(),
                message: 'Aucun fichier audio fourni',
            };
        }
        const buffer = file.buffer ?? (typeof file.buffer !== 'undefined' ? file.buffer : null);
        if (buffer && this.mlService.isLoaded()) {
            const result = await this.mlService.analyze(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
            if (result) {
                return {
                    isCry: result.isCry,
                    confidence: result.confidence,
                    type: result.type,
                    typeConfidence: result.typeConfidence,
                    intensity: result.intensity,
                    modelLoaded: true,
                };
            }
        }
        const size = file.size ?? (buffer?.length ?? 0);
        const isCry = size > 10000;
        const originalName = file.originalname ?? file.name ?? '';
        const stubType = isCry ? (guessTypeFromFilename(originalName) ?? 'other') : undefined;
        const stubTypeConfidence = stubType && stubType !== 'other' ? 0.6 : 0;
        return {
            isCry,
            confidence: isCry ? 0.92 : 0.15,
            type: stubType,
            typeConfidence: stubTypeConfidence,
            intensity: isCry ? 6.5 : 0,
            modelLoaded: this.mlService.isLoaded(),
            message: this.mlService.isLoaded()
                ? undefined
                : 'Résultat simulé (modèle non chargé). Type déduit du nom du fichier (Donate-a-Cry: -hu, -bu, -bp, -ti). Placer baby_cry_efficientnet_b0.onnx dans backend/models/ pour la vraie classification.',
        };
    }
};
exports.BabyCryService = BabyCryService;
exports.BabyCryService = BabyCryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [baby_cry_ml_service_1.BabyCryMlService])
], BabyCryService);
//# sourceMappingURL=baby-cry.service.js.map