"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyContactsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const emergency_contacts_controller_1 = require("./emergency-contacts.controller");
const emergency_contacts_service_1 = require("./emergency-contacts.service");
const emergency_contact_schema_1 = require("./schemas/emergency-contact.schema");
let EmergencyContactsModule = class EmergencyContactsModule {
};
exports.EmergencyContactsModule = EmergencyContactsModule;
exports.EmergencyContactsModule = EmergencyContactsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: emergency_contact_schema_1.EmergencyContact.name, schema: emergency_contact_schema_1.EmergencyContactSchema },
            ]),
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'your-secret-key',
                    signOptions: {
                        expiresIn: '1h',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [emergency_contacts_controller_1.EmergencyContactsController],
        providers: [emergency_contacts_service_1.EmergencyContactsService],
        exports: [emergency_contacts_service_1.EmergencyContactsService],
    })
], EmergencyContactsModule);
//# sourceMappingURL=emergency-contacts.module.js.map