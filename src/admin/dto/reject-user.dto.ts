import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectUserDto {
  @ApiPropertyOptional({
    description: 'Raison du refus (visible par l\'utilisateur dans l\'app mobile)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
