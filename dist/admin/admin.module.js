"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const auth_module_1 = require("../auth/auth.module");
const admin_schema_1 = require("./schemas/admin.schema");
const user_profile_schema_1 = require("./schemas/user-profile.schema");
const notification_preferences_schema_1 = require("./schemas/notification-preferences.schema");
const alert_schema_1 = require("./schemas/alert.schema");
const event_log_schema_1 = require("./schemas/event-log.schema");
const device_schema_1 = require("./schemas/device.schema");
const admin_auth_controller_1 = require("./controllers/admin-auth.controller");
const users_admin_controller_1 = require("./controllers/users-admin.controller");
const alerts_admin_controller_1 = require("./controllers/alerts-admin.controller");
const devices_admin_controller_1 = require("./controllers/devices-admin.controller");
const events_admin_controller_1 = require("./controllers/events-admin.controller");
const stats_admin_controller_1 = require("./controllers/stats-admin.controller");
const approvals_admin_controller_1 = require("./controllers/approvals-admin.controller");
const admin_auth_service_1 = require("./services/admin-auth.service");
const users_admin_service_1 = require("./services/users-admin.service");
const alerts_admin_service_1 = require("./services/alerts-admin.service");
const devices_admin_service_1 = require("./services/devices-admin.service");
const events_admin_service_1 = require("./services/events-admin.service");
const stats_admin_service_1 = require("./services/stats-admin.service");
const admin_guard_1 = require("./guards/admin.guard");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            mongoose_1.MongooseModule.forFeature([
                { name: admin_schema_1.Admin.name, schema: admin_schema_1.AdminSchema },
                { name: user_profile_schema_1.UserProfile.name, schema: user_profile_schema_1.UserProfileSchema },
                {
                    name: notification_preferences_schema_1.NotificationPreferences.name,
                    schema: notification_preferences_schema_1.NotificationPreferencesSchema,
                },
                { name: alert_schema_1.Alert.name, schema: alert_schema_1.AlertSchema },
                { name: event_log_schema_1.EventLog.name, schema: event_log_schema_1.EventLogSchema },
                { name: device_schema_1.Device.name, schema: device_schema_1.DeviceSchema },
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'sensebridge-secret-key',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        controllers: [
            admin_auth_controller_1.AdminAuthController,
            users_admin_controller_1.UsersAdminController,
            alerts_admin_controller_1.AlertsAdminController,
            devices_admin_controller_1.DevicesAdminController,
            events_admin_controller_1.EventsAdminController,
            stats_admin_controller_1.StatsAdminController,
            approvals_admin_controller_1.ApprovalsAdminController,
        ],
        providers: [
            admin_auth_service_1.AdminAuthService,
            users_admin_service_1.UsersAdminService,
            alerts_admin_service_1.AlertsAdminService,
            devices_admin_service_1.DevicesAdminService,
            events_admin_service_1.EventsAdminService,
            stats_admin_service_1.StatsAdminService,
            admin_guard_1.AdminGuard,
        ],
        exports: [admin_auth_service_1.AdminAuthService, admin_guard_1.AdminGuard],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map