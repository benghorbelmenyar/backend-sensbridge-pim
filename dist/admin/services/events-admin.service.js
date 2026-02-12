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
exports.EventsAdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_log_schema_1 = require("../schemas/event-log.schema");
let EventsAdminService = class EventsAdminService {
    eventModel;
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async findAll(query) {
        const { search, skip, limit, sortBy, sortOrder } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { eventType: { $regex: search, $options: 'i' } },
                { soundLabel: { $regex: search, $options: 'i' } },
            ];
        }
        const total = await this.eventModel.countDocuments(filter);
        const events = await this.eventModel
            .find(filter)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        return {
            data: events,
            total,
            page: Math.floor(skip / limit) + 1,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const event = await this.eventModel.findById(id);
        if (!event) {
            throw new common_1.NotFoundException('Événement non trouvé');
        }
        return event;
    }
};
exports.EventsAdminService = EventsAdminService;
exports.EventsAdminService = EventsAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_log_schema_1.EventLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EventsAdminService);
//# sourceMappingURL=events-admin.service.js.map