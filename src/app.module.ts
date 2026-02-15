import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PannsModule } from './panns/panns.module';
import { AlertsModule } from './alerts/alerts.module';
import { EmergencyContactsModule } from './emergency-contacts/emergency-contacts.module';
import { SpeechModule } from './speech/speech.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Connexion MongoDB
    MongooseModule.forRoot(
      process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/sensbridge'
    ),
    
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
export class AppModule {}