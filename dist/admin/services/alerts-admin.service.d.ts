import { Model } from 'mongoose';
import { Alert } from '../schemas/alert.schema';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateAlertDto } from '../dto/create-alert.dto';
export declare class AlertsAdminService {
    private readonly alertModel;
    constructor(alertModel: Model<Alert>);
    findAll(query: FilterQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, Alert, {}, import("mongoose").DefaultSchemaOptions> & Alert & Required<{
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Alert, {}, import("mongoose").DefaultSchemaOptions> & Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(createAlertDto: CreateAlertDto): Promise<import("mongoose").Document<unknown, {}, Alert, {}, import("mongoose").DefaultSchemaOptions> & Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    acknowledge(id: string): Promise<import("mongoose").Document<unknown, {}, Alert, {}, import("mongoose").DefaultSchemaOptions> & Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getCountToday(): Promise<number>;
}
