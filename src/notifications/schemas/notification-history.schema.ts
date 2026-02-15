import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'notification_history' })
export class NotificationHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object, default: {} })
  data?: Record<string, string>;

  @Prop()
  fcmMessageId?: string;

  @Prop({ default: () => new Date() })
  sentAt: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  readAt?: Date;

  @Prop()
  clickedAt?: Date;

  @Prop()
  error?: string;
}

export const NotificationHistorySchema =
  SchemaFactory.createForClass(NotificationHistory);

NotificationHistorySchema.index({ userId: 1, sentAt: -1 });
NotificationHistorySchema.index({ type: 1 });
