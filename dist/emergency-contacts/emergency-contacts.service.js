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
exports.EmergencyContactsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const emergency_contact_schema_1 = require("./schemas/emergency-contact.schema");
let EmergencyContactsService = class EmergencyContactsService {
    emergencyContactModel;
    constructor(emergencyContactModel) {
        this.emergencyContactModel = emergencyContactModel;
    }
    async findAllByUserId(userId) {
        return this.emergencyContactModel
            .find({ userId })
            .sort({ createdAt: 1 })
            .exec();
    }
    async create(userId, createDto) {
        const contact = new this.emergencyContactModel({
            userId,
            name: createDto.name.trim(),
            phone: createDto.phone.trim(),
        });
        return contact.save();
    }
    async update(id, userId, updateDto) {
        const contact = await this.emergencyContactModel.findById(id).exec();
        if (!contact) {
            throw new common_1.NotFoundException(`Emergency contact with ID ${id} not found`);
        }
        if (contact.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this emergency contact');
        }
        if (updateDto.name !== undefined)
            contact.name = updateDto.name.trim();
        if (updateDto.phone !== undefined)
            contact.phone = updateDto.phone.trim();
        return contact.save();
    }
    async remove(id, userId) {
        const contact = await this.emergencyContactModel.findById(id).exec();
        if (!contact) {
            throw new common_1.NotFoundException(`Emergency contact with ID ${id} not found`);
        }
        if (contact.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this emergency contact');
        }
        await this.emergencyContactModel.findByIdAndDelete(id).exec();
    }
};
exports.EmergencyContactsService = EmergencyContactsService;
exports.EmergencyContactsService = EmergencyContactsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(emergency_contact_schema_1.EmergencyContact.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmergencyContactsService);
//# sourceMappingURL=emergency-contacts.service.js.map