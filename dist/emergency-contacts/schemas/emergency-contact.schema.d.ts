import { Document } from 'mongoose';
export declare class EmergencyContact extends Document {
    userId: string;
    name: string;
    phone: string;
}
export declare const EmergencyContactSchema: import("mongoose").Schema<EmergencyContact, import("mongoose").Model<EmergencyContact, any, any, any, (Document<unknown, any, EmergencyContact, any, import("mongoose").DefaultSchemaOptions> & EmergencyContact & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, EmergencyContact, any, import("mongoose").DefaultSchemaOptions> & EmergencyContact & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, EmergencyContact>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmergencyContact, Document<unknown, {}, EmergencyContact, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EmergencyContact & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, EmergencyContact, Document<unknown, {}, EmergencyContact, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EmergencyContact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, EmergencyContact, Document<unknown, {}, EmergencyContact, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EmergencyContact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, EmergencyContact, Document<unknown, {}, EmergencyContact, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EmergencyContact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, EmergencyContact, Document<unknown, {}, EmergencyContact, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<EmergencyContact & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, EmergencyContact>;
