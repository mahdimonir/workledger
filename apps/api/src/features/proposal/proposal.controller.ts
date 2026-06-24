import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProposalService } from './proposal.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalQueryDto } from './dto/proposal-query.dto';
import { AcceptProposalDto } from './dto/accept-proposal.dto';
import { JwtAuthGuard, Public } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('Proposals & Contracts')
@Controller('proposals')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new proposal with automated backend calculations' })
  @ApiResponse({ status: 201, description: 'Proposal successfully created.' })
  create(@Body() dto: CreateProposalDto, @CurrentUser('id') userId: string) {
    return this.proposalService.createProposal(dto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'List and filter proposals' })
  getProposals(@Query() query: ProposalQueryDto) {
    return this.proposalService.getProposals(query);
  }

  @Public()
  @Get('view/:viewToken')
  @ApiOperation({ summary: 'Get proposal details via client view token (transitions status to VIEWED)' })
  @ApiResponse({ status: 200, description: 'Proposal details successfully retrieved.' })
  viewProposal(@Param('viewToken') viewToken: string) {
    return this.proposalService.getProposalByViewToken(viewToken);
  }

  @Public()
  @Post('view/:viewToken/accept')
  @ApiOperation({ summary: 'Accept a proposal (client action, auto-converts proposal to project)' })
  @ApiResponse({ status: 200, description: 'Proposal successfully accepted and project provisioned.' })
  acceptProposal(
    @Param('viewToken') viewToken: string,
    @Body() dto: AcceptProposalDto,
    @Ip() ipAddress: string,
  ) {
    return this.proposalService.acceptProposal(viewToken, dto, ipAddress);
  }

  @Public()
  @Post('view/:viewToken/reject')
  @ApiOperation({ summary: 'Reject a proposal (client action)' })
  @ApiResponse({ status: 200, description: 'Proposal rejected.' })
  rejectProposal(
    @Param('viewToken') viewToken: string,
    @Body('rejectionNote') rejectionNote: string,
  ) {
    return this.proposalService.rejectProposal(viewToken, rejectionNote);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Get details of a single proposal' })
  getProposalById(@Param('id') id: string) {
    return this.proposalService.getProposalById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Update a proposal (supports triggering a new version snapshot)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProposalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.proposalService.updateProposal(id, dto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Soft delete a proposal' })
  remove(@Param('id') id: string) {
    return this.proposalService.deleteProposal(id);
  }

  @Get(':id/versions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Get version history snapshots of a proposal' })
  getVersions(@Param('id') id: string) {
    return this.proposalService.getVersions(id);
  }

  @Post(':id/versions/:version/restore')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Restore a specific proposal version snapshot' })
  restoreVersion(
    @Param('id') id: string,
    @Param('version') version: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.proposalService.restoreVersion(id, parseInt(version, 10), userId);
  }
}
