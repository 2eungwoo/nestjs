import { Module } from '@nestjs/common';
import { CommonService } from './Common.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
