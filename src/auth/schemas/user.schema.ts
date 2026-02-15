// src/auth/schemas/user.schema.ts - AJOUTER CES CHAMPS À VOTRE SCHÉMA

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone?: string;

  @Prop()
  userType?: string;

  @Prop()
  language?: string;

  @Prop()
  carteHandicape?: string;

  @Prop()
  profilePicture?: string;

  @Prop()
  googleId?: string;

  @Prop({ default: 'local' })
  authProvider?: string;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop()
  roleId?: string;

  // ✅ NOUVEAUX CHAMPS POUR LA VÉRIFICATION HANDICAP
  @Prop({ default: false })
  isHandicapVerified?: boolean;

  @Prop()
  handicapVerifiedAt?: Date;

  @Prop({ type: Object })
  handicapData?: {
    cardNumber?: string;
    disabilityType?: string;
    expiryDate?: string;
  };

  /** FCM token for push notifications (backend-driven) */
  @Prop()
  fcmToken?: string;

  @Prop()
  fcmUpdatedAt?: Date;

  @Prop({ default: true })
  notificationEnabled?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);