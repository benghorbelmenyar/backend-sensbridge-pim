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
exports.DevicesAdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const device_schema_1 = require("../schemas/device.schema");
let DevicesAdminService = class DevicesAdminService {
    deviceModel;
    constructor(deviceModel) {
        this.deviceModel = deviceModel;
    }
    async findAll(query) {
        const { search, skip, limit, sortBy, sortOrder } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { deviceId: { $regex: search, $options: 'i' } },
            ];
        }
        const total = await this.deviceModel.countDocuments(filter);
        const devices = await this.deviceModel
            .find(filter)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        return {
            data: devices,
            total,
            page: Math.floor(skip / limit) + 1,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const device = await this.deviceModel.findById(id);
        if (!device) {
            throw new common_1.NotFoundException('Dispositif non trouvé');
        }
        return device;
    }
    async create(createDeviceDto) {
        const device = new this.deviceModel(createDeviceDto);
        return device.save();
    }
    async update(id, updateDto) {
        const device = await this.deviceModel.findByIdAndUpdate(id, updateDto, {
            new: true,
        });
        if (!device) {
            throw new common_1.NotFoundException('Dispositif non trouvé');
        }
        return device;
    }
    async remove(id) {
        const result = await this.deviceModel.findByIdAndDelete(id);
        if (!result) {
            throw new common_1.NotFoundException('Dispositif non trouvé');
        }
        return { message: 'Dispositif supprimé avec succès' };
    }
};
exports.DevicesAdminService = DevicesAdminService;
exports.DevicesAdminService = DevicesAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(device_schema_1.Device.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DevicesAdminService);
//# sourceMappingURL=devices-admin.service.js.map