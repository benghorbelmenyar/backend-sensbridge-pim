import { DevicesAdminService } from '../services/devices-admin.service';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateDeviceDto } from '../dto/create-device.dto';
export declare class DevicesAdminController {
    private readonly devicesService;
    constructor(devicesService: DevicesAdminService);
    findAll(query: FilterQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/device.schema").Device, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/device.schema").Device & Required<{
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/device.schema").Device, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/device.schema").Device & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(createDeviceDto: CreateDeviceDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/device.schema").Device, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/device.schema").Device & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, updateDto: Partial<CreateDeviceDto>): Promise<import("mongoose").Document<unknown, {}, import("../schemas/device.schema").Device, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/device.schema").Device & Required<{
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
