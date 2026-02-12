import { UsersAdminService } from '../services/users-admin.service';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
export declare class UsersAdminController {
    private readonly usersService;
    constructor(usersService: UsersAdminService);
    findAll(query: FilterQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/user-profile.schema").UserProfile, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/user-profile.schema").UserProfile & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        total: number;
        activeToday: number;
        byProfile: any[];
    }>;
    findOne(id: string): Promise<{
        preferences: (import("mongoose").Document<unknown, {}, import("../schemas/notification-preferences.schema").NotificationPreferences, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/notification-preferences.schema").NotificationPreferences & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
        displayName: string;
        email: string;
        profileType: string;
        disabilities: string[];
        phoneNumber: string;
        dateOfBirth: Date;
        isActive: boolean;
        lastConnection: Date;
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
    create(createUserDto: CreateUserDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/user-profile.schema").UserProfile, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/user-profile.schema").UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/user-profile.schema").UserProfile, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/user-profile.schema").UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
