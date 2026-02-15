import { ApiProperty } from '@nestjs/swagger';

export class TranscriptionSegment {
  @ApiProperty()
  id: number;

  @ApiProperty()
  start: number;

  @ApiProperty()
  end: number;

  @ApiProperty()
  text: string;
}

export class TranscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  detectedLanguage: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  duration: number;

  @ApiProperty({ type: [TranscriptionSegment] })
  segments: TranscriptionSegment[];

  @ApiProperty()
  createdAt: Date;
}
