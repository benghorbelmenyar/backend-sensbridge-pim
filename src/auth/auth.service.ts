// src/auth/auth.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import { RolesService } from 'src/roles/roles.service';
import { OAuth2Client } from 'google-auth-library';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import * as path from 'path';
import { OcrService } from 'src/services/ocr.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private rolesService: RolesService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  // ✅ NOUVEAU: Créer un admin statique (à appeler au démarrage ou via seed)
  async createAdminIfNotExists() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@sensbridge.com';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'Admin@1234';

    const adminExists = await this.UserModel.findOne({ email: adminEmail });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.UserModel.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        userType: 'ADMIN',
        isEmailVerified: true,
        authProvider: 'local',
      });
      console.log('✅ Admin créé avec succès:', adminEmail);
    } else {
      console.log('ℹ️  Admin existe déjà:', adminEmail);
    }
  }

  async signup(signupData: SignupDto) {
    const { email, password, name, phone, userType, language, carteHandicape } = signupData;

    console.log('═══════════════════════════════════════');
    console.log('🔵 SIGNUP - Données reçues:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('UserType:', userType);
    console.log('Language:', language);
    console.log('Carte Handicapé:', carteHandicape);
    console.log('═══════════════════════════════════════');

    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      userType: userType || 'USER',
      role: 'USER', // ✅ Toujours USER pour les inscriptions normales
      language: language || undefined,
      carteHandicape: carteHandicape || undefined,
    });

    console.log('✅ User créé avec succès:', user._id);

    const tokens = await this.generateUserTokens(user._id, user.role);
    return {
      ...tokens,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        language: user.language,
        carteHandicape: user.carteHandicape,
      },
    };
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const tokens = await this.generateUserTokens(user._id, user.role);
    return {
      ...tokens,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role, // ✅ Retourne le rôle (ADMIN ou USER)
        language: user.language,
        isAdmin: user.role === 'ADMIN', // ✅ Pratique pour le frontend
      },
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    console.log('═══════════════════════════════════════');
    console.log('🔵 FORGOT PASSWORD - Email:', email);

    const user = await this.UserModel.findOne({ email });

    if (user) {
      console.log('✅ Utilisateur trouvé:', user.name);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = nanoid(64);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
        otp,
      });

      console.log("📧 Envoi de l'email avec OTP:", otp);

      try {
        await this.mailService.sendPasswordResetEmail(email, otp);
        console.log('✅ Email envoyé avec succès');
      } catch (error) {
        console.error('❌ Erreur envoi email:', error);
      }
    } else {
      console.log('⚠️ Utilisateur non trouvé pour:', email);
    }

    console.log('═══════════════════════════════════════');

    return {
      success: true,
      message: 'If this user exists, they will receive an email',
    };
  }

  async verifyOtp(email: string, otp: string) {
    console.log('═══════════════════════════════════════');
    console.log('🔵 VERIFY OTP');
    console.log('Email:', email);
    console.log('OTP:', otp);

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      throw new UnauthorizedException('Invalid OTP');
    }

    const token = await this.ResetTokenModel.findOne({
      userId: user._id,
      otp,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      console.log('❌ OTP invalide ou expiré');
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    console.log('✅ OTP valide - Token:', token.token.substring(0, 10) + '...');
    console.log('═══════════════════════════════════════');

    return {
      success: true,
      resetToken: token.token,
      message: 'OTP verified successfully',
    };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    console.log('═══════════════════════════════════════');
    console.log('🔵 RESET PASSWORD');
    console.log('Reset token:', resetToken.substring(0, 10) + '...');

    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      console.log('❌ Token invalide ou expiré');
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log('✅ Mot de passe réinitialisé pour:', user.email);

    try {
      await this.mailService.sendPasswordResetConfirmation(user.email, user.name);
      console.log('✅ Email de confirmation envoyé');
    } catch (error) {
      console.error('⚠️ Erreur envoi email confirmation:', error);
    }

    console.log('═══════════════════════════════════════');

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }

    // ✅ Récupérer le user pour avoir son rôle
    const user = await this.UserModel.findById(token.userId);
    return this.generateUserTokens(token.userId, user?.role);
  }

  // ✅ MODIFIÉ: generateUserTokens inclut le rôle dans le JWT
  async generateUserTokens(userId, role?: string) {
    const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';

    const accessToken = this.jwtService.sign(
      {
        userId: userId.toString(),
        role: role || 'USER', // ✅ Le rôle est dans le token JWT
      },
      {
        secret,
        expiresIn: '10h',
      },
    );

    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      { upsert: true },
    );
  }

  async getUserPermissions(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    if (!user.roleId) {
      throw new BadRequestException('Utilisateur sans rôle assigné');
    }

    const role = await this.rolesService.getRoleById(user.roleId.toString());

    if (!role) {
      throw new BadRequestException('Rôle introuvable');
    }

    return role.permissions;
  }

  // ✅ NOUVEAU: Récupérer tous les utilisateurs (admin seulement)
  async getAllUsers() {
    const users = await this.UserModel.find({ role: { $ne: 'ADMIN' } })
      .select('-password')
      .sort({ createdAt: -1 });

    return {
      success: true,
      total: users.length,
      users,
    };
  }

  // ✅ NOUVEAU: Supprimer un utilisateur (admin seulement)
  async deleteUser(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException('Impossible de supprimer un admin');
    }

    await this.UserModel.findByIdAndDelete(userId);

    return {
      success: true,
      message: 'Utilisateur supprimé avec succès',
    };
  }

  async validateGoogleUser(profile: any) {
    console.log('✅ Validating Google user...');

    let user = await this.UserModel.findOne({
      email: profile.emails[0].value,
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        user.profilePicture = profile.photos?.[0]?.value;
        user.isEmailVerified = true;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      user = await this.UserModel.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        password: '',
        profilePicture: profile.photos?.[0]?.value,
        isEmailVerified: true,
        authProvider: 'google',
        role: 'USER',
      });
    }

    return user;
  }

  async googleTokenLogin(idToken: string) {
    try {
      console.log('🔵 Google Token Auth Request');
      console.log('Token reçu:', idToken?.substring(0, 20) + '...');

      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      console.log('✅ Token vérifié, payload:', payload);

      if (!payload) {
        throw new UnauthorizedException('Token Google invalide');
      }

      let user = await this.UserModel.findOne({ email: payload.email });

      if (user) {
        if (!user.googleId) {
          user.googleId = payload.sub;
          user.profilePicture = payload.picture;
          user.isEmailVerified = true;
          user.authProvider = 'google';
          await user.save();
        }
      } else {
        user = await this.UserModel.create({
          googleId: payload.sub,
          name: payload.name,
          email: payload.email,
          password: '',
          profilePicture: payload.picture,
          isEmailVerified: true,
          authProvider: 'google',
          role: 'USER',
        });
      }

      return this.generateTokensForUser(user);
    } catch (error) {
      console.error('❌ Error in Google Token Auth:', error);
      throw new UnauthorizedException('Token Google invalide');
    }
  }

  private async generateTokensForUser(user: User) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'USER', // ✅ Inclure le rôle
    };

    const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '1h',
    });

    const refreshTokenString = uuidv4();
    await this.storeRefreshToken(refreshTokenString, user._id.toString());

    return {
      success: true,
      message: 'Connexion Google réussie',
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        isAdmin: user.role === 'ADMIN',
      },
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    console.log('═══════════════════════════════════════');
    console.log('🔵 UPDATE PROFILE - userId:', userId);
    console.log('Données à mettre à jour:', updateData);

    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.UserModel.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    await user.save();

    console.log('✅ Profil mis à jour avec succès');
    console.log('═══════════════════════════════════════');

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        language: user.language,
        carteHandicape: user.carteHandicape,
        profilePicture: user.profilePicture,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.UserModel.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        language: user.language,
        carteHandicape: user.carteHandicape,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
        isAdmin: user.role === 'ADMIN',
      },
    };
  }

  async uploadAndVerifyHandicapCard(userId: string, imagePath: string) {
    console.log('═══════════════════════════════════════');
    console.log('🔵 UPLOAD & VERIFY HANDICAP CARD');
    console.log('👤 User ID:', userId);
    console.log('📸 Image:', imagePath);

    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const cardUrl = `/uploads/handicap-cards/${path.basename(imagePath)}`;
    user.carteHandicape = cardUrl;

    // ✅ Tenter l'OCR, mais sauvegarder la carte même si l'OCR échoue
    let analysisResult: { isValid: boolean; confidence: number; reason?: string; extractedData: any } | null = null;

    try {
      const ocrService = new OcrService(this.configService);
      analysisResult = await ocrService.analyzeHandicapCard(imagePath);
    } catch (ocrError: any) {
      console.error('⚠️ OCR échoué, la carte sera sauvegardée pour vérification manuelle:', ocrError.message);
    }

    if (analysisResult) {
      // OCR a fonctionné → sauvegarder le résultat
      user.handicapOcrResult = {
        isValid: analysisResult.isValid,
        confidence: analysisResult.confidence,
        reason: analysisResult.reason,
        extractedData: analysisResult.extractedData,
      };
      user.handicapData = {
        cardNumber: analysisResult.extractedData?.cardNumber,
        disabilityType: analysisResult.extractedData?.disabilityType,
        expiryDate: analysisResult.extractedData?.expiryDate,
      };

      if (!analysisResult.isValid) {
        user.handicapStatus = 'REJECTED';
        user.isHandicapVerified = false;
        user.handicapRejectReason = analysisResult.reason || 'Carte non reconnue par l\'OCR';
        console.log('❌ Carte invalide (rejet automatique):', analysisResult.reason);
      } else {
        user.handicapStatus = 'PENDING';
        user.isHandicapVerified = false;
        console.log('⏳ Carte valide OCR → en attente de vérification admin');
      }
    } else {
      // OCR a échoué → sauvegarder quand même comme PENDING pour vérification manuelle
      user.handicapStatus = 'PENDING';
      user.isHandicapVerified = false;
      user.handicapOcrResult = {
        isValid: false,
        confidence: 0,
        reason: 'Analyse OCR indisponible — vérification manuelle requise',
      };
      console.log('⏳ OCR indisponible → carte en attente de vérification manuelle');
    }

    await user.save();

    console.log('✅ Carte sauvegardée, statut:', user.handicapStatus);
    console.log('═══════════════════════════════════════');

    return {
      success: true,
      message: user.handicapStatus === 'REJECTED'
        ? `Carte rejetée: ${analysisResult?.reason}`
        : 'Carte reçue. En attente de vérification par l\'administrateur.',
      handicapStatus: user.handicapStatus,
      confidence: analysisResult?.confidence ?? 0,
      carteHandicape: cardUrl,
      extractedData: analysisResult?.extractedData ?? null,
    };
  }

  // ══════════════════════════════════════════
  //  ADMIN: Gestion cartes handicap
  // ══════════════════════════════════════════

  async getPendingHandicapCards() {
    const users = await this.UserModel.find({ handicapStatus: 'PENDING' })
      .select('-password')
      .sort({ createdAt: -1 });

    return {
      success: true,
      total: users.length,
      cards: users.map((u) => ({
        userId: u._id,
        name: u.name,
        email: u.email,
        userType: u.userType,
        carteHandicape: u.carteHandicape,
        handicapOcrResult: u.handicapOcrResult,
        handicapData: u.handicapData,
        createdAt: (u as any).createdAt,
      })),
    };
  }

  async approveHandicapCard(userId: string) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.handicapStatus !== 'PENDING') {
      throw new BadRequestException('Cette carte n\'est pas en attente de vérification');
    }

    user.isHandicapVerified = true;
    user.handicapStatus = 'APPROVED';
    user.handicapVerifiedAt = new Date();
    user.handicapReviewedAt = new Date();
    await user.save();

    console.log('✅ Carte handicap APPROUVÉE pour:', user.name, '(', user.email, ')');

    return {
      success: true,
      message: 'Carte d\'handicap approuvée avec succès',
      userId: user._id,
    };
  }

  async rejectHandicapCard(userId: string, reason?: string) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.handicapStatus !== 'PENDING') {
      throw new BadRequestException('Cette carte n\'est pas en attente de vérification');
    }

    user.isHandicapVerified = false;
    user.handicapStatus = 'REJECTED';
    user.handicapReviewedAt = new Date();
    user.handicapRejectReason = reason || 'Rejetée par l\'administrateur';
    await user.save();

    console.log('❌ Carte handicap REJETÉE pour:', user.name, '(', user.email, ') -', reason);

    return {
      success: true,
      message: 'Carte d\'handicap rejetée',
      userId: user._id,
    };
  }
}