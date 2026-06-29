import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateTaskCommentDto } from './dto/create-comment.dto';
import { TaskStatus, Priority } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(dto: CreateTaskDto, userId: string) {
    
    if (dto.parentId) {
      const parent = await this.prisma.task.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent task with ID ${dto.parentId} not found`);
      }
    }

    return this.prisma.task.create({
      data: {
        projectId:   dto.projectId,
        parentId:    dto.parentId ?? null,
        title:       dto.title,
        description: dto.description ?? null,
        status:      dto.status ?? TaskStatus.TODO,
        priority:    dto.priority ?? Priority.MEDIUM,
        assigneeId:  dto.assigneeId ?? null,
        dueDate:     dto.dueDate ? new Date(dto.dueDate) : null,
        isInternal:  dto.isInternal ?? true,
        createdBy:   userId,
      } as any,
    });
  }

  async getTasks(query: TaskQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      projectId: query.projectId,
      parentId:  null, 
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.assigneeId) {
      where.assigneeId = query.assigneeId;
    }

    if (query.isInternal !== undefined) {
      where.isInternal = query.isInternal;
    }

    const total = await this.prisma.task.count({ where });
    const tasks = await this.prisma.task.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { order: 'asc' },
      include: {
        subtasks: {
          where:   { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        hasNext: skip + tasks.length < total,
      },
    };
  }

  async getTaskById(id: string) {
    const task = await this.prisma.task.findUnique({
      where:   { id },
      include: {
        subtasks: {
          where:   { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        comments: {
          where:   { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto) {
    await this.getTaskById(id);

    const updateData: any = { ...dto };
    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }

    
    if (dto.status === TaskStatus.DONE) {
      updateData.completedAt = new Date();
    } else if (dto.status) {
      updateData.completedAt = null;
    }

    return this.prisma.task.update({
      where: { id },
      data:  updateData,
    });
  }

  async deleteTask(id: string) {
    await this.getTaskById(id);
    return this.prisma.task.delete({
      where: { id },
    });
  }

  

  async createTaskComment(taskId: string, dto: CreateTaskCommentDto, userId: string) {
    await this.getTaskById(taskId);

    return this.prisma.taskComment.create({
      data: {
        taskId,
        content:  dto.content,
        authorId: userId,
      } as any,
    });
  }

  async getTaskComments(taskId: string) {
    await this.getTaskById(taskId);

    return this.prisma.taskComment.findMany({
      where:   { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteTaskComment(commentId: string) {
    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return this.prisma.taskComment.delete({
      where: { id: commentId },
    });
  }
}
