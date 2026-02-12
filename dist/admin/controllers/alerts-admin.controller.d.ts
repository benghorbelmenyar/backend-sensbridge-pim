import { AlertsAdminService } from '../services/alerts-admin.service';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateAlertDto } from '../dto/create-alert.dto';
export declare class AlertsAdminController {
    private readonly alertsService;
    constructor(alertsService: AlertsAdminService);
    findAll(query: FilterQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/alert.schema").Alert, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/alert.schema").Alert & Required<{
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
    getCount(): Promise<{
        count: number;
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/alert.schema").Alert, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/alert.schema").Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(createAlertDto: CreateAlertDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/alert.schema").Alert, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/alert.schema").Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    acknowledge(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/alert.schema").Alert, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/alert.schema").Alert & Required<{
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
