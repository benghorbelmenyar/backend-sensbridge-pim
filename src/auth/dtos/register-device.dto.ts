import { IsString, IsOptional, IsIn } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  deviceId: string;

  @IsString()
  @IsIn(['Smartphone', 'Smartwatch'])
  type: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  os?: string;
}
