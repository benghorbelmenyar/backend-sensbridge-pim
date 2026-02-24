import { Document } from 'mongoose';
export declare class Alert extends Document {
    userId: string;
    label: string;
    score: number;
    category: string;
    detectedAt: Date;
    actionTaken: string;
}
export declare const AlertSchema: import("mongoose").Schema<Alert, import("mongoose").Model<Alert, any, any, any, (Document<unknown, any, Alert, any, import("mongoose").DefaultSchemaOptions> & Alert & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Alert, any, import("mongoose").DefaultSchemaOptions> & Alert & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, Alert>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Alert, Document<unknown, {}, Alert, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Alert & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Alert, Document<unknown, {}, Alert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Alert, Document<unknown, {}, Alert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    label?: import("mongoose").SchemaDefinitionProperty<string, Alert, Document<unknown, {}, Alert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    score?: import("mongoose").SchemaDefinitionProperty<number, Alert, Document<unknown, {}, Alert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<string, Alert, Document<unknown, {}, Alert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    detectedAt?: import("mongoose").SchemaDefinitionProperty<Date, Alert, Document<unknown, {}, Alert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    actionTaken?: import("mongoose").SchemaDefinitionProperty<string, Alert, Document<unknown, {}, Alert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Alert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Alert>;
