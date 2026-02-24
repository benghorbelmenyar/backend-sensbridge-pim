import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserProfile extends Document {
  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: true,
    enum: [
      'Sourd', 'Malentendant', 'Aveugle', 'Malvoyant', 'Parent', 'Aidant', 'Mixte',
      'NORMAL_PERSON', 'DEAF_PERSON', 'ORGANIZATION', // alignés app mobile
    ],
  })
  profileType: string;

  @Prop({ type: [String], default: [] })
  disabilities: string[];

  @Prop()
  phoneNumber: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastConnection: Date;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

