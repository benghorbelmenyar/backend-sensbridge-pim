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

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client; // ✅ Déclarer googleClient

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
    });

    console.log('✅ User créé avec succès:', user._id);

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
      // ✅ CORRECTION: UserModel au lieu de userModel
      user = await this.UserModel.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        password: '', // ✅ Mot de passe vide pour Google Auth
        profilePicture: profile.photos?.[0]?.value,
        isEmailVerified: true,
        authProvider: 'google',
      });
    }

    return user;
  }

  // ✅ MÉTHODE Google : Authentification via Token (pour mobile)
  async googleTokenLogin(idToken: string) {
    try {
      console.log('🔵 Google Token Auth Request');
      console.log('Token reçu:', idToken?.substring(0, 20) + '...');

      // ✅ googleClient est maintenant défini
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      console.log('✅ Token vérifié, payload:', payload);

      if (!payload) {
        throw new UnauthorizedException('Token Google invalide');
      }

      // ✅ CORRECTION: UserModel au lieu de userModel
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
        // ✅ CORRECTION: UserModel au lieu de userModel
        user = await this.UserModel.create({
          googleId: payload.sub,
          name: payload.name,
          email: payload.email,
          password: '', // ✅ Mot de passe vide pour Google Auth
          profilePicture: payload.picture,
          isEmailVerified: true,
          authProvider: 'google',
        });
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
}