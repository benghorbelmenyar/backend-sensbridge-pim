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
exports.ApprovalsAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_guard_1 = require("../guards/admin.guard");
const auth_service_1 = require("../../auth/auth.service");
const reject_user_dto_1 = require("../dto/reject-user.dto");
const update_profile_dto_1 = require("../../auth/dtos/update-profile.dto");
let ApprovalsAdminController = class ApprovalsAdminController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    getPending() {
        return this.authService.getPendingUsers();
    }
    async getPendingCount() {
        const count = await this.authService.getPendingCount();
        return { count };
    }
    getAppUsersStats() {
        return this.authService.getAppUsersStatsByType();
    }
    getAppUsers(skip, limit, search) {
        return this.authService.getAppUsers({
            skip: skip != null ? parseInt(skip, 10) : undefined,
            limit: limit != null ? parseInt(limit, 10) : undefined,
            search,
        });
    }
    accept(id, req) {
        const adminId = req.user?.sub?.toString?.();
        return this.authService.approveUser(id, adminId);
    }
    reject(id, req, body) {
        const adminId = req.user?.sub?.toString?.();
        return this.authService.rejectUser(id, adminId, body?.reason);
    }
    block(id) {
        return this.authService.blockUser(id);
    }
    unblock(id) {
        return this.authService.unblockUser(id);
    }
    getOneAppUser(id) {
        return this.authService.getOneAppUser(id);
    }
    updateAppUser(id, dto) {
        return this.authService.updateAppUser(id, dto);
    }
    deleteAppUser(id) {
        return this.authService.deleteAppUser(id);
    }
};
exports.ApprovalsAdminController = ApprovalsAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des utilisateurs en attente',
        description: 'Utilisateurs inscrits depuis l\'app mobile en attente d\'acceptation ou de refus.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des utilisateurs en attente' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Nombre d\'utilisateurs en attente (badge)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '{ count: number }' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApprovalsAdminController.prototype, "getPendingCount", null);
__decorate([
    (0, common_1.Get)('users/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Stats inscrits app par type (Normal Person, Deaf Person, Organization)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '{ total, byUserType }' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "getAppUsersStats", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des utilisateurs app mobile (actifs/inactifs, blocage)',
        description: 'Liste paginée avec search. Permet de bloquer/débloquer les utilisateurs.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste paginée' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "getAppUsers", null);
__decorate([
    (0, common_1.Put)(':id/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accepter un utilisateur' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur (auth User)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur accepté' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "accept", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Refuser un utilisateur (optionnel: raison du refus)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur (auth User)' }),
    (0, swagger_1.ApiBody)({ type: reject_user_dto_1.RejectUserDto, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur refusé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, reject_user_dto_1.RejectUserDto]),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "reject", null);
__decorate([
    (0, common_1.Put)(':id/block'),
    (0, swagger_1.ApiOperation)({ summary: 'Bloquer un utilisateur (statut inactif)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur (auth User)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur bloqué' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "block", null);
__decorate([
    (0, common_1.Put)(':id/unblock'),
    (0, swagger_1.ApiOperation)({ summary: 'Débloquer un utilisateur (statut actif)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur (auth User)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur débloqué' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "unblock", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un utilisateur inscrit (app mobile)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "getOneAppUser", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un utilisateur inscrit (nom, email, téléphone, etc.)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur' }),
    (0, swagger_1.ApiBody)({ type: update_profile_dto_1.UpdateProfileDto, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur mis à jour' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "updateAppUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un utilisateur inscrit (même base que l\'app)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur supprimé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApprovalsAdminController.prototype, "deleteAppUser", null);
exports.ApprovalsAdminController = ApprovalsAdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Approbations (app mobile)'),
    (0, common_1.Controller)('admin/approvals'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], ApprovalsAdminController);
//# sourceMappingURL=approvals-admin.controller.js.map