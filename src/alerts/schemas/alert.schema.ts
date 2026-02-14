import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Alert extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true, enum: ['informative', 'danger'] })
  category: string;

  @Prop({ required: true, default: Date.now })
  detectedAt: Date;

  @Prop({
    required: true,
    default: 'none',
    enum: ['acknowledge', 'ignore', 'emergency', 'safe', 'none'],
  })
  actionTaken: string;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);

// Create indexes for better query performance
AlertSchema.index({ userId: 1, detectedAt: -1 });
AlertSchema.index({ userId: 1, category: 1 });
