"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabyCryModule = void 0;
const common_1 = require("@nestjs/common");
const baby_cry_controller_1 = require("./baby-cry.controller");
const baby_cry_service_1 = require("./baby-cry.service");
const baby_cry_ml_service_1 = require("./baby-cry-ml.service");
let BabyCryModule = class BabyCryModule {
};
exports.BabyCryModule = BabyCryModule;
exports.BabyCryModule = BabyCryModule = __decorate([
    (0, common_1.Module)({
        controllers: [baby_cry_controller_1.BabyCryController],
        providers: [baby_cry_service_1.BabyCryService, baby_cry_ml_service_1.BabyCryMlService],
        exports: [baby_cry_service_1.BabyCryService],
    })
], BabyCryModule);
//# sourceMappingURL=baby-cry.module.js.map