import { Document, Types } from 'mongoose';
export declare class NotificationHistory extends Document {
    userId: Types.ObjectId;
    type: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    fcmMessageId?: string;
    sentAt: Date;
    deliveredAt?: Date;
    readAt?: Date;
    clickedAt?: Date;
    error?: string;
}
export declare const NotificationHistorySchema: import("mongoose").Schema<NotificationHistory, import("mongoose").Model<NotificationHistory, any, any, any, (Document<unknown, any, NotificationHistory, any, import("mongoose").DefaultSchemaOptions> & NotificationHistory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, NotificationHistory, any, import("mongoose").DefaultSchemaOptions> & NotificationHistory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, NotificationHistory>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NotificationHistory, Document<unknown, {}, NotificationHistory, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    data?: import("mongoose").SchemaDefinitionProperty<Record<string, string> | undefined, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    error?: import("mongoose").SchemaDefinitionProperty<string | undefined, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    body?: import("mongoose").SchemaDefinitionProperty<string, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    fcmMessageId?: import("mongoose").SchemaDefinitionProperty<string | undefined, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sentAt?: import("mongoose").SchemaDefinitionProperty<Date, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    deliveredAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    readAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    clickedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<NotificationHistory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, NotificationHistory>;
