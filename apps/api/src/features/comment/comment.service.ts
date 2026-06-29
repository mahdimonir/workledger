import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    userId: string,
    workspaceId: string,
    projectId: string,
    dto: CreateCommentDto,
  ) {
    const { content, parentId, isInternal, attachments } = dto;

    
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspaceId, deletedAt: null },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    
    if (parentId) {
      const parentComment = await this.prisma.comment.findFirst({
        where: { id: parentId, projectId, workspaceId, deletedAt: null },
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found in this project');
      }
    }

    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.comment.create({
      data: {
        workspaceId,
        projectId,
        parentId: parentId || null,
        content,
        authorId: userId,
        authorName: user.name,
        authorType: 'freelancer', 
        isInternal: isInternal || false,
        attachments: attachments || null,
      },
    });
  }

  async findProjectComments(
    workspaceId: string,
    projectId: string,
    query: CommentQueryDto,
  ) {
    
    
    const comments = await this.prisma.comment.findMany({
      where: {
        workspaceId,
        projectId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    for (const comment of comments) {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }

    for (const comment of comments) {
      const mapped = commentMap.get(comment.id);
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(mapped);
        } else {
          
          rootComments.push(mapped);
        }
      } else {
        rootComments.push(mapped);
      }
    }

    
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const paginatedRootComments = rootComments.slice(skip, skip + limit);

    return {
      data: paginatedRootComments,
      pagination: {
        total: rootComments.length,
        page,
        limit,
        hasNext: rootComments.length > skip + paginatedRootComments.length,
      },
    };
  }

  async updateComment(
    workspaceId: string,
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, workspaceId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: dto.content !== undefined ? dto.content : comment.content,
        isInternal: dto.isInternal !== undefined ? dto.isInternal : comment.isInternal,
        editedAt: new Date(),
      },
    });
  }

  async softDelete(
    workspaceId: string,
    commentId: string,
    userId: string,
    userRole: string,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, workspaceId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    
    const isAuthor = comment.authorId === userId;
    const isPrivileged = userRole === 'OWNER' || userRole === 'MANAGER';
    
    if (!isAuthor && !isPrivileged) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
