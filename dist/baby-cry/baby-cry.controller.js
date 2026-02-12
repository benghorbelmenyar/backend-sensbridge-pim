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
exports.BabyCryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const baby_cry_service_1 = require("./baby-cry.service");
let BabyCryController = class BabyCryController {
    babyCryService;
    constructor(babyCryService) {
        this.babyCryService = babyCryService;
    }
    getHealth() {
        return this.babyCryService.getHealth();
    }
    async analyze(file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('Envoyez un fichier audio (champ "audio")');
        }
        return this.babyCryService.analyzeAudio(file, userId);
    }
};
exports.BabyCryController = BabyCryController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Santé du service et statut du modèle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service opérationnel' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BabyCryController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const ok = file.mimetype === 'audio/wav' ||
                file.mimetype === 'audio/wave' ||
                file.originalname?.toLowerCase().endsWith('.wav');
            if (ok)
                cb(null, true);
            else
                cb(new common_1.BadRequestException('Fichier WAV uniquement'), false);
        },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Analyser un audio WAV (détection pleurs bébé)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                audio: { type: 'string', format: 'binary', description: 'Fichier WAV' },
                userId: { type: 'string', description: 'ID utilisateur (optionnel)' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Résultat de l’analyse' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Fichier invalide ou manquant' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BabyCryController.prototype, "analyze", null);
exports.BabyCryController = BabyCryController = __decorate([
    (0, swagger_1.ApiTags)('Baby Cry — Détection pleurs bébé'),
    (0, common_1.Controller)('baby-cry'),
    __metadata("design:paramtypes", [baby_cry_service_1.BabyCryService])
], BabyCryController);
//# sourceMappingURL=baby-cry.controller.js.map