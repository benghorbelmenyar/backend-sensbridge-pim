// src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UseGuards,
  Get,
  Res,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { GoogleAuthGuard } from 'src/guards/google-auth.guard';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { RegisterDeviceDto } from './dtos/register-device.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminGuard } from 'src/guards/admin.guard'; // ✅ Import du guard admin

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ══════════════════════════════════════════
  //  ROUTES PUBLIQUES
  // ══════════════════════════════════════════

  @Post('signup')
  @ApiOperation({ summary: 'Créer un nouveau compte' })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès' })
  @ApiResponse({ status: 400, description: 'Email déjà utilisé' })
  async signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Se connecter (user ou admin)' })
  @ApiResponse({ status: 200, description: 'Connexion réussie - retourne isAdmin: true si admin' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rafraîchir le token' })
  @ApiResponse({ status: 200, description: 'Token rafraîchi avec succès' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Demander un code OTP pour réinitialiser le mot de passe' })
  @ApiResponse({ status: 200, description: "Email envoyé si l'utilisateur existe" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Vérifier le code OTP reçu par email' })
  @ApiResponse({ status: 200, description: 'OTP vérifié avec succès, retourne le resetToken' })
  @ApiResponse({ status: 401, description: 'OTP invalide ou expiré' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Put('reset-password')
  @ApiOperation({ summary: 'Réinitialiser le mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
  @ApiResponse({ status: 401, description: 'Lien invalide ou expiré' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }

  // ══════════════════════════════════════════
  //  ROUTES PROTÉGÉES (user connecté)
  // ══════════════════════════════════════════

  @UseGuards(AuthenticationGuard)
  @Put('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe changé avec succès' })
  @ApiResponse({ status: 401, description: 'Token invalide ou ancien mot de passe incorrect' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(
      req.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 400, description: 'Email déjà utilisé' })
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Req() req) {
    return this.authService.updateProfile(req.userId, updateProfileDto);
  }

  @UseGuards(AuthenticationGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil récupéré avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.userId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('profile/upload-picture')
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `profile-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('📄 Mimetype reçu:', file.mimetype);
        console.log('📄 Original name:', file.originalname);

        if (
          !file.mimetype.startsWith('image/') &&
          file.mimetype !== 'application/octet-stream'
        ) {
          return cb(new BadRequestException('Seules les images sont acceptées!'), false);
        }

        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
 

  @UseGuards(AuthenticationGuard)
  @Post('profile/upload-handicap-card')
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/handicap-cards',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `handicap-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('📄 [HANDICAP] Mimetype reçu:', file.mimetype);
        console.log('📄 [HANDICAP] Original name:', file.originalname);

        if (
          !file.mimetype.startsWith('image/') &&
          file.mimetype !== 'application/octet-stream'
        ) {
          return cb(new BadRequestException('Seules les images sont acceptées!'), false);
        }

        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
 
  // ══════════════════════════════════════════
  //  ROUTES ADMIN (🔒 AdminGuard requis)
  // ══════════════════════════════════════════

  @UseGuards(AuthenticationGuard, AdminGuard)
  @Get('admin/users')
  @ApiBearerAuth()
  @ApiOperation({ summary: '🔒 ADMIN - Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin seulement' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @UseGuards(AuthenticationGuard, AdminGuard)
  @Delete('admin/users/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '🔒 ADMIN - Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin seulement' })
  async deleteUser(@Param('id') userId: string) {
    return this.authService.deleteUser(userId);
  }

  @UseGuards(AuthenticationGuard, AdminGuard)
  @Get('admin/handicap-cards/pending')
  @ApiBearerAuth()
  @ApiOperation({ summary: '🔒 ADMIN - Récupérer les cartes handicap en attente' })
  @ApiResponse({ status: 200, description: 'Liste des cartes en attente de vérification' })
  async getPendingHandicapCards() {
    return this.authService.getPendingHandicapCards();
  }

  @UseGuards(AuthenticationGuard, AdminGuard)
  @Put('admin/handicap-cards/:userId/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: '🔒 ADMIN - Approuver une carte handicap' })
  @ApiResponse({ status: 200, description: 'Carte approuvée' })
  async approveHandicapCard(@Param('userId') userId: string) {
    return this.authService.approveHandicapCard(userId);
  }

  @UseGuards(AuthenticationGuard, AdminGuard)
  @Put('admin/handicap-cards/:userId/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: '🔒 ADMIN - Rejeter une carte handicap' })
  @ApiResponse({ status: 200, description: 'Carte rejetée' })
  async rejectHandicapCard(
    @Param('userId') userId: string,
    @Body() body: { reason?: string },
  ) {
    return this.authService.rejectHandicapCard(userId, body.reason);
  }

  // ══════════════════════════════════════════
  //  ROUTES GOOGLE
  // ══════════════════════════════════════════

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Authentification Google (redirection)' })
  async googleAuth() { }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback Google OAuth' })
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      const tokens = await this.authService['generateTokensForUser'](req.user);

      return res.redirect(
        `myapp://auth/google?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&user=${encodeURIComponent(
          JSON.stringify(tokens.user),
        )}`,
      );
    } catch (error) {
      console.error('Error in callback:', error);
      return res.redirect('/login?error=auth_failed');
    }
  }

  @Post('google/token')
  @ApiOperation({ summary: 'Authentification Google via Token (mobile)' })
  @ApiResponse({ status: 200, description: 'Connexion Google réussie' })
  @ApiResponse({ status: 401, description: 'Token Google invalide' })
  async googleTokenAuth(@Body() googleTokenDto: GoogleTokenDto) {
    return this.authService.googleTokenLogin(googleTokenDto.idToken);
  }

  
@UseGuards(AuthenticationGuard)
@Post('device')
@ApiBearerAuth()
@ApiOperation({ summary: 'Enregistrer le device de l\'utilisateur (app mobile)' })
@ApiResponse({ status: 201, description: 'Device enregistré' })
@ApiResponse({ status: 401, description: 'Non authentifié' })
async registerDevice(@Body() dto: RegisterDeviceDto, @Req() req) {
  return this.authService.registerDevice(req.userId, dto);
}

@UseGuards(AuthenticationGuard)
@Post('profile/upload-picture')
@ApiBearerAuth()
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profiles',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `profile-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
   fileFilter: (req, file, cb) => {
  console.log('📄 Mimetype reçu:', file.mimetype);
  console.log('📄 Original name:', file.originalname);

  // ✅ Android / iOS safe
  if (
    !file.mimetype.startsWith('image/') &&
    file.mimetype !== 'application/octet-stream'
  ) {
    return cb(
      new BadRequestException('Seules les images sont acceptées!'),
      false,
    );
  }

  cb(null, true);
},


    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  }),
)
@ApiOperation({ summary: 'Upload photo de profil' })
async uploadProfilePicture(@UploadedFile() file: Express.Multer.File, @Req() req) {
  const imageUrl = `/uploads/profiles/${file.filename}`;
  
  await this.authService.updateProfile(req.userId, {
    profilePicture: imageUrl,
  });

  return {
    success: true,
    message: 'Profile picture uploaded successfully',
    profilePicture: imageUrl,
  };
}
// src/auth/auth.controller.ts - AJOUTER CETTE ROUTE APRÈS uploadProfilePicture

  /**
   * ✅ UPLOAD ET VÉRIFICATION DE LA CARTE D'HANDICAP
   */
  @UseGuards(AuthenticationGuard)
  @Post('profile/upload-handicap-card')
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/handicap-cards',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `handicap-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
  console.log('📄 [HANDICAP] Mimetype reçu:', file.mimetype);
  console.log('📄 [HANDICAP] Original name:', file.originalname);

  // ✅ Android / iOS SAFE
  if (
    !file.mimetype.startsWith('image/') &&
    file.mimetype !== 'application/octet-stream'
  ) {
    return cb(
      new BadRequestException('Seules les images sont acceptées!'),
      false,
    );
  }

  cb(null, true);
}
,
      limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB max (cartes scannées peuvent être lourdes)
      },
    }),
  )
  @ApiOperation({ summary: 'Upload et vérification de la carte d\'handicap' })
  @ApiResponse({ 
    status: 200, 
    description: 'Carte vérifiée avec succès',
    schema: {
      example: {
        success: true,
        message: 'Carte d\'handicap vérifiée avec succès',
        isVerified: true,
        confidence: 95,
        carteHandicape: '/uploads/handicap-cards/handicap-123456.jpg',
        extractedData: {
          fullName: 'Ahmed Ben Ali',
          cardNumber: 'TN-2024-12345',
          disabilityType: 'Moteur',
          expiryDate: '2026-12-31'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Carte invalide ou non conforme' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async uploadHandicapCard(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    console.log('📸 Fichier reçu:', file.filename);
    console.log('📍 Path:', file.path);

    return this.authService.uploadAndVerifyHandicapCard(
      req.userId,
      file.path,
    );
  }
}