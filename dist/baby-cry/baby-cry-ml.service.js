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
const fs_1 = require("fs");
const os_1 = require("os");
const os_2 = require("os");
const child_process_1 = require("child_process");
const audio_preprocess_1 = require("./audio-preprocess");
const CRY_TYPES = ['hungry', 'pain', 'tired', 'discomfort', 'other'];
const ONNX_NAME = 'baby_cry_efficientnet_b0.onnx';
const ONNX_DATA_NAME = ONNX_NAME + '.data';
function getShortPath(longPath) {
    if ((0, os_2.platform)() !== 'win32')
        return longPath;
    try {
        const quoted = longPath.replace(/"/g, '""');
        const out = (0, child_process_1.execSync)(`cmd /c for %I in ("${quoted}") do @echo %~sI`, {
            encoding: 'utf8',
            windowsHide: true,
            shell: 'cmd.exe',
        });
        const short = out.trim();
        return short && short !== longPath ? short : longPath;
    }
    catch {
        return longPath;
    }
}
let BabyCryMlService = BabyCryMlService_1 = class BabyCryMlService {
    logger = new common_1.Logger(BabyCryMlService_1.name);
    session = null;
    modelLoaded = false;
    modelPath;
    modelDataPath;
    modelsDir;
    constructor() {
        const root = (0, path_1.join)(__dirname, '..', '..');
        this.modelsDir = (0, path_1.resolve)(root, 'models');
        this.modelPath = (0, path_1.resolve)(this.modelsDir, ONNX_NAME);
        this.modelDataPath = (0, path_1.resolve)(this.modelsDir, ONNX_DATA_NAME);
    }
    async loadModel() {
        if (this.modelLoaded)
            return true;
        if (!(0, fs_1.existsSync)(this.modelPath)) {
            this.logger.warn('Fichier modele absent: ' + this.modelPath);
            return false;
        }
        try {
            const ort = await import('onnxruntime-node');
            const hasExternalData = (0, fs_1.existsSync)(this.modelDataPath);
            if (hasExternalData) {
                const tempDir = (0, path_1.join)((0, os_1.tmpdir)(), `baby_cry_onnx_${Date.now()}`);
                (0, fs_1.mkdirSync)(tempDir, { recursive: true });
                (0, fs_1.copyFileSync)(this.modelPath, (0, path_1.join)(tempDir, ONNX_NAME));
                (0, fs_1.copyFileSync)(this.modelDataPath, (0, path_1.join)(tempDir, ONNX_DATA_NAME));
                const shortDir = getShortPath(tempDir);
                const pathToLoad = (0, path_1.join)(shortDir, ONNX_NAME);
                this.session = await ort.InferenceSession.create(pathToLoad, {
                    executionProviders: ['cpu'],
                });
                this.logger.log('Modèle Baby Cry ONNX chargé (.onnx + .data, chemin court)');
            }
            else {
                const modelBuffer = (0, fs_1.readFileSync)(this.modelPath);
                const modelBytes = new Uint8Array(modelBuffer.length);
                modelBytes.set(modelBuffer);
                this.session = await ort.InferenceSession.create(modelBytes, {
                    executionProviders: ['cpu'],
                });
                this.logger.log('Modèle Baby Cry ONNX chargé (buffer)');
            }
            this.modelLoaded = true;
            return true;
        }
        catch (e) {
            this.logger.warn('Modèle ONNX non chargé (fichier absent ou erreur). Utilisation du mode stub. ' +
                this.modelPath);
            this.logger.warn('Détail: ' + String(e));
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
            const read1 = (name) => {
                const out = results[name];
                const data = out?.data ?? out;
                const arr = data && typeof data.length === 'number' ? Array.from(data) : [];
                return Number(arr[0]) || 0;
            };
            const readLogits = (name) => {
                const out = results[name];
                const data = out?.data ?? out;
                if (!data || typeof data.length === 'undefined')
                    return [];
                return Array.from(data);
            };
            const detectionScore = read1('detection') || read1(this.session.outputNames?.[0] ?? '');
            const intensityNorm = read1('intensity') || read1(this.session.outputNames?.[1] ?? '');
            const typeLogits = readLogits('type_logits').length ? readLogits('type_logits') : readLogits(this.session.outputNames?.[2] ?? '');
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