import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { MilestoneQueryDto } from './dto/milestone-query.dto';
import { ClientSignoffDto } from './dto/client-signoff.dto';
import { tenantContext } from '../../shared/context/tenant.context';
import { MilestoneStatus } from '@prisma/client';

@Injectable()
export class MilestoneService {
  constructor(private prisma: PrismaService) {}

  async createMilestone(dto: CreateMilestoneDto, userId: string) {
    return this.prisma.milestone.create({
      data: {
        projectId:   dto.projectId,
        name:        dto.name,
        description: dto.description ?? null,
        dueDate:     dto.dueDate ? new Date(dto.dueDate) : null,
        status:      dto.status ?? MilestoneStatus.PENDING,
        order:       dto.order ?? 0,
        createdBy:   userId,
      } as any,
    });
  }

  async getMilestones(query: MilestoneQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const total = await this.prisma.milestone.count({ where });
    const milestones = await this.prisma.milestone.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { order: 'asc' },
    });

    return {
      data: milestones,
      pagination: {
        total,
        page,
        limit,
        hasNext: skip + milestones.length < total,
      },
    };
  }

  async getMilestoneById(id: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    return milestone;
  }

  async updateMilestone(id: string, dto: UpdateMilestoneDto) {
    await this.getMilestoneById(id);

    const updateData: any = { ...dto };
    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }

    return this.prisma.milestone.update({
      where: { id },
      data:  updateData,
    });
  }

  async deleteMilestone(id: string) {
    await this.getMilestoneById(id);
    return this.prisma.milestone.delete({
      where: { id },
    });
  }

  async clientSignoff(shareToken: string, milestoneId: string, dto: ClientSignoffDto) {
    // 1. Verify project share token
    const project = await this.prisma.project.findUnique({
      where: { shareToken },
    });

    if (!project || !project.shareEnabled) {
      throw new NotFoundException('Project share link is invalid or disabled.');
    }

    // 2. Verify milestone belongs to project
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone || milestone.projectId !== project.id) {
      throw new NotFoundException('Milestone not found.');
    }

    // 3. Update status within tenantContext transaction scope
    return tenantContext.run(
      {
        workspaceId: project.workspaceId,
        userId:      'CLIENT_PORTAL',
        role:        'VIEWER',
        plan:        'FREE',
      },
      async () => {
        const updateData: any = {
          status: dto.approved ? MilestoneStatus.APPROVED : MilestoneStatus.REVISION_REQUESTED,
        };

        if (dto.approved) {
          updateData.approvedBy   = dto.clientName;
          updateData.approvedAt   = new Date();
          updateData.completedAt  = new Date();
          updateData.revisionNote = null; // Clear revision note if approved
        } else {
          if (!dto.note) {
            throw new BadRequestException('Revision note comment is required to request revision.');
          }
          updateData.revisionNote = dto.note;
          updateData.approvedBy   = null;
          updateData.approvedAt   = null;
          updateData.completedAt  = null;
        }

        return this.prisma.milestone.update({
          where: { id: milestoneId },
          data:  updateData,
        });
      },
    );
  }
}
