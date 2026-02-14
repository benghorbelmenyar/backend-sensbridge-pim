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
exports.EmergencyContactsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const emergency_contacts_service_1 = require("./emergency-contacts.service");
const create_emergency_contact_dto_1 = require("./dtos/create-emergency-contact.dto");
const update_emergency_contact_dto_1 = require("./dtos/update-emergency-contact.dto");
const authentication_guard_1 = require("../guards/authentication.guard");
let EmergencyContactsController = class EmergencyContactsController {
    emergencyContactsService;
    constructor(emergencyContactsService) {
        this.emergencyContactsService = emergencyContactsService;
    }
    async findAll(req) {
        const userId = req.userId;
        return this.emergencyContactsService.findAllByUserId(userId);
    }
    async create(req, createDto) {
        const userId = req.userId;
        return this.emergencyContactsService.create(userId, createDto);
    }
    async update(req, id, updateDto) {
        const userId = req.userId;
        return this.emergencyContactsService.update(id, userId, updateDto);
    }
    async remove(req, id) {
        const userId = req.userId;
        await this.emergencyContactsService.remove(id, userId);
        return { message: 'Emergency contact deleted successfully' };
    }
};
exports.EmergencyContactsController = EmergencyContactsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all emergency contacts for the authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of emergency contacts' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmergencyContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add an emergency contact' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Emergency contact created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_emergency_contact_dto_1.CreateEmergencyContactDto]),
    __metadata("design:returntype", Promise)
], EmergencyContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an emergency contact' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Emergency contact updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Contact does not belong to user' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contact not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_emergency_contact_dto_1.UpdateEmergencyContactDto]),
    __metadata("design:returntype", Promise)
], EmergencyContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an emergency contact' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Emergency contact deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Contact does not belong to user' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contact not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmergencyContactsController.prototype, "remove", null);
exports.EmergencyContactsController = EmergencyContactsController = __decorate([
    (0, swagger_1.ApiTags)('Emergency Contacts'),
    (0, common_1.Controller)('emergency-contacts'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [emergency_contacts_service_1.EmergencyContactsService])
], EmergencyContactsController);
//# sourceMappingURL=emergency-contacts.controller.js.map