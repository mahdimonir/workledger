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
import { FileService } from './file.service';
import { GetUploadUrlDto } from './dto/get-upload-url.dto';
import { RegisterFileDto } from './dto/register-file.dto';
import { FileQueryDto } from './dto/file-query.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('File Management')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-url')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Get a signed/pre-signed upload URL for a file' })
  getUploadUrl(
    @Body() dto: GetUploadUrlDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.fileService.requestUpload(workspaceId, dto);
  }

  @Post('register')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Register an uploaded file in the database' })
  registerFile(
    @Body() dto: RegisterFileDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.fileService.registerFile(userId, workspaceId, dto);
  }

  @Get('project/:projectId')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'List latest files for a project' })
  getProjectFiles(
    @Param('projectId') projectId: string,
    @Query() query: FileQueryDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.fileService.findProjectFiles(workspaceId, projectId, query);
  }

  @Get(':id/versions')
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Get the complete version history of a file' })
  getFileVersions(
    @Param('id') fileId: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.fileService.findFileVersionHistory(workspaceId, fileId);
  }

  @Patch(':id/deliverable')
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Toggle deliverable flag on a file' })
  toggleDeliverable(
    @Param('id') fileId: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.fileService.toggleDeliverable(workspaceId, fileId);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Soft delete a file' })
  deleteFile(
    @Param('id') fileId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.fileService.softDelete(workspaceId, fileId, userId);
  }
}
