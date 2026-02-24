import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({ description: 'Detected sound label', example: 'Fire Alarm' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Confidence score (0-1)', example: 0.95 })
  @IsNumber()
  @Min(0)
  @Max(1)
  score: number;

  @ApiProperty({
    description: 'Alert category',
    enum: ['informative', 'danger'],
    example: 'danger',
  })
  @IsEnum(['informative', 'danger'])
  category: string;

  @ApiProperty({
    description: 'Detection timestamp',
    example: '2024-01-01T12:00:00Z',
    required: false,
  })
  @IsOptional()
  detectedAt?: Date;

  @ApiProperty({
    description: 'Action taken by user',
    enum: ['acknowledge', 'ignore', 'emergency', 'safe', 'none'],
    default: 'none',
    required: false,
  })
  @IsOptional()
  @IsEnum(['acknowledge', 'ignore', 'emergency', 'safe', 'none'])
  actionTaken?: string;
}
