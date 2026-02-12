import { Model } from 'mongoose';
import { Device } from '../schemas/device.schema';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { CreateDeviceDto } from '../dto/create-device.dto';
export declare class DevicesAdminService {
    private readonly deviceModel;
    constructor(deviceModel: Model<Device>);
    findAll(query: FilterQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, Device, {}, import("mongoose").DefaultSchemaOptions> & Device & Required<{
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Device, {}, import("mongoose").DefaultSchemaOptions> & Device & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(createDeviceDto: CreateDeviceDto): Promise<import("mongoose").Document<unknown, {}, Device, {}, import("mongoose").DefaultSchemaOptions> & Device & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, updateDto: Partial<CreateDeviceDto>): Promise<import("mongoose").Document<unknown, {}, Device, {}, import("mongoose").DefaultSchemaOptions> & Device & Required<{
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
