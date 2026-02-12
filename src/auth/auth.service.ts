// src/auth/auth.service.ts
import {
  BadRequestException,
  ForbiddenException,
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
import { Device } from '../admin/schemas/device.schema';
import { RegisterDeviceDto } from './dtos/register-device.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    @InjectModel(Device.name) private deviceModel: Model<Device>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private rolesService: RolesService,
  ) {
    // ✅ Initialiser googleClient dans le constructeur
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
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
      language: language || undefined,
      carteHandicape: carteHandicape || undefined,
      approvalStatus: 'pending',
    });

    console.log('✅ User créé avec succès (en attente d\'approbation):', user._id);

    return {
      success: true,
      requiresApproval: true,
      message: 'Votre inscription a été enregistrée. Un administrateur doit valider votre compte avant que vous puissiez vous connecter.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        language: user.language,
        approvalStatus: 'pending',
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

    const status = user.approvalStatus ?? 'approved';
    if (status === 'pending') {
      throw new ForbiddenException(
        "Votre compte est en attente de validation par l'administrateur. Vous serez notifié dès qu'il aura été validé.",
      );
    }
    if (status === 'rejected') {
      const msg =
        (user as any).rejectionReason ||
        "Votre compte a été refusé par l'administrateur. Contactez le support pour plus d'informations.";
      throw new ForbiddenException({ message: msg, rejectionReason: (user as any).rejectionReason });
    }
    if ((user as any).isActive === false) {
      throw new ForbiddenException(
        "Votre compte a été désactivé par l'administrateur. Contactez le support.",
      );
    }

    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        language: user.language,
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

      console.log('📧 Envoi de l\'email avec OTP:', otp);
      
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
      message: 'OTP verified successfully'
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
      message: 'Password reset successfully' 
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
    return this.generateUserTokens(token.userId);
  }

  async generateUserTokens(userId) {
    const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
    
    const accessToken = this.jwtService.sign(
      { userId: userId.toString() },
      { 
        secret,
        expiresIn: '10h' 
      }
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

  // ✅ MÉTHODE Google : Valider l'utilisateur Google (pour Strategy)
  async validateGoogleUser(profile: any) {
    console.log('✅ Validating Google user...');

    // ✅ CORRECTION: UserModel au lieu de userModel
    let user = await this.UserModel.findOne({ 
      email: profile.emails[0].value 
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
        approvalStatus: 'pending',
      });
    }

    return user;
  }

  // ✅ MÉTHODE Google : Authentification via Token (pour mobile)
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
        const status = user.approvalStatus ?? 'approved';
        if (status === 'pending') {
          throw new ForbiddenException(
            "Votre compte est en attente de validation par l'administrateur.",
          );
        }
        if (status === 'rejected') {
          const msg =
            (user as any).rejectionReason ||
            "Votre compte a été refusé par l'administrateur.";
          throw new ForbiddenException({ message: msg, rejectionReason: (user as any).rejectionReason });
        }
        if ((user as any).isActive === false) {
          throw new ForbiddenException(
            "Votre compte a été désactivé par l'administrateur. Contactez le support.",
          );
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
          approvalStatus: 'pending',
        });
        throw new ForbiddenException(
          "Votre inscription a été enregistrée. Un administrateur doit valider votre compte avant connexion.",
        );
      }

      return this.generateTokensForUser(user);
    } catch (error) {
      console.error('❌ Error in Google Token Auth:', error);
      throw new UnauthorizedException('Token Google invalide');
    }
  }

  // ✅ MÉTHODE : Générer les tokens pour un utilisateur
  // ✅ CORRECTION: Changer UserDocument en User
  private async generateTokensForUser(user: User) {
    const payload = { 
      userId: user._id.toString(),
      email: user.email,
    };

    const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-secret';

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

  // ✅ Vérifier si l'email est déjà utilisé par un autre utilisateur
  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await this.UserModel.findOne({ 
      email: updateData.email,
      _id: { $ne: userId } // Exclure l'utilisateur actuel
    });
    
    if (emailExists) {
      throw new BadRequestException('Email already in use');
    }
  }

  // ✅ Mettre à jour uniquement les champs fournis
  Object.keys(updateData).forEach(key => {
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
      language: user.language,
      carteHandicape: user.carteHandicape,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
    },
  };
}
// src/auth/auth.service.ts - AJOUTER CES MÉTHODES À LA FIN DE VOTRE CLASSE

  /**
   * ✅ UPLOAD ET ANALYSE DE LA CARTE D'HANDICAP
   */
  async uploadAndVerifyHandicapCard(
    userId: string,
    imagePath: string,
  ) {
    console.log('═══════════════════════════════════════');
    console.log('🔵 UPLOAD & VERIFY HANDICAP CARD');
    console.log('👤 User ID:', userId);
    console.log('📸 Image:', imagePath);

    // 1️⃣ Récupérer l'utilisateur
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // 2️⃣ Analyser la carte avec OCR (injecter OcrService dans le constructor)
    const ocrService = new OcrService(this.configService);
    const analysisResult = await ocrService.analyzeHandicapCard(imagePath);

    // 3️⃣ Vérifier si la carte est valide
    if (!analysisResult.isValid) {
      console.log('❌ Carte invalide:', analysisResult.reason);
      throw new BadRequestException(
        `Carte d'handicap invalide: ${analysisResult.reason}`
      );
    }

    // 4️⃣ Vérifier si le nom correspond (optionnel mais recommandé)
    if (analysisResult.extractedData.fullName) {
      const nameMatch = ocrService.verifyNameMatch(
        analysisResult.extractedData.fullName,
        user.name,
      );

      if (!nameMatch) {
        console.log('⚠️ Le nom sur la carte ne correspond pas au profil');
        console.log('   Carte:', analysisResult.extractedData.fullName);
        console.log('   Profil:', user.name);
        
        // Vous pouvez soit rejeter, soit juste avertir
        // throw new BadRequestException('Le nom sur la carte ne correspond pas à votre profil');
      }
    }

    // 5️⃣ Sauvegarder l'URL de la carte et marquer comme vérifié
    const cardUrl = `/uploads/handicap-cards/${path.basename(imagePath)}`;
    
    user.carteHandicape = cardUrl;
    user.isHandicapVerified = true; // ✅ Nouveau champ à ajouter au schema
    user.handicapVerifiedAt = new Date();
    user.handicapData = {
      cardNumber: analysisResult.extractedData.cardNumber,
      disabilityType: analysisResult.extractedData.disabilityType,
      expiryDate: analysisResult.extractedData.expiryDate,
    };

    await user.save();

    console.log('✅ Carte d\'handicap vérifiée et sauvegardée');
    console.log('═══════════════════════════════════════');

    return {
      success: true,
      message: 'Carte d\'handicap vérifiée avec succès',
      isVerified: true,
      confidence: analysisResult.confidence,
      carteHandicape: cardUrl,
      extractedData: analysisResult.extractedData,
    };
  }

  /** Liste des utilisateurs (app mobile) en attente d'approbation */
  async getPendingUsers() {
    const users = await this.UserModel.find({ approvalStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    return { data: users };
  }

  /** Accepter un utilisateur (connexion app autorisée) — envoie un email d'acceptation à l'utilisateur */
  async approveUser(userId: string, adminId?: string) {
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy: adminId,
      },
      { new: true },
    )
      .select('email name')
      .lean();
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    const email = (user as any).email;
    const name = (user as any).name;
    try {
      await this.mailService.sendApprovalAcceptanceEmail(email, name);
    } catch (err) {
      console.error('Envoi email acceptation échoué (compte tout de même accepté):', err);
    }
    return {
      message: 'Utilisateur accepté',
      user: { id: (user as any)._id, email, approvalStatus: 'approved' },
    };
  }

  /** Refuser un utilisateur (connexion app bloquée), optionnellement avec une raison */
  async rejectUser(userId: string, adminId?: string, reason?: string) {
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        approvalStatus: 'rejected',
        approvedAt: new Date(),
        approvedBy: adminId,
        ...(reason != null && reason.trim() !== '' && { rejectionReason: reason.trim() }),
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return {
      message: 'Utilisateur refusé',
      user: { id: user._id, email: user.email, approvalStatus: user.approvalStatus, rejectionReason: (user as any).rejectionReason },
    };
  }

  /** Nombre d'utilisateurs en attente (pour badge admin) */
  async getPendingCount(): Promise<number> {
    return this.UserModel.countDocuments({ approvalStatus: 'pending' });
  }

  /** Stats inscrits app par userType (NORMAL_PERSON, DEAF_PERSON, ORGANIZATION). USER = Normal Person. */
  async getAppUsersStatsByType() {
    try {
      const byUserType = await this.UserModel.aggregate([
        {
          $group: {
            _id: {
              $cond: [
                { $in: ['$userType', ['USER', 'NORMAL_PERSON', null, '']] },
                'NORMAL_PERSON',
                { $ifNull: ['$userType', 'NON_RENSEIGNÉ'] },
              ],
            },
            count: { $sum: 1 },
          },
        },
      ]);
      const total = await this.UserModel.countDocuments();
      const byUserTypeMap: Record<string, number> = {};
      byUserType.forEach((row: any) => {
        const key = row._id != null ? String(row._id) : 'NON_RENSEIGNÉ';
        byUserTypeMap[key] = row.count ?? 0;
      });
      return { total, byUserType: byUserTypeMap };
    } catch (err) {
      console.error('getAppUsersStatsByType error:', err);
      return { total: 0, byUserType: {} };
    }
  }

  /** Liste paginée de tous les utilisateurs app mobile (pour admin : blocage/déblocage) */
  async getAppUsers(params: { skip?: number; limit?: number; search?: string }) {
    const { skip = 0, limit = 20, search } = params;
    const filter: any = {};
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const total = await this.UserModel.countDocuments(filter);
    const users = await this.UserModel.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return {
      data: users,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Bloquer un utilisateur (isActive = false) */
  async blockUser(userId: string) {
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true },
    );
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { message: 'Utilisateur bloqué', user: { id: user._id, email: user.email, isActive: (user as any).isActive } };
  }

  /** Débloquer un utilisateur (isActive = true) */
  async unblockUser(userId: string) {
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true },
    );
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { message: 'Utilisateur débloqué', user: { id: user._id, email: user.email, isActive: (user as any).isActive } };
  }

  /** Détail d'un utilisateur app (même base que signup/login) */
  async getOneAppUser(userId: string) {
    const user = await this.UserModel.findById(userId).select('-password').lean();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  /** Mise à jour par l'admin (nom, email, téléphone, etc.) */
  async updateAppUser(userId: string, dto: UpdateProfileDto) {
    const update: any = {};
    if (dto.name != null) update.name = dto.name;
    if (dto.email != null) update.email = dto.email;
    if (dto.phone != null) update.phone = dto.phone;
    if (dto.userType != null) update.userType = dto.userType;
    if (dto.language != null) update.language = dto.language;
    if (dto.carteHandicape != null) update.carteHandicape = dto.carteHandicape;
    if (dto.profilePicture != null) update.profilePicture = dto.profilePicture;
    const user = await this.UserModel.findByIdAndUpdate(userId, update, { new: true })
      .select('-password')
      .lean();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  /** Suppression d'un utilisateur app (même base) */
  async deleteAppUser(userId: string) {
    const user = await this.UserModel.findByIdAndDelete(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { message: 'Utilisateur supprimé avec succès' };
  }

  /** Enregistrer ou mettre à jour le device de l'utilisateur connecté (appelé par l'app au login) */
  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const now = new Date();
    const device = await this.deviceModel.findOneAndUpdate(
      { deviceId: dto.deviceId },
      {
        deviceId: dto.deviceId,
        userId,
        type: dto.type,
        ...(dto.name != null && { name: dto.name }),
        ...(dto.os != null && { os: dto.os }),
        lastSync: now,
        isConnected: true,
      },
      { new: true, upsert: true },
    );
    return { device: device.toObject(), message: 'Device enregistré' };
  }
}