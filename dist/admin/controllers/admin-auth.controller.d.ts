import { AdminAuthService } from '../services/admin-auth.service';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { AdminRegisterDto } from '../dto/admin-register.dto';
import { AdminChangePasswordDto } from '../dto/change-password.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
export declare class AdminAuthController {
    private readonly authService;
    constructor(authService: AdminAuthService);
    login(loginDto: AdminLoginDto): Promise<{
        access_token: string;
        admin: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            role: string;
        };
    }>;
    register(dto: AdminRegisterDto): Promise<{
        firstName?: string;
        lastName?: string;
        email: string;
        role: string;
        permissions: string[];
        avatarUrl?: string;
        lastLogin: Date;
        isActive: boolean;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    getProfile(req: any): Promise<import("../schemas/admin.schema").Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(req: any, body: UpdateAdminDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/admin.schema").Admin, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/admin.schema").Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    changePassword(req: any, dto: AdminChangePasswordDto): Promise<{
        message: string;
    }>;
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
}
