import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // ← AJOUTER
import { ConfigModule, ConfigService } from '@nestjs/config'; // ← AJOUTER
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { ResetToken, ResetTokenSchema } from './schemas/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import { RolesModule } from 'src/roles/roles.module';
import { GoogleStrategy } from './strategies/google.strategy';


@Module({
  imports: [
    ConfigModule, // ← AJOUTER pour accéder aux variables d'environnement
    RolesModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      {
        name: ResetToken.name,
        schema: ResetTokenSchema,
      },
    ]),
    // ← AJOUTER JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '1h', // Token expire après 1 heure
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService ,GoogleStrategy
],
  exports: [AuthService],
})
export class AuthModule {}