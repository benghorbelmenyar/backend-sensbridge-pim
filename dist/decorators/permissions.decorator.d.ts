import { Permission } from 'src/roles/dtos/role.dto';
export declare const PERMISSIONS_KEY = "permissions";
export declare const Permissions: (permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
