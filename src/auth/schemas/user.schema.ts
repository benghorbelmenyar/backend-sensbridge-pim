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

  /** Statut d'approbation par l'admin (connexion app mobile) */
  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  approvalStatus?: 'pending' | 'approved' | 'rejected';

  @Prop()
  approvedAt?: Date;

  @Prop()
  approvedBy?: string;

  /** Raison du refus (si approvalStatus === 'rejected') */
  @Prop()
  rejectionReason?: string;

  /** Compte actif (admin peut bloquer/débloquer) — false = connexion refusée */
  @Prop({ default: true })
  isActive?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);