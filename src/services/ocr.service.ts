// src/services/ocr.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

interface OcrAnalysisResult {
  isValid: boolean;
  confidence: number;
  extractedData: {
    fullName?: string;
    cardNumber?: string;
    expiryDate?: string;
    disabilityType?: string;
  };
  reason?: string;
}

@Injectable()
export class OcrService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY est manquante dans .env');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analyser une carte d'handicap avec Gemini Vision
   */
  async analyzeHandicapCard(imagePath: string): Promise<OcrAnalysisResult> {
    try {
      console.log('═══════════════════════════════════════');
      console.log('🔍 ANALYSE OCR - Carte d\'Handicap (Gemini)');
      console.log('📸 Image:', imagePath);

      // ✅ Lire l'image et la convertir en base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      console.log('📦 Taille:', imageBuffer.length, 'bytes');
      console.log('🎨 Type:', mimeType);

      // ✅ Utiliser Gemini 2.5 Flash (stable et performant)
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

      // ✅ Retry logic for 429 (rate limit) and 503 (service unavailable)
      let attempt = 0;
      const maxAttempts = 5; // Augmenté pour gérer les erreurs 503
      let lastError;

      while (attempt < maxAttempts) {
        try {
          const result = await model.generateContent([prompt, ...imageParts]);
          const response = await result.response;
          const responseText = response.text();

          console.log('✅ Réponse Gemini reçue');
          console.log('📝 Texte brut:', responseText);

          // ✅ Extraire le JSON de la réponse
          let cleanedText = responseText.trim();

          // Enlever les balises markdown si présentes
          cleanedText = cleanedText.replace(/```json\n?/g, '');
          cleanedText = cleanedText.replace(/```\n?/g, '');
          cleanedText = cleanedText.trim();

          // Extraire le JSON
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('Format de réponse invalide');
          }

          const analysisResult: OcrAnalysisResult = JSON.parse(jsonMatch[0]);

          console.log('📊 Résultat analyse:');
          console.log('   - Valide:', analysisResult.isValid);
          console.log('   - Confiance:', analysisResult.confidence, '%');
          console.log('   - Raison:', analysisResult.reason);
          console.log('═══════════════════════════════════════');

          return analysisResult;

        } catch (error: any) {
          lastError = error;
          
          // Vérifier si l'erreur est réessayable (429 ou 503)
          const isRetryable = 
            error.status === 429 || 
            error.status === 503 || 
            error.message?.includes('429') || 
            error.message?.includes('503') ||
            error.message?.includes('high demand') ||
            error.message?.includes('Service Unavailable');

          if (isRetryable) {
            const waitTime = 2 ** attempt; // Backoff exponentiel: 1s, 2s, 4s, 8s, 16s
            const errorType = error.status === 429 
              ? 'Limite de requêtes atteinte (429)' 
              : 'Service temporairement indisponible (503)';
            
            console.warn(`⚠️ ${errorType}. Nouvelle tentative dans ${waitTime}s... (Tentative ${attempt + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * waitTime));
            attempt++;
          } else {
            // Erreur non réessayable, on la relance immédiatement
            throw error;
          }
        }
      }

      // Si on arrive ici, toutes les tentatives ont échoué
      throw lastError;

    } catch (error: any) {
      console.error('❌ Erreur analyse OCR:', error);
      
      // Messages d'erreur plus spécifiques pour l'utilisateur
      if (error.status === 503 || error.message?.includes('high demand') || error.message?.includes('Service Unavailable')) {
        throw new BadRequestException(
          'Le service d\'analyse est temporairement surchargé. Veuillez réessayer dans quelques instants.'
        );
      }
      
      if (error.status === 429 || error.message?.includes('429')) {
        throw new BadRequestException(
          'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.'
        );
      }
      
      throw new BadRequestException(
        'Erreur lors de l\'analyse de la carte. Veuillez réessayer.'
      );
    }
  }

  /**
   * Déterminer le type MIME de l'image
   */
  private getMimeType(filePath: string): string {
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

  /**
   * Vérifier si le nom extrait correspond au nom de l'utilisateur
   */
  verifyNameMatch(extractedName: string | undefined, userName: string): boolean {
    if (!extractedName) return false;

    const cleanExtracted = extractedName.toLowerCase().trim();
    const cleanUser = userName.toLowerCase().trim();

    // ✅ Vérification simple: contient le nom ou vice versa
    return (
      cleanExtracted.includes(cleanUser) ||
      cleanUser.includes(cleanExtracted)
    );
  }
}