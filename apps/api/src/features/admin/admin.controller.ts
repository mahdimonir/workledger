import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../shared/guards/super-admin.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('SaaS Admin Dashboard')
@Controller('admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List platform users, their plan status, and signup timestamps' })
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('workspaces/:workspaceId/plan')
  @ApiOperation({ summary: 'Update plan tier and expiration for a workspace' })
  updatePlan(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.adminService.updatePlan(
      workspaceId,
      adminUserId,
      dto.plan,
      dto.planExpiresAt,
    );
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Retrieve global platform metrics and signup analytics' })
  getMetrics() {
    return this.adminService.getMetrics();
  }
}
