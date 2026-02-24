import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transcription,
  TranscriptionSchema,
} from './schemas/transcription.schema';
import { SpeechController } from './speech.controller';
import { SpeechService } from './speech.service';
import { WhisperClientService } from './whisper-client.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('jwt.secret') ||
          configService.get<string>('JWT_SECRET') ||
          'your-secret-key',
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Transcription.name, schema: TranscriptionSchema },
    ]),
  ],
  controllers: [SpeechController],
  providers: [SpeechService, WhisperClientService],
  exports: [SpeechService],
})
export class SpeechModule {}
