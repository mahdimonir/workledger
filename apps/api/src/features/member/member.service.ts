import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '@workledger/shared';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async inviteMember(workspaceId: string, adminUserId: string, dto: InviteMemberDto) {
    const { email, role } = dto;

    return this.prisma.$transaction(async (tx) => {
      
      let user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            passwordHash: null,
            name: email.split('@')[0],
            emailVerified: false,
          },
        });
      }

      
      const existingMember = await tx.member.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      });

      const inviteToken = nanoid(32);
      const inviteExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); 

      if (existingMember) {
        if (existingMember.joinedAt) {
          throw new ConflictException('User is already a member of this workspace');
        }
        
        await tx.member.update({
          where: { id: existingMember.id },
          data: {
            role,
            inviteToken,
            inviteExpiry,
            invitedBy: adminUserId,
          },
        });
      } else {
        
        await tx.member.create({
          data: {
            workspaceId,
            userId: user.id,
            role,
            inviteToken,
            inviteExpiry,
            invitedBy: adminUserId,
          },
        });
      }

      console.log(`[SIMULATED MEMBER INVITATION] Invite link: http://localhost:8000/workspace/members/accept?token=${inviteToken}`);

      return { success: true, inviteToken };
    });
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const member = await this.prisma.member.findUnique({
      where: { inviteToken: dto.token },
      include: { user: true },
    });

    if (!member) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    if (member.inviteExpiry && member.inviteExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    
    if (member.user.passwordHash === null) {
      if (!dto.name || !dto.password) {
        throw new BadRequestException('Name and password are required for registration');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);
      await this.prisma.user.update({
        where: { id: member.userId },
        data: {
          name: dto.name,
          passwordHash,
          emailVerified: true,
        },
      });
    }

    await this.prisma.member.update({
      where: { id: member.id },
      data: {
        joinedAt: new Date(),
        inviteToken: null,
        inviteExpiry: null,
      },
    });

    return { success: true };
  }

  async listMembers(workspaceId: string) {
    return this.prisma.member.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async removeMember(workspaceId: string, memberId: string, actorUserId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.workspaceId !== workspaceId) {
      throw new ForbiddenException('Member does not belong to this workspace');
    }

    if (member.role === Role.OWNER) {
      throw new ForbiddenException('Cannot remove the workspace OWNER');
    }

    if (member.userId === actorUserId) {
      throw new ForbiddenException('Cannot remove yourself from the workspace');
    }

    await this.prisma.member.delete({
      where: { id: memberId },
    });

    return { success: true };
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: Role) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.workspaceId !== workspaceId) {
      throw new ForbiddenException('Member does not belong to this workspace');
    }

    if (member.role === Role.OWNER) {
      throw new ForbiddenException('Cannot update the role of the workspace OWNER');
    }

    await this.prisma.member.update({
      where: { id: memberId },
      data: { role },
    });

    return { success: true };
  }
}
