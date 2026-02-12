import { AuthService } from '../../auth/auth.service';
import { RejectUserDto } from '../dto/reject-user.dto';
import { UpdateProfileDto } from '../../auth/dtos/update-profile.dto';
export declare class ApprovalsAdminController {
    private readonly authService;
    constructor(authService: AuthService);
    getPending(): Promise<{
        data: (import("../../auth/schemas/user.schema").User & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    getPendingCount(): Promise<{
        count: number;
    }>;
    getAppUsersStats(): Promise<{
        total: number;
        byUserType: Record<string, number>;
    }>;
    getAppUsers(skip?: string, limit?: string, search?: string): Promise<{
        data: (import("../../auth/schemas/user.schema").User & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    accept(id: string, req: any): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            approvalStatus: string;
        };
    }>;
    reject(id: string, req: any, body?: RejectUserDto): Promise<{
        message: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            approvalStatus: "pending" | "approved" | "rejected" | undefined;
            rejectionReason: any;
        };
    }>;
    block(id: string): Promise<{
        message: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            isActive: any;
        };
    }>;
    unblock(id: string): Promise<{
        message: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            isActive: any;
        };
    }>;
    getOneAppUser(id: string): Promise<import("../../auth/schemas/user.schema").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateAppUser(id: string, dto: UpdateProfileDto): Promise<import("../../auth/schemas/user.schema").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteAppUser(id: string): Promise<{
        message: string;
    }>;
}
