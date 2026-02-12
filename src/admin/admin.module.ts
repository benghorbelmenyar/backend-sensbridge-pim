import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

// Schémas
import { Admin, AdminSchema } from './schemas/admin.schema';
import {
  UserProfile,
  UserProfileSchema,
} from './schemas/user-profile.schema';
import {
  NotificationPreferences,
  NotificationPreferencesSchema,
} from './schemas/notification-preferences.schema';
import { Alert, AlertSchema } from './schemas/alert.schema';
import { EventLog, EventLogSchema } from './schemas/event-log.schema';
import { Device, DeviceSchema } from './schemas/device.schema';

// Controllers
import { AdminAuthController } from './controllers/admin-auth.controller';
import { UsersAdminController } from './controllers/users-admin.controller';
import { AlertsAdminController } from './controllers/alerts-admin.controller';
import { DevicesAdminController } from './controllers/devices-admin.controller';
import { EventsAdminController } from './controllers/events-admin.controller';
import { StatsAdminController } from './controllers/stats-admin.controller';
import { ApprovalsAdminController } from './controllers/approvals-admin.controller';
// Services
import { AdminAuthService } from './services/admin-auth.service';
import { UsersAdminService } from './services/users-admin.service';
import { AlertsAdminService } from './services/alerts-admin.service';
import { DevicesAdminService } from './services/devices-admin.service';
import { EventsAdminService } from './services/events-admin.service';
import { StatsAdminService } from './services/stats-admin.service';
// Guards
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      {
        name: NotificationPreferences.name,
        schema: NotificationPreferencesSchema,
      },
      { name: Alert.name, schema: AlertSchema },
      { name: EventLog.name, schema: EventLogSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sensebridge-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    AdminAuthController,
    UsersAdminController,
    AlertsAdminController,
    DevicesAdminController,
    EventsAdminController,
    StatsAdminController,
    ApprovalsAdminController,
  ],
  providers: [
    AdminAuthService,
    UsersAdminService,
    AlertsAdminService,
    DevicesAdminService,
    EventsAdminService,
    StatsAdminService,
    AdminGuard,
  ],
  exports: [AdminAuthService, AdminGuard],
})
export class AdminModule {}

