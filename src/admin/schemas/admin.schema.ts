import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    enum: ['super-admin', 'admin', 'moderator'],
    default: 'admin',
  })
  role: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop()
  avatarUrl?: string;

  @Prop()
  lastLogin: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

