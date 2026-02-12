import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../schemas/admin.schema';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { AdminRegisterDto } from '../dto/admin-register.dto';
import { AdminChangePasswordDto } from '../dto/change-password.dto';
export declare class AdminAuthService {
    private readonly adminModel;
    private readonly jwtService;
    constructor(adminModel: Model<Admin>, jwtService: JwtService);
    validateAdmin(email: string, password: string): Promise<Admin>;
    login(email: string, password: string): Promise<{
        access_token: string;
        admin: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            role: string;
        };
    }>;
    createAdmin(email: string, password: string, role?: string): Promise<import("mongoose").Document<unknown, {}, Admin, {}, import("mongoose").DefaultSchemaOptions> & Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
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
    changePassword(id: string, dto: AdminChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(id: string): Promise<Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(id: string, body: UpdateAdminDto): Promise<import("mongoose").Document<unknown, {}, Admin, {}, import("mongoose").DefaultSchemaOptions> & Admin & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    uploadAvatar(adminId: string, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
}
