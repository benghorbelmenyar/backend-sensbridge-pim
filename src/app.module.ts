// src/app.module.ts

import { Module, OnModuleInit } from '@nestjs/common'; // ✅ Ajouter OnModuleInit
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service'; // ✅ Ajouter AuthService
import { PannsModule } from './panns/panns.module';
import { AlertsModule } from './alerts/alerts.module';
import { EmergencyContactsModule } from './emergency-contacts/emergency-contacts.module';
import { SpeechModule } from './speech/speech.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/sensbridge'
    ),
    AuthModule,
    
    AuthModule,
    PannsModule,
    AlertsModule,
    EmergencyContactsModule,
    SpeechModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit { // ✅ Ajouter implements OnModuleInit
  constructor(private authService: AuthService) {} // ✅ Injecter AuthService

  async onModuleInit() {
    // ✅ Crée l'admin automatiquement au démarrage si il n'existe pas
    await this.authService.createAdminIfNotExists();
  }
}