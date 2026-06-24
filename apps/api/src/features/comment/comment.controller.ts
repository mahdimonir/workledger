import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('Project Messaging & Comments')
@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('project/:projectId')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Add a comment or reply to a project message thread' })
  createComment(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.commentService.createComment(userId, workspaceId, projectId, dto);
  }

  @Get('project/:projectId')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Get threaded comments for a project' })
  getProjectComments(
    @Param('projectId') projectId: string,
    @Query() query: CommentQueryDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.commentService.findProjectComments(workspaceId, projectId, query);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Edit an existing comment' })
  updateComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.commentService.updateComment(workspaceId, commentId, userId, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Soft delete a comment' })
  deleteComment(
    @Param('id') commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.commentService.softDelete(workspaceId, commentId, userId, userRole);
  }
}
