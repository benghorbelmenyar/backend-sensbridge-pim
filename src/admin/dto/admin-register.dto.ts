import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminRegisterDto {
  @ApiProperty({ description: 'Prénom', example: 'Jean' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Nom', example: 'Dupont' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Email de connexion', example: 'admin@sensebridge.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe (min 6 caractères)', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Rôle', enum: ['super-admin', 'admin', 'moderator'], default: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;
}
