import { Request } from 'express';
import { TranscribeAudioDto } from './dto/transcribe-audio.dto';
import { TranscriptionResponseDto } from './dto/transcription-response.dto';
import { SpeechService } from './speech.service';
import { WhisperClientService } from './whisper-client.service';
export declare class SpeechController {
    private readonly speechService;
    private readonly whisperClient;
    constructor(speechService: SpeechService, whisperClient: WhisperClientService);
    health(): Promise<{
        ok: boolean;
        service: string;
    }>;
    transcribeAudio(req: Request & {
        userId: string;
    }, audioFile: Express.Multer.File, dto: TranscribeAudioDto): Promise<TranscriptionResponseDto>;
    getHistory(req: Request & {
        userId: string;
    }, page?: number, limit?: number): Promise<{
        items: TranscriptionResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getTranscription(id: string, req: Request & {
        userId: string;
    }): Promise<TranscriptionResponseDto>;
}
