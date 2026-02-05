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
    private googleClient;
    constructor(UserModel: Model<User>, RefreshTokenModel: Model<RefreshToken>, ResetTokenModel: Model<ResetToken>, jwtService: JwtService, configService: ConfigService, mailService: MailService, rolesService: RolesService);
    signup(signupData: SignupDto): Promise<{
        user: {
            id: mongoose.Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            userType: string | undefined;
            language: string | undefined;
            carteHandicape: string | undefined;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(credentials: LoginDto): Promise<{
        user: {
            id: mongoose.Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            userType: string | undefined;
            language: string | undefined;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword(userId: any, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        success: boolean;
        resetToken: string;
        message: string;
    }>;
    resetPassword(newPassword: string, resetToken: string): Promise<{
        success: boolean;
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
    validateGoogleUser(profile: any): Promise<mongoose.Document<unknown, {}, User, {}, mongoose.DefaultSchemaOptions> & User & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    googleTokenLogin(idToken: string): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: mongoose.Types.ObjectId;
            name: string;
            email: string;
            profilePicture: string | undefined;
        };
    }>;
    private generateTokensForUser;
}
