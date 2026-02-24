import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/** DTO changement de mot de passe admin (nom distinct pour éviter conflit Swagger avec auth) */
export class AdminChangePasswordDto {
  @ApiProperty({ description: 'Mot de passe actuel' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'Nouveau mot de passe (min 6 caractères)', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
