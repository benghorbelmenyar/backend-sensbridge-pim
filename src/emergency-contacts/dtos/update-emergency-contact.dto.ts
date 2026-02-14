import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmergencyContactDto {
  @ApiProperty({ description: 'Contact name', example: 'Mom', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  phone?: string;
}
