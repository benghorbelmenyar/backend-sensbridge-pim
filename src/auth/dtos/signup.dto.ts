import { IsEmail, IsString, IsEnum, IsOptional, Matches, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

@IsEnum(['ORGANIZATION', 'DEAF_PERSON', 'NORMAL_PERSON'])  @IsOptional()
  userType?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  carteHandicape?: string; // carte d'handicapé
}