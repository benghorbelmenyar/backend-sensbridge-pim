import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TranscriptionResponseDto,
  TranscriptionSegment,
} from './dto/transcription-response.dto';
import {
  Transcription,
  TranscriptionDocument,
} from './schemas/transcription.schema';
import { WhisperClientService } from './whisper-client.service';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_MIMETYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-m4a',
  'audio/m4a',
  'audio/mp4',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
];

@Injectable()
export class SpeechService {
  constructor(
    @InjectModel(Transcription.name)
    private transcriptionRepo: Model<TranscriptionDocument>,
    private whisperClient: WhisperClientService,
  ) {}

  async transcribeAudio(
    audioFile: Express.Multer.File,
    userId: string,
    language: string = 'auto',
  ): Promise<TranscriptionResponseDto> {
    this.validateAudioFile(audioFile);

    const langParam = language === 'auto' ? undefined : language;
    const result = await this.whisperClient.transcribeAudio(
      audioFile.buffer,
      audioFile.originalname,
      langParam,
    );

    const transcription = new this.transcriptionRepo({
      userId,
      transcribedText: result.text,
      language,
      detectedLanguage: result.language,
      confidence: 1,
      audioDuration: result.duration,
      segments: result.segments,
      processingTime: result.processing_time * 1000,
    });

    const saved = await transcription.save();

    return this.toResponseDto(saved);
  }

  async getTranscriptionHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.transcriptionRepo
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.transcriptionRepo.countDocuments({ userId }).exec(),
    ]);

    return {
      items: items.map((t) =>
        this.toResponseDto(t as unknown as TranscriptionDocument),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<TranscriptionDocument> {
    const doc = await this.transcriptionRepo
      .findOne({ _id: id, userId })
      .exec();

    if (!doc) {
      throw new NotFoundException('Transcription not found');
    }

    return doc;
  }

  private validateAudioFile(file: Express.Multer.File): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('No audio file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Maximum size: 25MB`);
    }

    const mimetype = file.mimetype?.toLowerCase();
    if (!mimetype || !ALLOWED_MIMETYPES.includes(mimetype)) {
      throw new BadRequestException(
        'Invalid file format. Allowed: MP3, WAV, M4A, OGG, WEBM, FLAC',
      );
    }
  }

  private toResponseDto(
    doc: TranscriptionDocument | Record<string, unknown>,
  ): TranscriptionResponseDto {
    const d = doc as any;
    const id = d._id?.toString?.() || d.id;
    return {
      id,
      text: d.transcribedText,
      detectedLanguage: d.detectedLanguage,
      confidence: d.confidence ?? 1,
      duration: d.audioDuration ?? 0,
      segments: (d.segments || []).map((s: any) => ({
        id: s.id,
        start: s.start,
        end: s.end,
        text: s.text,
      })) as TranscriptionSegment[],
      createdAt: d.createdAt,
    };
  }
}
