import { Module } from '@nestjs/common';
import { BabyCryController } from './baby-cry.controller';
import { BabyCryService } from './baby-cry.service';
import { BabyCryMlService } from './baby-cry-ml.service';

@Module({
  controllers: [BabyCryController],
  providers: [BabyCryService, BabyCryMlService],
  exports: [BabyCryService],
})
export class BabyCryModule {}
