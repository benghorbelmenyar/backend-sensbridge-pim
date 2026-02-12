"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_service_1 = require("../services/admin-auth.service");
const admin_login_dto_1 = require("../dto/admin-login.dto");
const admin_register_dto_1 = require("../dto/admin-register.dto");
const change_password_dto_1 = require("../dto/change-password.dto");
const admin_guard_1 = require("../guards/admin.guard");
const update_admin_dto_1 = require("../dto/update-admin.dto");
const multer_1 = require("multer");
let AdminAuthController = class AdminAuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    getProfile(req) {
        return this.authService.getProfile(req.user.sub);
    }
    updateProfile(req, body) {
        return this.authService.updateProfile(req.user.sub, body);
    }
    changePassword(req, dto) {
        return this.authService.changePassword(req.user.sub, dto);
    }
    async uploadAvatar(req, file) {
        if (!file?.buffer) {
            throw new common_1.BadRequestException('Fichier image requis');
        }
        return this.authService.uploadAvatar(req.user.sub, file);
    }
};
exports.AdminAuthController = AdminAuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'Se connecter',
        description: 'Authentification admin avec email et mot de passe. Retourne un JWT.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion réussie - access_token retourné' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Identifiants invalides' }),
    (0, swagger_1.ApiBody)({ type: admin_login_dto_1.AdminLoginDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_login_dto_1.AdminLoginDto]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un nouveau compte admin',
        description: 'Inscription d\'un nouvel administrateur. Email doit être unique.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Compte créé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cet email est déjà utilisé' }),
    (0, swagger_1.ApiBody)({ type: admin_register_dto_1.AdminRegisterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_register_dto_1.AdminRegisterDto]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Profil admin connecté',
        description: 'Récupère les infos complètes de l\'admin connecté (nécessite JWT).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil admin' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token manquant ou invalide' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminAuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mise à jour profil admin',
        description: 'Modifier prénom, nom, avatar. Pour changer le mot de passe, utiliser PATCH /change-password.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil mis à jour' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_admin_dto_1.UpdateAdminDto]),
    __metadata("design:returntype", void 0)
], AdminAuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Changer le mot de passe',
        description: 'Modifier le mot de passe de l\'admin connecté. Requiert le mot de passe actuel.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mot de passe modifié avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Mot de passe actuel incorrect' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiBody)({ type: change_password_dto_1.AdminChangePasswordDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.AdminChangePasswordDto]),
    __metadata("design:returntype", void 0)
], AdminAuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload photo de profil admin' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar mis à jour' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "uploadAvatar", null);
exports.AdminAuthController = AdminAuthController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Auth'),
    (0, common_1.Controller)('admin/auth'),
    __metadata("design:paramtypes", [admin_auth_service_1.AdminAuthService])
], AdminAuthController);
//# sourceMappingURL=admin-auth.controller.js.map