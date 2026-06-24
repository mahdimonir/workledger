import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationPreferenceService } from './notification-preference.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('Notification Preferences')
@Controller('notifications/preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationPreferenceController {
  constructor(
    private readonly preferenceService: NotificationPreferenceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notification preferences' })
  getPreferences(@CurrentUser('id') userId: string) {
    return this.preferenceService.getPreferences(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user notification preferences' })
  updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.preferenceService.updatePreferences(userId, dto);
  }
}
