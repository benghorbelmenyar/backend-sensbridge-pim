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
exports.PannsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const panns_service_1 = require("./panns.service");
let PannsController = class PannsController {
    pannsService;
    constructor(pannsService) {
        this.pannsService = pannsService;
    }
    async health() {
        const result = await this.pannsService.health();
        return {
            ok: result.ok,
            backend: this.pannsService['baseUrl'],
            details: result.raw,
        };
    }
    async predict(file) {
        return this.pannsService.predictFromFile(file);
    }
};
exports.PannsController = PannsController;
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check connectivity to PANNs backend' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PannsController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('predict'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Audio file to classify',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                device_id: {
                    type: 'string',
                },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Proxy file prediction to PANNs backend' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prediction result from PANNs backend' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PannsController.prototype, "predict", null);
exports.PannsController = PannsController = __decorate([
    (0, swagger_1.ApiTags)('panns'),
    (0, common_1.Controller)('panns'),
    __metadata("design:paramtypes", [panns_service_1.PannsService])
], PannsController);
//# sourceMappingURL=panns.controller.js.map