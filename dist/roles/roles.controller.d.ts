import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    createRole(role: CreateRoleDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/role.schema").Role, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/role.schema").Role & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
