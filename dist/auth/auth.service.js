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
let AuthService = class AuthService {
    UserModel;
    RefreshTokenModel;
    ResetTokenModel;
    jwtService;
    configService;
    mailService;
    rolesService;
    constructor(UserModel, RefreshTokenModel, ResetTokenModel, jwtService, configService, mailService, rolesService) {
        this.UserModel = UserModel;
        this.RefreshTokenModel = RefreshTokenModel;
        this.ResetTokenModel = ResetTokenModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.rolesService = rolesService;
    }
    async signup(signupData) {
        const { email, password, name } = signupData;
        const emailInUse = await this.UserModel.findOne({
            email,
        });
        if (emailInUse) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.UserModel.create({
            name,
            email,
            password: hashedPassword,
        });
        const tokens = await this.generateUserTokens(user._id);
        return {
            ...tokens,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
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
        const tokens = await this.generateUserTokens(user._id);
        return {
            ...tokens,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
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
        const user = await this.UserModel.findOne({ email });
        if (user) {
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const resetToken = (0, nanoid_1.nanoid)(64);
            await this.ResetTokenModel.create({
                token: resetToken,
                userId: user._id,
                expiryDate,
            });
            this.mailService.sendPasswordResetEmail(email, resetToken);
        }
        return { message: 'If this user exists, they will receive an email' };
    }
    async resetPassword(newPassword, resetToken) {
        const token = await this.ResetTokenModel.findOneAndDelete({
            token: resetToken,
            expiryDate: { $gte: new Date() },
        });
        if (!token) {
            throw new common_1.UnauthorizedException('Invalid link');
        }
        const user = await this.UserModel.findById(token.userId);
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return { message: 'Password reset successfully' };
    }
    async refreshTokens(refreshToken) {
        const token = await this.RefreshTokenModel.findOne({
            token: refreshToken,
            expiryDate: { $gte: new Date() },
        });
        if (!token) {
            throw new common_1.UnauthorizedException('Refresh Token is invalid');
        }
        return this.generateUserTokens(token.userId);
    }
    async generateUserTokens(userId) {
        const secret = this.configService.get('JWT_SECRET') || 'your-secret-key';
        const accessToken = this.jwtService.sign({ userId: userId.toString() }, {
            secret,
            expiresIn: '10h'
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
        await this.RefreshTokenModel.updateOne({ userId }, { $set: { expiryDate, token } }, {
            upsert: true,
        });
    }
    async getUserPermissions(userId) {
        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('Utilisateur introuvable');
        }
        const role = await this.rolesService.getRoleById(user.roleId.toString());
        if (!role) {
            throw new common_1.BadRequestException('Rôle introuvable');
        }
        return role.permissions;
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