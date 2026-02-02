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
exports.Permission = exports.CreateRoleDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const action_enum_1 = require("../enums/action.enum");
const resource_enum_1 = require("../enums/resource.enum");
class CreateRoleDto {
    name;
    permissions;
}
exports.CreateRoleDto = CreateRoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Permission),
    __metadata("design:type", Array)
], CreateRoleDto.prototype, "permissions", void 0);
class Permission {
    resource;
    actions;
}
exports.Permission = Permission;
__decorate([
    (0, class_validator_1.IsEnum)(resource_enum_1.Resource),
    __metadata("design:type", String)
], Permission.prototype, "resource", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(action_enum_1.Action, { each: true }),
    (0, class_validator_1.ArrayUnique)(),
    __metadata("design:type", Array)
], Permission.prototype, "actions", void 0);
//# sourceMappingURL=role.dto.js.map