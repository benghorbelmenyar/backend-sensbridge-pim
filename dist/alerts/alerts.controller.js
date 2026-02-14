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
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alerts_service_1 = require("./alerts.service");
const create_alert_dto_1 = require("./dtos/create-alert.dto");
const update_alert_action_dto_1 = require("./dtos/update-alert-action.dto");
const authentication_guard_1 = require("../guards/authentication.guard");
let AlertsController = class AlertsController {
    alertsService;
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    async create(req, createAlertDto) {
        const userId = req.userId;
        return this.alertsService.create(userId, createAlertDto);
    }
    async findAll(req, limit, category) {
        const userId = req.userId;
        const limitNum = limit ? parseInt(limit.toString(), 10) : undefined;
        return this.alertsService.findAllByUserId(userId, limitNum, category);
    }
    async getCount(req, category) {
        const userId = req.userId;
        return this.alertsService.getAlertCount(userId, category);
    }
    async findOne(req, id) {
        const userId = req.userId;
        return this.alertsService.findOne(id, userId);
    }
    async updateAction(req, id, updateActionDto) {
        const userId = req.userId;
        return this.alertsService.updateAction(id, userId, updateActionDto);
    }
    async remove(req, id) {
        const userId = req.userId;
        await this.alertsService.remove(id, userId);
        return { message: 'Alert deleted successfully' };
    }
    async removeAll(req) {
        const userId = req.userId;
        const result = await this.alertsService.removeAllByUserId(userId);
        return {
            message: 'All alerts deleted successfully',
            deletedCount: result.deletedCount,
        };
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new alert' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Alert created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_alert_dto_1.CreateAlertDto]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all alerts for the authenticated user' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Limit number of results' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, enum: ['informative', 'danger'], description: 'Filter by category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of alerts' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get alert count for the authenticated user' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, enum: ['informative', 'danger'], description: 'Filter by category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert count' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific alert by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert details' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Alert does not belong to user' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/action'),
    (0, swagger_1.ApiOperation)({ summary: 'Update alert action (acknowledge, ignore, etc.)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert action updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Alert does not belong to user' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_alert_action_dto_1.UpdateAlertActionDto]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "updateAction", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a specific alert' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Alert does not belong to user' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all alerts for the authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All alerts deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "removeAll", null);
exports.AlertsController = AlertsController = __decorate([
    (0, swagger_1.ApiTags)('Alerts'),
    (0, common_1.Controller)('alerts'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [alerts_service_1.AlertsService])
], AlertsController);
//# sourceMappingURL=alerts.controller.js.map