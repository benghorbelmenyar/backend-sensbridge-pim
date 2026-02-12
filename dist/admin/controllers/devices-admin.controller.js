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
exports.DevicesAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const devices_admin_service_1 = require("../services/devices-admin.service");
const filter_query_dto_1 = require("../dto/filter-query.dto");
const create_device_dto_1 = require("../dto/create-device.dto");
const admin_guard_1 = require("../guards/admin.guard");
let DevicesAdminController = class DevicesAdminController {
    devicesService;
    constructor(devicesService) {
        this.devicesService = devicesService;
    }
    findAll(query) {
        return this.devicesService.findAll(query);
    }
    findOne(id) {
        return this.devicesService.findOne(id);
    }
    create(createDeviceDto) {
        return this.devicesService.create(createDeviceDto);
    }
    update(id, updateDto) {
        return this.devicesService.update(id, updateDto);
    }
    remove(id) {
        return this.devicesService.remove(id);
    }
};
exports.DevicesAdminController = DevicesAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des dispositifs' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_query_dto_1.FilterQueryDto]),
    __metadata("design:returntype", void 0)
], DevicesAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détails dispositif' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer dispositif' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_device_dto_1.CreateDeviceDto]),
    __metadata("design:returntype", void 0)
], DevicesAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier dispositif' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DevicesAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer dispositif' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesAdminController.prototype, "remove", null);
exports.DevicesAdminController = DevicesAdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Dispositifs'),
    (0, common_1.Controller)('admin/devices'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('admin-token'),
    __metadata("design:paramtypes", [devices_admin_service_1.DevicesAdminService])
], DevicesAdminController);
//# sourceMappingURL=devices-admin.controller.js.map