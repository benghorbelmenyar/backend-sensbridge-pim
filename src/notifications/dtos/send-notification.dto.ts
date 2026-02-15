import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class NotificationEnabledDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class SendNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class SendBatchNotificationDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class SubscribeTopicDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  topic: string;
}
