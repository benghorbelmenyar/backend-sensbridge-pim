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
exports.RoleSchema = exports.Role = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const action_enum_1 = require("../enums/action.enum");
const resource_enum_1 = require("../enums/resource.enum");
let Permission = class Permission {
    resource;
    actions;
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: resource_enum_1.Resource }),
    __metadata("design:type", String)
], Permission.prototype, "resource", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String, enum: action_enum_1.Action }] }),
    __metadata("design:type", Array)
], Permission.prototype, "actions", void 0);
Permission = __decorate([
    (0, mongoose_1.Schema)()
], Permission);
let Role = class Role {
    name;
    permissions;
};
exports.Role = Role;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [Permission] }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
exports.Role = Role = __decorate([
    (0, mongoose_1.Schema)()
], Role);
exports.RoleSchema = mongoose_1.SchemaFactory.createForClass(Role);
//# sourceMappingURL=role.schema.js.map