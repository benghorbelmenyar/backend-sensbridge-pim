import mongoose, { Document } from 'mongoose';
export declare class ResetToken extends Document {
    token: string;
    userId: mongoose.Types.ObjectId;
    expiryDate: Date;
}
export declare const ResetTokenSchema: mongoose.Schema<ResetToken, mongoose.Model<ResetToken, any, any, any, (mongoose.Document<unknown, any, ResetToken, any, mongoose.DefaultSchemaOptions> & ResetToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (mongoose.Document<unknown, any, ResetToken, any, mongoose.DefaultSchemaOptions> & ResetToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}), any, ResetToken>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ResetToken, mongoose.Document<unknown, {}, ResetToken, {
    id: string;
}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<ResetToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, ResetToken, mongoose.Document<unknown, {}, ResetToken, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<ResetToken & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    token?: mongoose.SchemaDefinitionProperty<string, ResetToken, mongoose.Document<unknown, {}, ResetToken, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<ResetToken & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, ResetToken, mongoose.Document<unknown, {}, ResetToken, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<ResetToken & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    expiryDate?: mongoose.SchemaDefinitionProperty<Date, ResetToken, mongoose.Document<unknown, {}, ResetToken, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<ResetToken & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ResetToken>;
