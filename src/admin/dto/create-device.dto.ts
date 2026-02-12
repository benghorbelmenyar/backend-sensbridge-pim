import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  userId: string;

  @IsString()
  deviceId: string;

  @IsEnum(['Smartphone', 'Smartwatch'])
  type: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  specs?: Record<string, any>;
}

