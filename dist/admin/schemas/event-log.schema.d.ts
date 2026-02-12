import { Document } from 'mongoose';
export declare class EventLog extends Document {
    userId: string;
    eventType: string;
    soundLabel: string;
    confidence: number;
    metadata: Record<string, any>;
}
export declare const EventLogSchema: import("mongoose").Schema<EventLog, import("mongoose").Model<EventLog, any, any, any, (Document<unknown, any, EventLog, any, import("mongoose").DefaultSchemaOptions> & EventLog & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, EventLog, any, import("mongoose").DefaultSchemaOptions> & EventLog & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, EventLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EventLog, Document<unknown, {}, EventLog, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EventLog & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, EventLog, Document<unknown, {}, EventLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EventLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, EventLog, Document<unknown, {}, EventLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EventLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, EventLog, Document<unknown, {}, EventLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EventLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    eventType?: import("mongoose").SchemaDefinitionProperty<string, EventLog, Document<unknown, {}, EventLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EventLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    soundLabel?: import("mongoose").SchemaDefinitionProperty<string, EventLog, Document<unknown, {}, EventLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EventLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    confidence?: import("mongoose").SchemaDefinitionProperty<number, EventLog, Document<unknown, {}, EventLog, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EventLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, EventLog>;
