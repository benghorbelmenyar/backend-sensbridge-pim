import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { BabyCryService, BabyCryAnalysisResult } from './baby-cry.service';

@ApiTags('Baby Cry — Détection pleurs bébé')
@Controller('baby-cry')
export class BabyCryController {
  constructor(private readonly babyCryService: BabyCryService) {}

  @Get('health')
  @ApiOperation({ summary: 'Santé du service et statut du modèle' })
  @ApiResponse({ status: 200, description: 'Service opérationnel' })
  getHealth() {
    return this.babyCryService.getHealth();
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const ok =
          file.mimetype === 'audio/wav' ||
          file.mimetype === 'audio/wave' ||
          file.originalname?.toLowerCase().endsWith('.wav');
        if (ok) cb(null, true);
        else cb(new BadRequestException('Fichier WAV uniquement'), false);
      },
    }),
  )
  @ApiOperation({ summary: 'Analyser un audio WAV (détection pleurs bébé)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: { type: 'string', format: 'binary', description: 'Fichier WAV' },
        userId: { type: 'string', description: 'ID utilisateur (optionnel)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Résultat de l’analyse' })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou manquant' })
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId?: string,
  ): Promise<BabyCryAnalysisResult> {
    if (!file) {
      throw new BadRequestException('Envoyez un fichier audio (champ "audio")');
    }
    return this.babyCryService.analyzeAudio(file, userId);
  }
}
