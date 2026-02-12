import { Model } from 'mongoose';
import { UserProfile } from '../schemas/user-profile.schema';
import { NotificationPreferences } from '../schemas/notification-preferences.schema';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
export declare class UsersAdminService {
    private readonly userModel;
    private readonly prefsModel;
    constructor(userModel: Model<UserProfile>, prefsModel: Model<NotificationPreferences>);
    findAll(query: FilterQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, UserProfile, {}, import("mongoose").DefaultSchemaOptions> & UserProfile & Required<{
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
    findOne(id: string): Promise<{
        preferences: (import("mongoose").Document<unknown, {}, NotificationPreferences, {}, import("mongoose").DefaultSchemaOptions> & NotificationPreferences & Required<{
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
    create(createUserDto: CreateUserDto): Promise<import("mongoose").Document<unknown, {}, UserProfile, {}, import("mongoose").DefaultSchemaOptions> & UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("mongoose").Document<unknown, {}, UserProfile, {}, import("mongoose").DefaultSchemaOptions> & UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getUserStats(): Promise<{
        total: number;
        activeToday: number;
        byProfile: any[];
    }>;
}
