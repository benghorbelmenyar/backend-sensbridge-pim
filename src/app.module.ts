// src/app.module.ts

import { Module, OnModuleInit } from '@nestjs/common'; // ✅ Ajouter OnModuleInit
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service'; // ✅ Ajouter AuthService

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/sensbridge'
    ),
    AuthModule,
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