import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Device extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop({ required: true, enum: ['Smartphone', 'Smartwatch'] })
  type: string;

  @Prop()
  name: string;

  @Prop()
  os: string;

  @Prop()
  lastSync: Date;

  @Prop({ default: true })
  isConnected: boolean;

  @Prop({ type: Object })
  specs: Record<string, any>;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

