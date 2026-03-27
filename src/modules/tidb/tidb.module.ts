import { Module } from '@nestjs/common';
import { TidbService } from './tidb.service';

@Module({
  providers: [TidbService],
  exports: [TidbService],   // Quan trọng để dùng ở module khác
})
export class TidbModule {}