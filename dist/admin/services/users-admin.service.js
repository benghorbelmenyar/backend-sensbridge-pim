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
exports.UsersAdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_profile_schema_1 = require("../schemas/user-profile.schema");
const notification_preferences_schema_1 = require("../schemas/notification-preferences.schema");
let UsersAdminService = class UsersAdminService {
    userModel;
    prefsModel;
    constructor(userModel, prefsModel) {
        this.userModel = userModel;
        this.prefsModel = prefsModel;
    }
    async findAll(query) {
        const { search, profileType, isActive, skip, limit, sortBy, sortOrder } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { displayName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        if (profileType) {
            filter.profileType = profileType;
        }
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        const total = await this.userModel.countDocuments(filter);
        const users = await this.userModel
            .find(filter)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        return {
            data: users,
            total,
            page: Math.floor(skip / limit) + 1,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        const preferences = await this.prefsModel.findOne({ userId: id });
        return {
            ...user.toObject(),
            preferences,
        };
    }
    async create(createUserDto) {
        const existing = await this.userModel.findOne({
            email: createUserDto.email?.trim?.() || createUserDto.email,
        });
        if (existing) {
            throw new common_1.ConflictException('Cet email est déjà utilisé');
        }
        const user = new this.userModel(createUserDto);
        const savedUser = await user.save();
        const defaultPrefs = new this.prefsModel({
            userId: savedUser._id,
            channels: ['Visuel'],
            nightMode: false,
        });
        await defaultPrefs.save();
        return savedUser;
    }
    async update(id, updateUserDto) {
        const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
            new: true,
        });
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }
    async remove(id) {
        const result = await this.userModel.findByIdAndDelete(id);
        if (!result) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        await this.prefsModel.deleteOne({ userId: id });
        return { message: 'Utilisateur supprimé avec succès' };
    }
    async getUserStats() {
        const total = await this.userModel.countDocuments();
        const activeToday = await this.userModel.countDocuments({
            lastConnection: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });
        const byProfile = await this.userModel.aggregate([
            { $group: { _id: '$profileType', count: { $sum: 1 } } },
        ]);
        return {
            total,
            activeToday,
            byProfile,
        };
    }
};
exports.UsersAdminService = UsersAdminService;
exports.UsersAdminService = UsersAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_profile_schema_1.UserProfile.name)),
    __param(1, (0, mongoose_1.InjectModel)(notification_preferences_schema_1.NotificationPreferences.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersAdminService);
//# sourceMappingURL=users-admin.service.js.map