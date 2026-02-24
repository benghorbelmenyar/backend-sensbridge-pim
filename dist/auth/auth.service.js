"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("./schemas/user.schema");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const refresh_token_schema_1 = require("./schemas/refresh-token.schema");
const uuid_1 = require("uuid");
const nanoid_1 = require("nanoid");
const reset_token_schema_1 = require("./schemas/reset-token.schema");
const mail_service_1 = require("../services/mail.service");
const roles_service_1 = require("../roles/roles.service");
const google_auth_library_1 = require("google-auth-library");
const path = __importStar(require("path"));
const ocr_service_1 = require("../services/ocr.service");
let AuthService = class AuthService {
    UserModel;
    RefreshTokenModel;
    ResetTokenModel;
    jwtService;
    configService;
    mailService;
    rolesService;
    googleClient;
    constructor(UserModel, RefreshTokenModel, ResetTokenModel, jwtService, configService, mailService, rolesService) {
        this.UserModel = UserModel;
        this.RefreshTokenModel = RefreshTokenModel;
        this.ResetTokenModel = ResetTokenModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.rolesService = rolesService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
    }
    async createAdminIfNotExists() {
        const adminEmail = this.configService.get('ADMIN_EMAIL') || 'admin@sensbridge.com';
        const adminPassword = this.configService.get('ADMIN_PASSWORD') || 'Admin@1234';
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
        }
        else {
            console.log('ℹ️  Admin existe déjà:', adminEmail);
        }
    }
    async signup(signupData) {
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
            throw new common_1.BadRequestException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.UserModel.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || undefined,
            userType: userType || 'USER',
            role: 'USER',
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
    async login(credentials) {
        const { email, password } = credentials;
        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new common_1.UnauthorizedException('Wrong credentials');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new common_1.UnauthorizedException('Wrong credentials');
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
                role: user.role,
                language: user.language,
                isAdmin: user.role === 'ADMIN',
            },
        };
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found...');
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            throw new common_1.UnauthorizedException('Wrong credentials');
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = newHashedPassword;
        await user.save();
        return { message: 'Password changed successfully' };
    }
    async forgotPassword(email) {
        console.log('═══════════════════════════════════════');
        console.log('🔵 FORGOT PASSWORD - Email:', email);
        const user = await this.UserModel.findOne({ email });
        if (user) {
            console.log('✅ Utilisateur trouvé:', user.name);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const resetToken = (0, nanoid_1.nanoid)(64);
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
            }
            catch (error) {
                console.error('❌ Erreur envoi email:', error);
            }
        }
        else {
            console.log('⚠️ Utilisateur non trouvé pour:', email);
        }
        console.log('═══════════════════════════════════════');
        return {
            success: true,
            message: 'If this user exists, they will receive an email',
        };
    }
    async verifyOtp(email, otp) {
        console.log('═══════════════════════════════════════');
        console.log('🔵 VERIFY OTP');
        console.log('Email:', email);
        console.log('OTP:', otp);
        const user = await this.UserModel.findOne({ email });
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        const token = await this.ResetTokenModel.findOne({
            userId: user._id,
            otp,
            expiryDate: { $gte: new Date() },
        });
        if (!token) {
            console.log('❌ OTP invalide ou expiré');
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        console.log('✅ OTP valide - Token:', token.token.substring(0, 10) + '...');
        console.log('═══════════════════════════════════════');
        return {
            success: true,
            resetToken: token.token,
            message: 'OTP verified successfully',
        };
    }
    async resetPassword(newPassword, resetToken) {
        console.log('═══════════════════════════════════════');
        console.log('🔵 RESET PASSWORD');
        console.log('Reset token:', resetToken.substring(0, 10) + '...');
        const token = await this.ResetTokenModel.findOneAndDelete({
            token: resetToken,
            expiryDate: { $gte: new Date() },
        });
        if (!token) {
            console.log('❌ Token invalide ou expiré');
            throw new common_1.UnauthorizedException('Invalid or expired reset link');
        }
        const user = await this.UserModel.findById(token.userId);
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            throw new common_1.InternalServerErrorException();
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        console.log('✅ Mot de passe réinitialisé pour:', user.email);
        try {
            await this.mailService.sendPasswordResetConfirmation(user.email, user.name);
            console.log('✅ Email de confirmation envoyé');
        }
        catch (error) {
            console.error('⚠️ Erreur envoi email confirmation:', error);
        }
        console.log('═══════════════════════════════════════');
        return {
            success: true,
            message: 'Password reset successfully',
        };
    }
    async refreshTokens(refreshToken) {
        const token = await this.RefreshTokenModel.findOne({
            token: refreshToken,
            expiryDate: { $gte: new Date() },
        });
        if (!token) {
            throw new common_1.UnauthorizedException('Refresh Token is invalid');
        }
        const user = await this.UserModel.findById(token.userId);
        return this.generateUserTokens(token.userId, user?.role);
    }
    async generateUserTokens(userId, role) {
        const secret = this.configService.get('JWT_SECRET') || 'your-secret-key';
        const accessToken = this.jwtService.sign({
            userId: userId.toString(),
            role: role || 'USER',
        }, {
            secret,
            expiresIn: '10h',
        });
        const refreshToken = (0, uuid_1.v4)();
        await this.storeRefreshToken(refreshToken, userId);
        return {
            accessToken,
            refreshToken,
        };
    }
    async storeRefreshToken(token, userId) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 3);
        await this.RefreshTokenModel.updateOne({ userId }, { $set: { expiryDate, token } }, { upsert: true });
    }
    async getUserPermissions(userId) {
        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('Utilisateur introuvable');
        }
        if (!user.roleId) {
            throw new common_1.BadRequestException('Utilisateur sans rôle assigné');
        }
        const role = await this.rolesService.getRoleById(user.roleId.toString());
        if (!role) {
            throw new common_1.BadRequestException('Rôle introuvable');
        }
        return role.permissions;
    }
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
    async deleteUser(userId) {
        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        if (user.role === 'ADMIN') {
            throw new common_1.BadRequestException('Impossible de supprimer un admin');
        }
        await this.UserModel.findByIdAndDelete(userId);
        return {
            success: true,
            message: 'Utilisateur supprimé avec succès',
        };
    }
    async validateGoogleUser(profile) {
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
        }
        else {
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
    async googleTokenLogin(idToken) {
        try {
            console.log('🔵 Google Token Auth Request');
            console.log('Token reçu:', idToken?.substring(0, 20) + '...');
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            console.log('✅ Token vérifié, payload:', payload);
            if (!payload) {
                throw new common_1.UnauthorizedException('Token Google invalide');
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
            }
            else {
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
        }
        catch (error) {
            console.error('❌ Error in Google Token Auth:', error);
            throw new common_1.UnauthorizedException('Token Google invalide');
        }
    }
    async generateTokensForUser(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role || 'USER',
        };
        const secret = this.configService.get('JWT_SECRET') || 'your-secret-key';
        const accessToken = this.jwtService.sign(payload, {
            secret,
            expiresIn: '1h',
        });
        const refreshTokenString = (0, uuid_1.v4)();
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
    async updateProfile(userId, updateData) {
        console.log('═══════════════════════════════════════');
        console.log('🔵 UPDATE PROFILE - userId:', userId);
        console.log('Données à mettre à jour:', updateData);
        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateData.email && updateData.email !== user.email) {
            const emailExists = await this.UserModel.findOne({
                email: updateData.email,
                _id: { $ne: userId },
            });
            if (emailExists) {
                throw new common_1.BadRequestException('Email already in use');
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
    async getProfile(userId) {
        const user = await this.UserModel.findById(userId).select('-password');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async uploadAndVerifyHandicapCard(userId, imagePath) {
        console.log('═══════════════════════════════════════');
        console.log('🔵 UPLOAD & VERIFY HANDICAP CARD');
        console.log('👤 User ID:', userId);
        console.log('📸 Image:', imagePath);
        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        const cardUrl = `/uploads/handicap-cards/${path.basename(imagePath)}`;
        user.carteHandicape = cardUrl;
        let analysisResult = null;
        try {
            const ocrService = new ocr_service_1.OcrService(this.configService);
            analysisResult = await ocrService.analyzeHandicapCard(imagePath);
        }
        catch (ocrError) {
            console.error('⚠️ OCR échoué, la carte sera sauvegardée pour vérification manuelle:', ocrError.message);
        }
        if (analysisResult) {
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
            }
            else {
                user.handicapStatus = 'PENDING';
                user.isHandicapVerified = false;
                console.log('⏳ Carte valide OCR → en attente de vérification admin');
            }
        }
        else {
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
                createdAt: u.createdAt,
            })),
        };
    }
    async approveHandicapCard(userId) {
        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        if (user.handicapStatus !== 'PENDING') {
            throw new common_1.BadRequestException('Cette carte n\'est pas en attente de vérification');
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
    async rejectHandicapCard(userId, reason) {
        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        if (user.handicapStatus !== 'PENDING') {
            throw new common_1.BadRequestException('Cette carte n\'est pas en attente de vérification');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(refresh_token_schema_1.RefreshToken.name)),
    __param(2, (0, mongoose_1.InjectModel)(reset_token_schema_1.ResetToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService,
        roles_service_1.RolesService])
], AuthService);
//# sourceMappingURL=auth.service.js.map