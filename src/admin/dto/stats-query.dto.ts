import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  days?: number = 7;
}

