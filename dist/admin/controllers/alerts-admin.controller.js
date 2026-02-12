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
exports.AlertsAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alerts_admin_service_1 = require("../services/alerts-admin.service");
const filter_query_dto_1 = require("../dto/filter-query.dto");
const create_alert_dto_1 = require("../dto/create-alert.dto");
const admin_guard_1 = require("../guards/admin.guard");
let AlertsAdminController = class AlertsAdminController {
    alertsService;
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    findAll(query) {
        return this.alertsService.findAll(query);
    }
    async getCount() {
        const count = await this.alertsService.getCountToday();
        return { count };
    }
    findOne(id) {
        return this.alertsService.findOne(id);
    }
    create(createAlertDto) {
        return this.alertsService.create(createAlertDto);
    }
    acknowledge(id) {
        return this.alertsService.acknowledge(id);
    }
    remove(id) {
        return this.alertsService.remove(id);
    }
};
exports.AlertsAdminController = AlertsAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des alertes' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_query_dto_1.FilterQueryDto]),
    __metadata("design:returntype", void 0)
], AlertsAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Nombre d\'alertes aujourd\'hui (badge)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertsAdminController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détails alerte' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertsAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer alerte' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_alert_dto_1.CreateAlertDto]),
    __metadata("design:returntype", void 0)
], AlertsAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/acknowledge'),
    (0, swagger_1.ApiOperation)({ summary: 'Acquitter alerte' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertsAdminController.prototype, "acknowledge", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer alerte' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertsAdminController.prototype, "remove", null);
exports.AlertsAdminController = AlertsAdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Alertes'),
    (0, common_1.Controller)('admin/alerts'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    __metadata("design:paramtypes", [alerts_admin_service_1.AlertsAdminService])
], AlertsAdminController);
//# sourceMappingURL=alerts-admin.controller.js.map