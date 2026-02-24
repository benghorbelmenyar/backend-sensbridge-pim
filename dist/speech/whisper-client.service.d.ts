import { ConfigService } from '@nestjs/config';
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
export declare class WhisperClientService {
    private configService;
    private readonly logger;
    private readonly whisperApiUrl;
    constructor(configService: ConfigService);
    transcribeAudio(audioBuffer: Buffer, filename: string, language?: string): Promise<WhisperTranscription>;
    checkHealth(): Promise<boolean>;
    private getContentType;
}
