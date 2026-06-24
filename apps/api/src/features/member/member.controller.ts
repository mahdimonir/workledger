import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MemberService } from './member.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard, Public } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('Workspace Members')
@Controller('workspace/members')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'List all members in the current workspace' })
  @ApiResponse({ status: 200, description: 'List of members returned successfully.' })
  listMembers(@CurrentUser('workspaceId') workspaceId: string) {
    return this.memberService.listMembers(workspaceId);
  }

  @Post('invite')
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Invite a new member to the workspace' })
  @ApiResponse({ status: 201, description: 'Member successfully invited.' })
  inviteMember(
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.memberService.inviteMember(workspaceId, adminUserId, dto);
  }

  @Public()
  @Post('accept')
  @ApiOperation({ summary: 'Accept workspace invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted and account finalized.' })
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.memberService.acceptInvite(dto);
  }

  @Patch(':memberId/role')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update a member role (Owner only)' })
  @ApiResponse({ status: 200, description: 'Member role updated.' })
  updateMemberRole(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.memberService.updateMemberRole(workspaceId, memberId, dto.role);
  }

  @Delete(':memberId')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Remove a member from the workspace (Owner only)' })
  @ApiResponse({ status: 200, description: 'Member successfully removed.' })
  removeMember(
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('id') actorUserId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.memberService.removeMember(workspaceId, memberId, actorUserId);
  }
}
