import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module'; // ← AJOUTER

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Connexion MongoDB
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/sensbridge'
    ),
    
    // AuthModule
    AuthModule, // ← TRÈS IMPORTANT !
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}