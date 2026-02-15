export declare class TranscriptionSegment {
    id: number;
    start: number;
    end: number;
    text: string;
}
export declare class TranscriptionResponseDto {
    id: string;
    text: string;
    detectedLanguage: string;
    confidence: number;
    duration: number;
    segments: TranscriptionSegment[];
    createdAt: Date;
}
