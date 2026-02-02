import mongoose, { Document } from 'mongoose';
export declare class RefreshToken extends Document {
    token: string;
    userId: mongoose.Types.ObjectId;
    expiryDate: Date;
}
export declare const RefreshTokenSchema: mongoose.Schema<RefreshToken, mongoose.Model<RefreshToken, any, any, any, (mongoose.Document<unknown, any, RefreshToken, any, mongoose.DefaultSchemaOptions> & RefreshToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (mongoose.Document<unknown, any, RefreshToken, any, mongoose.DefaultSchemaOptions> & RefreshToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}), any, RefreshToken>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, RefreshToken, mongoose.Document<unknown, {}, RefreshToken, {
    id: string;
}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<RefreshToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, RefreshToken, mongoose.Document<unknown, {}, RefreshToken, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<RefreshToken & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    token?: mongoose.SchemaDefinitionProperty<string, RefreshToken, mongoose.Document<unknown, {}, RefreshToken, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<RefreshToken & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, RefreshToken, mongoose.Document<unknown, {}, RefreshToken, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<RefreshToken & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    expiryDate?: mongoose.SchemaDefinitionProperty<Date, RefreshToken, mongoose.Document<unknown, {}, RefreshToken, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<RefreshToken & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, RefreshToken>;
