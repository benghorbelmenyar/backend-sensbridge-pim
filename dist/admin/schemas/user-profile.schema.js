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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileSchema = exports.UserProfile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserProfile = class UserProfile extends mongoose_2.Document {
    displayName;
    email;
    profileType;
    disabilities;
    phoneNumber;
    dateOfBirth;
    isActive;
    lastConnection;
};
exports.UserProfile = UserProfile;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserProfile.prototype, "displayName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], UserProfile.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: [
            'Sourd', 'Malentendant', 'Aveugle', 'Malvoyant', 'Parent', 'Aidant', 'Mixte',
            'NORMAL_PERSON', 'DEAF_PERSON', 'ORGANIZATION',
        ],
    }),
    __metadata("design:type", String)
], UserProfile.prototype, "profileType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], UserProfile.prototype, "disabilities", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserProfile.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], UserProfile.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], UserProfile.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], UserProfile.prototype, "lastConnection", void 0);
exports.UserProfile = UserProfile = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserProfile);
exports.UserProfileSchema = mongoose_1.SchemaFactory.createForClass(UserProfile);
//# sourceMappingURL=user-profile.schema.js.map