import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class EmergencyContact extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;
}

export const EmergencyContactSchema = SchemaFactory.createForClass(EmergencyContact);

EmergencyContactSchema.index({ userId: 1 });
