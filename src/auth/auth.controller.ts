import { Body, Controller, Post, Put, Req, UseGuards, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Créer un nouveau compte' })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès' })
  @ApiResponse({ status: 400, description: 'Email déjà utilisé' })
  async signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Se connecter' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
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

  @UseGuards(AuthenticationGuard)
  @Put('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe changé avec succès' })
  @ApiResponse({ status: 401, description: 'Token invalide ou ancien mot de passe incorrect' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    return this.authService.changePassword(
      req.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Demander un code OTP pour réinitialiser le mot de passe' })
  @ApiResponse({ status: 200, description: 'Email envoyé si l\'utilisateur existe' })
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

  // ✅ ROUTES GOOGLE
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Authentification Google (redirection)' })
  async googleAuth() {
    // Redirection automatique vers Google
  }

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
@Put('profile')
@ApiBearerAuth()
@ApiOperation({ summary: 'Mettre à jour le profil utilisateur' })
@ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
@ApiResponse({ status: 401, description: 'Non authentifié' })
@ApiResponse({ status: 400, description: 'Email déjà utilisé' })
async updateProfile(
  @Body() updateProfileDto: UpdateProfileDto,
  @Req() req,
) {
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
// Dans AuthController
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
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
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
}