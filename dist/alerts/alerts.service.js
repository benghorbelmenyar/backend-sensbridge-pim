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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const alert_schema_1 = require("./schemas/alert.schema");
let AlertsService = class AlertsService {
    alertModel;
    constructor(alertModel) {
        this.alertModel = alertModel;
    }
    async create(userId, createAlertDto) {
        const alert = new this.alertModel({
            ...createAlertDto,
            userId,
            detectedAt: createAlertDto.detectedAt || new Date(),
            actionTaken: createAlertDto.actionTaken || 'none',
        });
        return alert.save();
    }
    async findAllByUserId(userId, limit, category) {
        const query = { userId };
        if (category) {
            query.category = category;
        }
        const alerts = this.alertModel
            .find(query)
            .sort({ detectedAt: -1 })
            .limit(limit || 100);
        return alerts.exec();
    }
    async findOne(id, userId) {
        const alert = await this.alertModel.findById(id).exec();
        if (!alert) {
            throw new common_1.NotFoundException(`Alert with ID ${id} not found`);
        }
        if (alert.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this alert');
        }
        return alert;
    }
    async updateAction(id, userId, updateActionDto) {
        const alert = await this.findOne(id, userId);
        alert.actionTaken = updateActionDto.actionTaken;
        return alert.save();
    }
    async remove(id, userId) {
        const alert = await this.findOne(id, userId);
        await this.alertModel.findByIdAndDelete(id).exec();
    }
    async removeAllByUserId(userId) {
        const result = await this.alertModel.deleteMany({ userId }).exec();
        return { deletedCount: result.deletedCount || 0 };
    }
    async getAlertCount(userId, category) {
        const query = { userId };
        if (category) {
            query.category = category;
        }
        return this.alertModel.countDocuments(query).exec();
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(alert_schema_1.Alert.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map