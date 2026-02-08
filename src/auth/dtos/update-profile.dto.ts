import { IsEmail, IsString, IsEnum, IsOptional, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsEnum(['ORGANIZATION', 'DEAF_PERSON', 'NORMAL_PERSON'])
  @IsOptional()
  userType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  carteHandicape?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  profilePicture?: string;
}