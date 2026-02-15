"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const transcription_schema_1 = require("./schemas/transcription.schema");
const speech_controller_1 = require("./speech.controller");
const speech_service_1 = require("./speech.service");
const whisper_client_service_1 = require("./whisper-client.service");
let SpeechModule = class SpeechModule {
};
exports.SpeechModule = SpeechModule;
exports.SpeechModule = SpeechModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('jwt.secret') ||
                        configService.get('JWT_SECRET') ||
                        'your-secret-key',
                    signOptions: { expiresIn: '1h' },
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: transcription_schema_1.Transcription.name, schema: transcription_schema_1.TranscriptionSchema },
            ]),
        ],
        controllers: [speech_controller_1.SpeechController],
        providers: [speech_service_1.SpeechService, whisper_client_service_1.WhisperClientService],
        exports: [speech_service_1.SpeechService],
    })
], SpeechModule);
//# sourceMappingURL=speech.module.js.map