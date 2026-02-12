import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Alert extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['P1', 'P2', 'P3'] })
  priority: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  soundType: string;

  @Prop({ default: false })
  acknowledged: boolean;

  @Prop()
  acknowledgedAt: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);

