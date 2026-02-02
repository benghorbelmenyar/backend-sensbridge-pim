import { SignupDto } from './dtos/signup.dto';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './schemas/refresh-token.schema';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import { RolesService } from 'src/roles/roles.service';
export declare class AuthService {
    private UserModel;
    private RefreshTokenModel;
    private ResetTokenModel;
    private jwtService;
    private configService;
    private mailService;
    private rolesService;
    constructor(UserModel: Model<User>, RefreshTokenModel: Model<RefreshToken>, ResetTokenModel: Model<ResetToken>, jwtService: JwtService, configService: ConfigService, mailService: MailService, rolesService: RolesService);
    signup(signupData: SignupDto): Promise<{
        user: {
            id: mongoose.Types.ObjectId;
            name: string;
            email: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(credentials: LoginDto): Promise<{
        user: {
            id: mongoose.Types.ObjectId;
            name: string;
            email: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword(userId: any, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(newPassword: string, resetToken: string): Promise<{
        message: string;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    generateUserTokens(userId: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    storeRefreshToken(token: string, userId: string): Promise<void>;
    getUserPermissions(userId: string): Promise<{
        resource: import("../roles/enums/resource.enum").Resource;
        actions: import("../roles/enums/action.enum").Action[];
    }[]>;
}
