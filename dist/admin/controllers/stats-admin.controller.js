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
exports.StatsAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stats_admin_service_1 = require("../services/stats-admin.service");
const admin_guard_1 = require("../guards/admin.guard");
let StatsAdminController = class StatsAdminController {
    statsService;
    constructor(statsService) {
        this.statsService = statsService;
    }
    getDashboard() {
        return this.statsService.getDashboardStats();
    }
    getAlertsTimeline(days = 7) {
        return this.statsService.getAlertsTimeline(Number(days) || 7);
    }
    getAlertsTimelineByType(days = 7) {
        return this.statsService.getAlertsTimelineByType(Number(days) || 7);
    }
};
exports.StatsAdminController = StatsAdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques Dashboard (KPIs, graphiques)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatsAdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('alerts-timeline'),
    (0, swagger_1.ApiOperation)({ summary: 'Timeline alertes (jours)' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StatsAdminController.prototype, "getAlertsTimeline", null);
__decorate([
    (0, common_1.Get)('alerts-timeline-by-type'),
    (0, swagger_1.ApiOperation)({ summary: 'Timeline alertes par type de son (Pleurs, Sirènes, Verre cassé)' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StatsAdminController.prototype, "getAlertsTimelineByType", null);
exports.StatsAdminController = StatsAdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Dashboard / Stats'),
    (0, common_1.Controller)('admin/stats'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    __metadata("design:paramtypes", [stats_admin_service_1.StatsAdminService])
], StatsAdminController);
//# sourceMappingURL=stats-admin.controller.js.map