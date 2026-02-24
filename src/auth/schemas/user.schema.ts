import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRole = 'USER' | 'ORGANIZATION' | 'DEAF_PERSON' | 'NORMAL_PERSON' | 'ADMIN';

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

  // ✅ NOUVEAU: Champ role pour distinguer ADMIN / USER
  @Prop({
    type: String,
    enum: ['USER', 'ORGANIZATION', 'DEAF_PERSON', 'NORMAL_PERSON', 'ADMIN'],
    default: 'USER'
  })
  role?: UserRole;

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

  // ✅ Champs vérification handicap
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

  // ✅ Workflow approbation carte handicap par admin
  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  handicapStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Prop({ type: Object })
  handicapOcrResult?: {
    isValid: boolean;
    confidence: number;
    reason?: string;
    extractedData?: {
      fullName?: string;
      cardNumber?: string;
      expiryDate?: string;
      disabilityType?: string;
    };
  };

  @Prop()
  handicapReviewedAt?: Date;

  @Prop()
  handicapRejectReason?: string;
  /** FCM token for push notifications (backend-driven) */
  @Prop()
  fcmToken?: string;

  @Prop()
  fcmUpdatedAt?: Date;

  @Prop({ default: true })
  notificationEnabled?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
