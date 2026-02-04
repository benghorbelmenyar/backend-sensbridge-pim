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

@Injectable()
export class AuthService {
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
  ) {}

  async signup(signupData: SignupDto) {
    // ✅ Destructurer TOUS les champs
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

    // Check if email is in use
    const emailInUse = await this.UserModel.findOne({
      email,
    });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user document avec TOUS les champs
    const user = await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      userType: userType || 'USER', // Valeur par défaut
      language: language || undefined,
      carteHandicape: carteHandicape || undefined,
    });

    console.log('✅ User créé avec succès:', user._id);

    // Generate tokens
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
    
    // Find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Generate JWT tokens
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
    // Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    // Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    // Check that user exists
    const user = await this.UserModel.findOne({ email });

    if (user) {
      // If user exists, generate password reset link
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });
      // Send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return { message: 'If this user exists, they will receive an email' };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    // Find a valid reset token document
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }

    // Change user password (MAKE SURE TO HASH!!)
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password reset successfully' };
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
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async getUserPermissions(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    // ✅ Correction de l'erreur TypeScript
    if (!user.roleId) {
      throw new BadRequestException('Utilisateur sans rôle assigné');
    }

    const role = await this.rolesService.getRoleById(user.roleId.toString());

    if (!role) {
      throw new BadRequestException('Rôle introuvable');
    }

    return role.permissions;
  }
}