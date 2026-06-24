import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateTaskCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('Project Tasks')
@Controller('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Create a new task or subtask' })
  @ApiResponse({ status: 201, description: 'Task successfully created.' })
  create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: string) {
    return this.taskService.createTask(dto, userId);
  }

  @Get()
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'List and filter project parent tasks (includes nested subtasks)' })
  getTasks(@Query() query: TaskQueryDto) {
    return this.taskService.getTasks(query);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Get details of a task (includes nested subtasks and comments)' })
  getTaskById(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Update a task details or move status' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(id, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Soft delete a task' })
  remove(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }

  // ── TASK COMMENTS ──

  @Post(':id/comments')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Add a comment to a task' })
  addComment(
    @Param('id') id: string,
    @Body() dto: CreateTaskCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.createTaskComment(id, dto, userId);
  }

  @Get(':id/comments')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Get comment thread for a task' })
  getComments(@Param('id') id: string) {
    return this.taskService.getTaskComments(id);
  }

  @Delete('comments/:commentId')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Delete a task comment' })
  removeComment(@Param('commentId') commentId: string) {
    return this.taskService.deleteTaskComment(commentId);
  }
}
