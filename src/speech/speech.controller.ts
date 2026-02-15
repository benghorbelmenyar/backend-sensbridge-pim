import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { TranscribeAudioDto } from './dto/transcribe-audio.dto';
import {
  TranscriptionResponseDto,
  TranscriptionSegment,
} from './dto/transcription-response.dto';
import { SpeechService } from './speech.service';
import { WhisperClientService } from './whisper-client.service';

@ApiTags('Speech')
@Controller('api/v1/speech')
export class SpeechController {
  constructor(
    private readonly speechService: SpeechService,
    private readonly whisperClient: WhisperClientService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Check Whisper service connectivity' })
  @ApiResponse({ status: 200, description: 'Whisper service status' })
  async health(): Promise<{ ok: boolean; service: string }> {
    const ok = await this.whisperClient.checkHealth();
    return { ok, service: 'whisper' };
  }

  @Post('transcribe')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('audioFile', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Transcribe audio to text via Whisper service' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audioFile: { type: 'string', format: 'binary' },
        language: { type: 'string', enum: ['fr', 'en', 'ar', 'auto'] },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Transcription successful' })
  @ApiResponse({ status: 400, description: 'Invalid file or format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async transcribeAudio(
    @Req() req: Request & { userId: string },
    @UploadedFile() audioFile: Express.Multer.File,
    @Body() dto: TranscribeAudioDto,
  ): Promise<TranscriptionResponseDto> {
    return this.speechService.transcribeAudio(
      audioFile,
      req.userId,
      dto?.language || 'auto',
    );
  }

  @Get('history')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transcription history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'History retrieved' })
  async getHistory(
    @Req() req: Request & { userId: string },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.speechService.getTranscriptionHistory(
      req.userId,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Get(':id')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transcription by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Transcription found' })
  @ApiResponse({ status: 404, description: 'Transcription not found' })
  async getTranscription(
    @Param('id') id: string,
    @Req() req: Request & { userId: string },
  ): Promise<TranscriptionResponseDto> {
    const doc = await this.speechService.findOne(id, req.userId);
    return {
      id: doc._id.toString(),
      text: doc.transcribedText,
      detectedLanguage: doc.detectedLanguage,
      confidence: doc.confidence,
      duration: doc.audioDuration,
      segments: doc.segments as TranscriptionSegment[],
      createdAt: doc.createdAt,
    };
  }
}
