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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const signup_dto_1 = require("./dtos/signup.dto");
const login_dto_1 = require("./dtos/login.dto");
const refresh_tokens_dto_1 = require("./dtos/refresh-tokens.dto");
const change_password_dto_1 = require("./dtos/change-password.dto");
const authentication_guard_1 = require("../guards/authentication.guard");
const forgot_password_dto_1 = require("./dtos/forgot-password.dto");
const reset_password_dto_1 = require("./dtos/reset-password.dto");
const verify_otp_dto_1 = require("./dtos/verify-otp.dto");
const google_auth_guard_1 = require("../guards/google-auth.guard");
const google_token_dto_1 = require("./dtos/google-token.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async signUp(signupData) {
        return this.authService.signup(signupData);
    }
    async login(credentials) {
        return this.authService.login(credentials);
    }
    async refreshTokens(refreshTokenDto) {
        return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }
    async changePassword(changePasswordDto, req) {
        return this.authService.changePassword(req.userId, changePasswordDto.oldPassword, changePasswordDto.newPassword);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }
    async verifyOtp(verifyOtpDto) {
        return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.newPassword, resetPasswordDto.resetToken);
    }
    async googleAuth() {
    }
    async googleAuthCallback(req, res) {
        try {
            const tokens = await this.authService['generateTokensForUser'](req.user);
            return res.redirect(`myapp://auth/google?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&user=${encodeURIComponent(JSON.stringify(tokens.user))}`);
        }
        catch (error) {
            console.error('Error in callback:', error);
            return res.redirect('/login?error=auth_failed');
        }
    }
    async googleTokenAuth(googleTokenDto) {
        return this.authService.googleTokenLogin(googleTokenDto.idToken);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau compte' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Compte créé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email déjà utilisé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Se connecter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion réussie' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Identifiants incorrects' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Rafraîchir le token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token rafraîchi avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_tokens_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, common_1.Put)('change-password'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Changer le mot de passe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mot de passe changé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token invalide ou ancien mot de passe incorrect' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Demander un code OTP pour réinitialiser le mot de passe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email envoyé si l\'utilisateur existe' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier le code OTP reçu par email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP vérifié avec succès, retourne le resetToken' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'OTP invalide ou expiré' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Put)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Réinitialiser le mot de passe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mot de passe réinitialisé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Lien invalide ou expiré' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Authentification Google (redirection)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Callback Google OAuth' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthCallback", null);
__decorate([
    (0, common_1.Post)('google/token'),
    (0, swagger_1.ApiOperation)({ summary: 'Authentification Google via Token (mobile)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion Google réussie' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token Google invalide' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_token_dto_1.GoogleTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleTokenAuth", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map