import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { Plan } from '@prisma/client';
import { UpdatePlanDetailsDto } from './dto/update-plan-details.dto';
import { JwtAuthGuard, Public } from '../../shared/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../shared/guards/super-admin.guard';

@ApiTags('Plan Details Management')
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all subscription plan details (Public)' })
  @ApiResponse({ status: 200, description: 'Return plan details ordered by price.' })
  listPlans() {
    return this.planService.listPlans();
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update parameters for a plan tier (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan details successfully updated.' })
  updatePlan(
    @Param('key') key: Plan,
    @Body() dto: UpdatePlanDetailsDto,
  ) {
    return this.planService.updatePlan(key, dto);
  }
}
