import { Action } from '../enums/action.enum';
import { Resource } from '../enums/resource.enum';
declare class Permission {
    resource: Resource;
    actions: Action[];
}
export declare class Role {
    name: string;
    permissions: Permission[];
}
export declare const RoleSchema: import("mongoose").Schema<Role, import("mongoose").Model<Role, any, any, any, (import("mongoose").Document<unknown, any, Role, any, import("mongoose").DefaultSchemaOptions> & Role & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, Role, any, import("mongoose").DefaultSchemaOptions> & Role & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Role>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Role, import("mongoose").Document<unknown, {}, Role, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Role & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Role, import("mongoose").Document<unknown, {}, Role, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Role & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    permissions?: import("mongoose").SchemaDefinitionProperty<Permission[], Role, import("mongoose").Document<unknown, {}, Role, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Role & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Role>;
export {};
