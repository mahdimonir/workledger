import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async createProject(dto: CreateProjectDto, userId: string) {
    const shareToken = nanoid(21);

    return this.prisma.$transaction(async (tx) => {
      // Create Project
      const project = await tx.project.create({
        data: {
          ...dto,
          shareToken,
          createdBy: userId,
        } as any,
      });

      // Log initial stage history
      await tx.projectStageHistory.create({
        data: {
          projectId: project.id,
          fromStage: null,
          toStage:   project.status,
          changedBy: userId,
          note:      'Project initialized.',
        },
      });

      return project;
    });
  }

  async getProjects(query: ProjectQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    const total = await this.prisma.project.count({ where });
    const projects = await this.prisma.project.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });

    return {
      data: projects,
      pagination: {
        total,
        page,
        limit,
        hasNext: skip + projects.length < total,
      },
    };
  }

  async getProjectById(id: string) {
    const project = await this.prisma.project.findUnique({
      where:   { id },
      include: {
        client:       true,
        stageHistory: { orderBy: { changedAt: 'desc' } },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async updateProject(id: string, dto: UpdateProjectDto, userId: string) {
    const original = await this.getProjectById(id);
    const statusChanged = dto.status && dto.status !== original.status;

    if (statusChanged) {
      return this.prisma.$transaction(async (tx) => {
        const project = await tx.project.update({
          where: { id },
          data:  dto as any,
        });

        // Log transition in history
        await tx.projectStageHistory.create({
          data: {
            projectId: id,
            fromStage: original.status,
            toStage:   project.status,
            changedBy: userId,
            note:      'Status transitioned via API.',
          },
        });

        return project;
      });
    }

    return this.prisma.project.update({
      where: { id },
      data:  dto as any,
    });
  }

  async deleteProject(id: string) {
    await this.getProjectById(id);
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async regenerateShareToken(id: string) {
    await this.getProjectById(id);
    const shareToken = nanoid(21);

    return this.prisma.project.update({
      where: { id },
      data:  { shareToken },
    });
  }

  async getProjectByShareToken(shareToken: string) {
    const project = await this.prisma.project.findUnique({
      where:   { shareToken },
      include: {
        client: {
          select: {
            name:    true,
            company: true,
            address: true,
          },
        },
        milestones: {
          where:   { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project || !project.shareEnabled) {
      throw new NotFoundException('Project share link is invalid or disabled');
    }

    // Expose only public-safe fields to client portal (no internal tasks, creator details)
    return {
      id:          project.id,
      name:        project.name,
      description: project.description,
      status:      project.status,
      startDate:   project.startDate,
      deadline:    project.deadline,
      client:      project.client,
      milestones:  project.milestones,
    };
  }
}
