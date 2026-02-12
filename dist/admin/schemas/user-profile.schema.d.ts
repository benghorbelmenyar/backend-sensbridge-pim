import { Document } from 'mongoose';
export declare class UserProfile extends Document {
    displayName: string;
    email: string;
    profileType: string;
    disabilities: string[];
    phoneNumber: string;
    dateOfBirth: Date;
    isActive: boolean;
    lastConnection: Date;
}
export declare const UserProfileSchema: import("mongoose").Schema<UserProfile, import("mongoose").Model<UserProfile, any, any, any, (Document<unknown, any, UserProfile, any, import("mongoose").DefaultSchemaOptions> & UserProfile & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, UserProfile, any, import("mongoose").DefaultSchemaOptions> & UserProfile & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, UserProfile>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserProfile, Document<unknown, {}, UserProfile, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    email?: import("mongoose").SchemaDefinitionProperty<string, UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayName?: import("mongoose").SchemaDefinitionProperty<string, UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    profileType?: import("mongoose").SchemaDefinitionProperty<string, UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    disabilities?: import("mongoose").SchemaDefinitionProperty<string[], UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phoneNumber?: import("mongoose").SchemaDefinitionProperty<string, UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dateOfBirth?: import("mongoose").SchemaDefinitionProperty<Date, UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastConnection?: import("mongoose").SchemaDefinitionProperty<Date, UserProfile, Document<unknown, {}, UserProfile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserProfile & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, UserProfile>;
