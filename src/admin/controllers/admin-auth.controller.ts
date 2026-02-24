import { BadRequestException, Body, Controller, Get, Patch, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { AdminRegisterDto } from '../dto/admin-register.dto';
import { AdminChangePasswordDto } from '../dto/change-password.dto';
import { AdminGuard } from '../guards/admin.guard';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { memoryStorage } from 'multer';

@ApiTags('Admin - Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Se connecter',
    description: 'Authentification admin avec email et mot de passe. Retourne un JWT.',
  })
  @ApiResponse({ status: 200, description: 'Connexion réussie - access_token retourné' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiBody({ type: AdminLoginDto })
  async login(@Body() loginDto: AdminLoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Créer un nouveau compte admin',
    description: 'Inscription d\'un nouvel administrateur. Email doit être unique.',
  })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès' })
  @ApiResponse({ status: 409, description: 'Cet email est déjà utilisé' })
  @ApiBody({ type: AdminRegisterDto })
  async register(@Body() dto: AdminRegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('admin-token')
  @ApiOperation({
    summary: 'Profil admin connecté',
    description: 'Récupère les infos complètes de l\'admin connecté (nécessite JWT).',
  })
  @ApiResponse({ status: 200, description: 'Profil admin' })
  @ApiResponse({ status: 401, description: 'Token manquant ou invalide' })
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @Put('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('admin-token')
  @ApiOperation({
    summary: 'Mise à jour profil admin',
    description: 'Modifier prénom, nom, avatar. Pour changer le mot de passe, utiliser PATCH /change-password.',
  })
  @ApiResponse({ status: 200, description: 'Profil mis à jour' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  updateProfile(@Request() req: any, @Body() body: UpdateAdminDto) {
    return this.authService.updateProfile(req.user.sub, body);
  }

  @Patch('change-password')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('admin-token')
  @ApiOperation({
    summary: 'Changer le mot de passe',
    description: 'Modifier le mot de passe de l\'admin connecté. Requiert le mot de passe actuel.',
  })
  @ApiResponse({ status: 200, description: 'Mot de passe modifié avec succès' })
  @ApiResponse({ status: 400, description: 'Mot de passe actuel incorrect' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiBody({ type: AdminChangePasswordDto })
  changePassword(@Request() req: any, @Body() dto: AdminChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }

  @Post('me/avatar')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  @ApiBearerAuth('admin-token')
  @ApiOperation({ summary: 'Upload photo de profil admin' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar mis à jour' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('Fichier image requis');
    }
    return this.authService.uploadAvatar(req.user.sub, file);
  }
}

