import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class TranscribeAudioDto {
  @ApiPropertyOptional({
    enum: ['fr', 'en', 'ar', 'auto'],
    default: 'auto',
    description: 'Language hint for transcription (auto = auto-detect)',
  })
  @IsOptional()
  @IsIn(['fr', 'en', 'ar', 'auto'])
  language?: string = 'auto';
}
