import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EventLog extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  soundLabel: string;

  @Prop({ required: true })
  confidence: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);

