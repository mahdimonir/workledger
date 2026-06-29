import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DataExportService } from './data-export.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('GDPR Data Export')
@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DataExportController {
  constructor(private readonly exportService: DataExportService) {}

  @Post()
  @Roles(Role.OWNER) 
  @ApiOperation({ summary: 'Request a ZIP download containing all workspace data' })
  triggerExport(
    @CurrentUser('id') userId: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.exportService.triggerExport(userId, workspaceId);
  }
}
