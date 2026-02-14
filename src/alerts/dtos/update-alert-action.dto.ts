import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlertActionDto {
  @ApiProperty({
    description: 'Action taken by user',
    enum: ['acknowledge', 'ignore', 'emergency', 'safe'],
    example: 'acknowledge',
  })
  @IsEnum(['acknowledge', 'ignore', 'emergency', 'safe'])
  actionTaken: string;
}
