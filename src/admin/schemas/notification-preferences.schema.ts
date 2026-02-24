import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class NotificationPreferences extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [String],
    enum: ['Visuel', 'Haptique', 'Audio'],
    default: ['Visuel'],
  })
  channels: string[];

  @Prop({ default: false })
  nightMode: boolean;

  @Prop({ type: Object, default: {} })
  customVibrations: Record<string, any>;

  @Prop({ type: Object, default: {} })
  soundSettings: Record<string, any>;
}

export const NotificationPreferencesSchema =
  SchemaFactory.createForClass(NotificationPreferences);

