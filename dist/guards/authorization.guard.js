"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auth_service_1 = require("../auth/auth.service");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let AuthorizationGuard = class AuthorizationGuard {
    reflector;
    authService;
    constructor(reflector, authService) {
        this.reflector = reflector;
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (!request.userId) {
            throw new common_1.UnauthorizedException('User Id not found');
        }
        const routePermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        console.log(` the route permissions are ${routePermissions}`);
        if (!routePermissions) {
            return true;
        }
        try {
            const userPermissions = await this.authService.getUserPermissions(request.userId);
            for (const routePermission of routePermissions) {
                const userPermission = userPermissions.find((perm) => perm.resource === routePermission.resource);
                if (!userPermission)
                    throw new common_1.ForbiddenException();
                const allActionsAvailable = routePermission.actions.every((requiredAction) => userPermission.actions.includes(requiredAction));
                if (!allActionsAvailable)
                    throw new common_1.ForbiddenException();
            }
        }
        catch (e) {
            throw new common_1.ForbiddenException();
        }
        return true;
    }
};
exports.AuthorizationGuard = AuthorizationGuard;
exports.AuthorizationGuard = AuthorizationGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector, auth_service_1.AuthService])
], AuthorizationGuard);
//# sourceMappingURL=authorization.guard.js.map