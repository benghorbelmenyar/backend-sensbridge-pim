import { Document } from 'mongoose';
export declare class NotificationPreferences extends Document {
    userId: string;
    channels: string[];
    nightMode: boolean;
    customVibrations: Record<string, any>;
    soundSettings: Record<string, any>;
}
export declare const NotificationPreferencesSchema: import("mongoose").Schema<NotificationPreferences, import("mongoose").Model<NotificationPreferences, any, any, any, (Document<unknown, any, NotificationPreferences, any, import("mongoose").DefaultSchemaOptions> & NotificationPreferences & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, NotificationPreferences, any, import("mongoose").DefaultSchemaOptions> & NotificationPreferences & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, NotificationPreferences>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NotificationPreferences, Document<unknown, {}, NotificationPreferences, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationPreferences & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, NotificationPreferences, Document<unknown, {}, NotificationPreferences, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationPreferences & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, NotificationPreferences, Document<unknown, {}, NotificationPreferences, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationPreferences & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    channels?: import("mongoose").SchemaDefinitionProperty<string[], NotificationPreferences, Document<unknown, {}, NotificationPreferences, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationPreferences & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    nightMode?: import("mongoose").SchemaDefinitionProperty<boolean, NotificationPreferences, Document<unknown, {}, NotificationPreferences, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationPreferences & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    customVibrations?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, NotificationPreferences, Document<unknown, {}, NotificationPreferences, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationPreferences & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    soundSettings?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, NotificationPreferences, Document<unknown, {}, NotificationPreferences, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationPreferences & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, NotificationPreferences>;
