import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

export interface WhisperTranscription {
  success: boolean;
  text: string;
  language: string;
  duration: number;
  segments: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  processing_time: number;
  model: string;
}

@Injectable()
export class WhisperClientService {
  private readonly logger = new Logger(WhisperClientService.name);
  private readonly whisperApiUrl: string;

  constructor(private configService: ConfigService) {
    this.whisperApiUrl =
      this.configService.get<string>('whisper.serviceUrl') ||
      this.configService.get<string>('WHISPER_SERVICE_URL') ||
      'http://localhost:8000';
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    filename: string,
    language?: string,
  ): Promise<WhisperTranscription> {
    try {
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: filename || 'audio.mp3',
        contentType: this.getContentType(filename),
      });
      if (language && language !== 'auto') {
        formData.append('language', language);
      }

      const response = await axios.post<WhisperTranscription>(
        `${this.whisperApiUrl}/transcribe`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 180000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );

      return response.data;
    } catch (error) {
      const message =
        (error as any)?.response?.data?.detail ||
        (error as Error)?.message ||
        'Whisper service error';
      this.logger.error(`Transcription failed: ${message}`);
      throw new InternalServerErrorException(
        `Transcription failed: ${message}`,
      );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.whisperApiUrl}/`, {
        timeout: 5000,
      });
      return response.data?.status === 'healthy';
    } catch {
      return false;
    }
  }

  private getContentType(filename: string): string {
    const ext = filename?.split('.').pop()?.toLowerCase() || 'mp3';
    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      mpeg: 'audio/mpeg',
      wav: 'audio/wav',
      m4a: 'audio/x-m4a',
      ogg: 'audio/ogg',
      webm: 'audio/webm',
      flac: 'audio/flac',
    };
    return mimeMap[ext] || 'audio/mpeg';
  }
}
