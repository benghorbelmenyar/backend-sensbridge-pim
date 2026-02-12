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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_admin_service_1 = require("../services/users-admin.service");
const filter_query_dto_1 = require("../dto/filter-query.dto");
const create_user_dto_1 = require("../dto/create-user.dto");
const update_user_dto_1 = require("../dto/update-user.dto");
const admin_guard_1 = require("../guards/admin.guard");
let UsersAdminController = class UsersAdminController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    findAll(query) {
        return this.usersService.findAll(query);
    }
    getStats() {
        return this.usersService.getUserStats();
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
};
exports.UsersAdminController = UsersAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des utilisateurs',
        description: 'Récupère la liste paginée avec filtres (search, profileType, limit, skip).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des utilisateurs' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_query_dto_1.FilterQueryDto]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Statistiques utilisateurs',
        description: 'KPIs pour le Dashboard : total, actifs aujourd\'hui, par profil.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détails utilisateur' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer utilisateur',
        description: 'Crée un utilisateur avec préférences par défaut.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Utilisateur créé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier utilisateur' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer utilisateur',
        description: 'Supprime l\'utilisateur et ses préférences associées.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID MongoDB de l\'utilisateur' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "remove", null);
exports.UsersAdminController = UsersAdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Utilisateurs'),
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    __metadata("design:paramtypes", [users_admin_service_1.UsersAdminService])
], UsersAdminController);
//# sourceMappingURL=users-admin.controller.js.map