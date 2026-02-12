import { Model } from 'mongoose';
import { EventLog } from '../schemas/event-log.schema';
import { FilterQueryDto } from '../dto/filter-query.dto';
export declare class EventsAdminService {
    private readonly eventModel;
    constructor(eventModel: Model<EventLog>);
    findAll(query: FilterQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, EventLog, {}, import("mongoose").DefaultSchemaOptions> & EventLog & Required<{
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, EventLog, {}, import("mongoose").DefaultSchemaOptions> & EventLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
