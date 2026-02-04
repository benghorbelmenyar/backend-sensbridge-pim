import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
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
            language: string | undefined;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto, req: any): Promise<{
        message: string;
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
}
