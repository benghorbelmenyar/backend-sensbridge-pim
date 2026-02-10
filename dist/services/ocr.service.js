"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let OcrService = class OcrService {
    configService;
    genAI;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY est manquante dans .env');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async analyzeHandicapCard(imagePath) {
        try {
            console.log('═══════════════════════════════════════');
            console.log('🔍 ANALYSE OCR - Carte d\'Handicap (Gemini)');
            console.log('📸 Image:', imagePath);
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = this.getMimeType(imagePath);
            console.log('📦 Taille:', imageBuffer.length, 'bytes');
            console.log('🎨 Type:', mimeType);
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash'
            });
            const prompt = `Tu es un expert en analyse de documents officiels d'handicap du monde entier.

Analyse cette image et détermine si c'est une carte d'handicap OFFICIELLE ET VALIDE (de n'importe quel pays).

Critères de validation:
1. Document officiel d'un organisme gouvernemental ou autorité compétente
2. Mention claire d'handicap/disability/invalidité (dans n'importe quelle langue)
3. Présence d'éléments d'authentification (logo officiel, hologramme, numéro de carte, etc.)
4. Informations du titulaire (nom, photo si applicable)
5. Date d'expiration ou mention "permanente" si applicable
6. Type de handicap ou catégorie mentionnée

ACCEPTE les cartes de TOUS les pays (Tunisie, France, Belgique, Canada, etc.).
REFUSE uniquement si l'image n'est clairement PAS une carte d'handicap officielle.

Réponds UNIQUEMENT au format JSON suivant (sans texte avant ou après, sans balises markdown):
{
  "isValid": true/false,
  "confidence": 0-100,
  "extractedData": {
    "fullName": "nom complet extrait ou null",
    "cardNumber": "numéro de carte ou null",
    "expiryDate": "date d'expiration ou null",
    "disabilityType": "type de handicap ou null"
  },
  "reason": "explication courte de ta décision"
}`;
            const imageParts = [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
            ];
            let attempt = 0;
            const maxAttempts = 5;
            let lastError;
            while (attempt < maxAttempts) {
                try {
                    const result = await model.generateContent([prompt, ...imageParts]);
                    const response = await result.response;
                    const responseText = response.text();
                    console.log('✅ Réponse Gemini reçue');
                    console.log('📝 Texte brut:', responseText);
                    let cleanedText = responseText.trim();
                    cleanedText = cleanedText.replace(/```json\n?/g, '');
                    cleanedText = cleanedText.replace(/```\n?/g, '');
                    cleanedText = cleanedText.trim();
                    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) {
                        throw new Error('Format de réponse invalide');
                    }
                    const analysisResult = JSON.parse(jsonMatch[0]);
                    console.log('📊 Résultat analyse:');
                    console.log('   - Valide:', analysisResult.isValid);
                    console.log('   - Confiance:', analysisResult.confidence, '%');
                    console.log('   - Raison:', analysisResult.reason);
                    console.log('═══════════════════════════════════════');
                    return analysisResult;
                }
                catch (error) {
                    lastError = error;
                    const isRetryable = error.status === 429 ||
                        error.status === 503 ||
                        error.message?.includes('429') ||
                        error.message?.includes('503') ||
                        error.message?.includes('high demand') ||
                        error.message?.includes('Service Unavailable');
                    if (isRetryable) {
                        const waitTime = 2 ** attempt;
                        const errorType = error.status === 429
                            ? 'Limite de requêtes atteinte (429)'
                            : 'Service temporairement indisponible (503)';
                        console.warn(`⚠️ ${errorType}. Nouvelle tentative dans ${waitTime}s... (Tentative ${attempt + 1}/${maxAttempts})`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * waitTime));
                        attempt++;
                    }
                    else {
                        throw error;
                    }
                }
            }
            throw lastError;
        }
        catch (error) {
            console.error('❌ Erreur analyse OCR:', error);
            if (error.status === 503 || error.message?.includes('high demand') || error.message?.includes('Service Unavailable')) {
                throw new common_1.BadRequestException('Le service d\'analyse est temporairement surchargé. Veuillez réessayer dans quelques instants.');
            }
            if (error.status === 429 || error.message?.includes('429')) {
                throw new common_1.BadRequestException('Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.');
            }
            throw new common_1.BadRequestException('Erreur lors de l\'analyse de la carte. Veuillez réessayer.');
        }
    }
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.png':
                return 'image/png';
            case '.gif':
                return 'image/gif';
            case '.webp':
                return 'image/webp';
            default:
                return 'image/jpeg';
        }
    }
    verifyNameMatch(extractedName, userName) {
        if (!extractedName)
            return false;
        const cleanExtracted = extractedName.toLowerCase().trim();
        const cleanUser = userName.toLowerCase().trim();
        return (cleanExtracted.includes(cleanUser) ||
            cleanUser.includes(cleanExtracted));
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OcrService);
//# sourceMappingURL=ocr.service.js.map