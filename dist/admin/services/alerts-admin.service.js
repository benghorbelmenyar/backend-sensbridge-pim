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
exports.AlertsAdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const alert_schema_1 = require("../schemas/alert.schema");
let AlertsAdminService = class AlertsAdminService {
    alertModel;
    constructor(alertModel) {
        this.alertModel = alertModel;
    }
    async findAll(query) {
        const { search, skip, limit, sortBy, sortOrder } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { message: { $regex: search, $options: 'i' } },
                { soundType: { $regex: search, $options: 'i' } },
            ];
        }
        const total = await this.alertModel.countDocuments(filter);
        const alerts = await this.alertModel
            .find(filter)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        return {
            data: alerts,
            total,
            page: Math.floor(skip / limit) + 1,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const alert = await this.alertModel.findById(id);
        if (!alert) {
            throw new common_1.NotFoundException('Alerte non trouvée');
        }
        return alert;
    }
    async create(createAlertDto) {
        const alert = new this.alertModel(createAlertDto);
        return alert.save();
    }
    async acknowledge(id) {
        const alert = await this.alertModel.findByIdAndUpdate(id, { acknowledged: true, acknowledgedAt: new Date() }, { new: true });
        if (!alert) {
            throw new common_1.NotFoundException('Alerte non trouvée');
        }
        return alert;
    }
    async remove(id) {
        const result = await this.alertModel.findByIdAndDelete(id);
        if (!result) {
            throw new common_1.NotFoundException('Alerte non trouvée');
        }
        return { message: 'Alerte supprimée avec succès' };
    }
    async getCountToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.alertModel.countDocuments({ createdAt: { $gte: today } });
    }
};
exports.AlertsAdminService = AlertsAdminService;
exports.AlertsAdminService = AlertsAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(alert_schema_1.Alert.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AlertsAdminService);
//# sourceMappingURL=alerts-admin.service.js.map