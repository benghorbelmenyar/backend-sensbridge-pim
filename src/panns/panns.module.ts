import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PannsService } from './panns.service';
import { PannsController } from './panns.controller';

@Module({
  imports: [ConfigModule],
  providers: [PannsService],
  controllers: [PannsController],
})
export class PannsModule {}

