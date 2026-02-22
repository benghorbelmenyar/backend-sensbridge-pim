import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(signupData: SignupDto): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            userType: string | undefined;
            role: import("./schemas/user.schema").UserRole | undefined;
            language: string | undefined;
            carteHandicape: string | undefined;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(credentials: LoginDto): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            userType: string | undefined;
            role: import("./schemas/user.schema").UserRole | undefined;
            language: string | undefined;
            isAdmin: boolean;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        success: boolean;
        resetToken: string;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto, req: any): Promise<{
        message: string;
    }>;
    updateProfile(updateProfileDto: UpdateProfileDto, req: any): Promise<{
        success: boolean;
        message: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            userType: string | undefined;
            role: import("./schemas/user.schema").UserRole | undefined;
            language: string | undefined;
            carteHandicape: string | undefined;
            profilePicture: string | undefined;
        };
    }>;
    getProfile(req: any): Promise<{
        success: boolean;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            userType: string | undefined;
            role: import("./schemas/user.schema").UserRole | undefined;
            language: string | undefined;
            carteHandicape: string | undefined;
            profilePicture: string | undefined;
            authProvider: string | undefined;
            isEmailVerified: boolean | undefined;
            isAdmin: boolean;
        };
    }>;
    uploadProfilePicture(file: Express.Multer.File, req: any): Promise<{
        success: boolean;
        message: string;
        profilePicture: string;
    }>;
    uploadHandicapCard(file: Express.Multer.File, req: any): Promise<{
        success: boolean;
        message: string;
        isVerified: boolean;
        confidence: number;
        carteHandicape: string;
        extractedData: {
            fullName?: string;
            cardNumber?: string;
            expiryDate?: string;
            disabilityType?: string;
        };
    }>;
    getAllUsers(): Promise<{
        success: boolean;
        total: number;
        users: (import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    deleteUser(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: Response): Promise<void>;
    googleTokenAuth(googleTokenDto: GoogleTokenDto): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            profilePicture: string | undefined;
            role: import("./schemas/user.schema").UserRole | undefined;
            isAdmin: boolean;
        };
    }>;
}
