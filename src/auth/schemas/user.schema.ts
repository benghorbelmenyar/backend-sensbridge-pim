// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false }) // ← Optionnel
  phone?: string;

  @Prop({ required: false, default: 'USER' }) // ← Optionnel avec valeur par défaut
  userType?: string;

  @Prop({ required: false }) // ← Optionnel
  language?: string;

  @Prop({ required: false }) // ← Optionnel
  carteHandicape?: string;

  @Prop({ required: false })
  roleId?: string;
  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ enum: ['local', 'google'], default: 'local' })
  authProvider: string;

  @Prop()
  profilePicture?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);