import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';

/** Profils utilisateur : CDC + types alignés app mobile */
export const USER_PROFILE_TYPES = [
  'Sourd',
  'Malentendant',
  'Aveugle',
  'Malvoyant',
  'Parent',
  'Aidant',
  'Mixte',
  'NORMAL_PERSON',
  'DEAF_PERSON',
  'ORGANIZATION',
] as const;

export class CreateUserDto {
  @ApiProperty({ description: 'Nom d\'affichage' })
  @IsString()
  displayName: string;

  @ApiProperty({ description: 'Email de connexion' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Type de profil (CDC ou app mobile : NORMAL_PERSON, DEAF_PERSON, ORGANIZATION)',
    enum: USER_PROFILE_TYPES,
  })
  @IsEnum(USER_PROFILE_TYPES)
  profileType: string;

  @ApiPropertyOptional({ description: 'Handicaps ou besoins spécifiques' })
  @IsOptional()
  @IsArray()
  disabilities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Statut actif (true) ou inactif (false)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

