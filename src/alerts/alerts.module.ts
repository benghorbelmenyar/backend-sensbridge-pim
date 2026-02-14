import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { Alert, AlertSchema } from './schemas/alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }]),
    ConfigModule, // ConfigService is needed by AuthenticationGuard
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
