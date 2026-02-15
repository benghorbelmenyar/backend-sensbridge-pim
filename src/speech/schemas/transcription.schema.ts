import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranscriptionDocument = Transcription &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true, collection: 'transcriptions' })
export class Transcription {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: String, required: true })
  transcribedText: string;

  @Prop({ length: 10, default: 'auto' })
  language: string;

  @Prop({ length: 10, default: 'unknown' })
  detectedLanguage: string;

  @Prop({ type: Number, default: 0 })
  confidence: number;

  @Prop({ type: Number, default: 0 })
  audioDuration: number;

  @Prop({ type: Object, default: [] })
  segments: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;

  @Prop({ type: Number })
  processingTime: number;

  @Prop({ required: false })
  audioFileUrl?: string;
}

export const TranscriptionSchema = SchemaFactory.createForClass(Transcription);
