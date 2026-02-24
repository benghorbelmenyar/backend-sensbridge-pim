import { Model } from 'mongoose';
import { TranscriptionResponseDto } from './dto/transcription-response.dto';
import { TranscriptionDocument } from './schemas/transcription.schema';
import { WhisperClientService } from './whisper-client.service';
export declare class SpeechService {
    private transcriptionRepo;
    private whisperClient;
    constructor(transcriptionRepo: Model<TranscriptionDocument>, whisperClient: WhisperClientService);
    transcribeAudio(audioFile: Express.Multer.File, userId: string, language?: string): Promise<TranscriptionResponseDto>;
    getTranscriptionHistory(userId: string, page?: number, limit?: number): Promise<{
        items: TranscriptionResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, userId: string): Promise<TranscriptionDocument>;
    private validateAudioFile;
    private toResponseDto;
}
