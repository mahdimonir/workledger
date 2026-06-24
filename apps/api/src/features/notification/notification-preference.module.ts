import { Module } from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationPreferenceController } from './notification-preference.controller';

@Module({
  providers: [NotificationPreferenceService],
  controllers: [NotificationPreferenceController],
  exports: [NotificationPreferenceService],
})
export class NotificationPreferenceModule {}
