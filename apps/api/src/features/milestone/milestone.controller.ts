import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MilestoneService } from './milestone.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { MilestoneQueryDto } from './dto/milestone-query.dto';
import { ClientSignoffDto } from './dto/client-signoff.dto';
import { JwtAuthGuard, Public } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('Project Milestones')
@Controller('milestones')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new project milestone' })
  @ApiResponse({ status: 201, description: 'Milestone successfully created.' })
  create(@Body() dto: CreateMilestoneDto, @CurrentUser('id') userId: string) {
    return this.milestoneService.createMilestone(dto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'List and filter project milestones' })
  getMilestones(@Query() query: MilestoneQueryDto) {
    return this.milestoneService.getMilestones(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Get details of a milestone' })
  getMilestoneById(@Param('id') id: string) {
    return this.milestoneService.getMilestoneById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Update a milestone profile' })
  update(@Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return this.milestoneService.updateMilestone(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Soft delete a milestone' })
  remove(@Param('id') id: string) {
    return this.milestoneService.deleteMilestone(id);
  }

  @Public()
  @Post('share/:shareToken/milestone/:milestoneId/signoff')
  @ApiOperation({ summary: 'Client portal sign-off (Approve / request revisions on milestone)' })
  @ApiResponse({ status: 200, description: 'Milestone signoff registered.' })
  clientSignoff(
    @Param('shareToken') shareToken: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: ClientSignoffDto,
  ) {
    return this.milestoneService.clientSignoff(shareToken, milestoneId, dto);
  }
}
