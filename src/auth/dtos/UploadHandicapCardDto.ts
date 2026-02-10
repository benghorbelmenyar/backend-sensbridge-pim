// src/auth/dtos/upload-handicap-card.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UploadHandicapCardDto {
  @IsOptional()
  @IsString()
  userId?: string; // Si admin upload pour un autre user
}