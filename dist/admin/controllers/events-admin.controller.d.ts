import { EventsAdminService } from '../services/events-admin.service';
import { FilterQueryDto } from '../dto/filter-query.dto';
export declare class EventsAdminController {
    private readonly eventsService;
    constructor(eventsService: EventsAdminService);
    findAll(query: FilterQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/event-log.schema").EventLog, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/event-log.schema").EventLog & Required<{
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/event-log.schema").EventLog, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/event-log.schema").EventLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
