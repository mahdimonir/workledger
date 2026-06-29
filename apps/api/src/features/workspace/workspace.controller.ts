import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { UpdateWorkspaceSettingsDto } from './dto/update-workspace-settings.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('Workspace Settings')
@Controller('workspace')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('settings')
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Get workspace and business profile settings' })
  getSettings(@CurrentUser('workspaceId') workspaceId: string) {
    return this.workspaceService.getSettings(workspaceId);
  }

  @Patch('settings')
  @Roles(Role.OWNER) 
  @ApiOperation({ summary: 'Update workspace and business profile settings' })
  updateSettings(
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateWorkspaceSettingsDto,
  ) {
    return this.workspaceService.updateSettings(workspaceId, userId, dto);
  }
}
