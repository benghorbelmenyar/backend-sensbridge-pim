import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterTokenDto {
  @ApiProperty({ description: 'FCM device token from Firebase Messaging' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  token: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
