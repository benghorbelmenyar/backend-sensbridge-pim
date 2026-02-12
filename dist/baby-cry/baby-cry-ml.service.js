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
var BabyCryMlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabyCryMlService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const audio_preprocess_1 = require("./audio-preprocess");
const CRY_TYPES = ['hungry', 'pain', 'tired', 'discomfort', 'other'];
let BabyCryMlService = BabyCryMlService_1 = class BabyCryMlService {
    logger = new common_1.Logger(BabyCryMlService_1.name);
    session = null;
    modelLoaded = false;
    modelPath;
    constructor() {
        const root = (0, path_1.join)(__dirname, '..', '..');
        this.modelPath = (0, path_1.join)(root, 'models', 'baby_cry_efficientnet_b0.onnx');
    }
    async loadModel() {
        if (this.modelLoaded)
            return true;
        try {
            const ort = await import('onnxruntime-node');
            this.session = await ort.InferenceSession.create(this.modelPath, {
                executionProviders: ['cpu'],
            });
            this.modelLoaded = true;
            this.logger.log('Modèle Baby Cry ONNX chargé: ' + this.modelPath);
            return true;
        }
        catch (e) {
            this.logger.warn('Modèle ONNX non chargé (fichier absent ou erreur). Utilisation du mode stub. ' +
                this.modelPath);
            return false;
        }
    }
    isLoaded() {
        return this.modelLoaded;
    }
    async analyze(buffer) {
        if (!this.modelLoaded)
            return null;
        try {
            const mel = await (0, audio_preprocess_1.wavToLogMelSpectrogram)(buffer);
            const [n, c, h, w] = (0, audio_preprocess_1.getMelSpectrogramShape)();
            const tensor = new Float32Array(n * c * h * w);
            tensor.set(mel);
            const feeds = {};
            const inputName = this.session.inputNames?.[0] ?? 'input';
            feeds[inputName] = new (await import('onnxruntime-node')).Tensor('float32', tensor, [n, c, h, w]);
            const results = await this.session.run(feeds);
            const outputNames = this.session.outputNames ?? Object.keys(results);
            const detectionScore = results[outputNames[0]]?.data?.[0] ?? results[outputNames[0]]?.[0] ?? 0;
            const intensityNorm = results[outputNames[1]]?.data?.[0] ?? results[outputNames[1]]?.[0] ?? 0;
            const typeLogits = results[outputNames[2]]?.data ?? results[outputNames[2]] ?? [];
            const isCry = detectionScore >= 0.5;
            const intensity = isCry ? Math.min(10, Math.max(0, intensityNorm * 10)) : 0;
            const softmax = (x) => {
                const exp = x.map((v) => Math.exp(v - Math.max(...x)));
                const sum = exp.reduce((a, b) => a + b, 0);
                return exp.map((e) => e / sum);
            };
            const probs = Array.isArray(typeLogits)
                ? softmax(Array.from(typeLogits))
                : [];
            const typeIdx = probs.length > 0
                ? probs.indexOf(Math.max(...probs))
                : 0;
            const type = CRY_TYPES[typeIdx] ?? 'other';
            const typeConfidence = probs[typeIdx] ?? 0;
            return {
                isCry,
                confidence: detectionScore,
                type,
                typeConfidence,
                intensity,
            };
        }
        catch (e) {
            this.logger.error('Erreur inférence Baby Cry', e);
            return null;
        }
    }
};
exports.BabyCryMlService = BabyCryMlService;
exports.BabyCryMlService = BabyCryMlService = BabyCryMlService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BabyCryMlService);
//# sourceMappingURL=baby-cry-ml.service.js.map