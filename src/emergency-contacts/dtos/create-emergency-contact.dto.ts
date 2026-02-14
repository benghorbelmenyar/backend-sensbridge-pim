import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmergencyContactDto {
  @ApiProperty({ description: 'Contact name', example: 'Mom' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  phone: string;
}
