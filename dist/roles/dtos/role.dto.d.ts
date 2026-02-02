import { Action } from '../enums/action.enum';
import { Resource } from '../enums/resource.enum';
export declare class CreateRoleDto {
    name: string;
    permissions: Permission[];
}
export declare class Permission {
    resource: Resource;
    actions: Action[];
}
