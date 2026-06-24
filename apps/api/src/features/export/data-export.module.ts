import { Module } from '@nestjs/common';
import { DataExportService } from './data-export.service';
import { DataExportController } from './data-export.controller';

@Module({
  providers: [DataExportService],
  controllers: [DataExportController],
  exports: [DataExportService],
})
export class DataExportModule {}
