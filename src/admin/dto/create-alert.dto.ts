import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

/** Niveaux d'urgence selon CDC SenseBridge : Urgence 1 (CRITIQUE), 2 (IMPORTANT), 3 (INFORMATIF) */
export const ALERT_PRIORITY = ['P1', 'P2', 'P3'] as const;
export const ALERT_PRIORITY_LABELS: Record<string, string> = {
  P1: 'CRITIQUE',
  P2: 'IMPORTANT',
  P3: 'INFORMATIF',
};

export class CreateAlertDto {
  @ApiProperty({ description: 'ID utilisateur concerné' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Priorité : P1=CRITIQUE (incendie, bébé intense), P2=IMPORTANT, P3=INFORMATIF',
    enum: ALERT_PRIORITY,
  })
  @IsEnum(ALERT_PRIORITY)
  priority: string;

  @ApiProperty({ description: 'Message de l\'alerte' })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Type de son détecté (ex: baby_cry, fire_alarm, doorbell, phone, siren, horn, glass_break, knocking, alarm_clock)',
  })
  @IsString()
  soundType: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

