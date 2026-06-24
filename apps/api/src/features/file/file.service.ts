import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { GetUploadUrlDto } from './dto/get-upload-url.dto';
import { RegisterFileDto } from './dto/register-file.dto';
import { FileQueryDto } from './dto/file-query.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async requestUpload(
    workspaceId: string,
    dto: GetUploadUrlDto,
  ) {
    const { name, mimeType, projectId, milestoneId } = dto;

    // Check project exists and belongs to the workspace
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, workspaceId, deletedAt: null },
      });
      if (!project) {
        throw new NotFoundException('Project not found in this workspace');
      }
    }

    // Check milestone exists
    if (milestoneId) {
      const milestone = await this.prisma.milestone.findFirst({
        where: { id: milestoneId, workspaceId, deletedAt: null },
      });
      if (!milestone) {
        throw new NotFoundException('Milestone not found in this workspace');
      }
    }

    // Find if there is an existing file with the same name to determine the version
    const existingFile = await this.prisma.file.findFirst({
      where: {
        workspaceId,
        projectId: projectId || null,
        milestoneId: milestoneId || null,
        name,
        deletedAt: null,
        parentId: null, // latest version
      },
    });

    const nextVersion = existingFile ? existingFile.version + 1 : 1;
    
    // Create unique key to avoid overwriting older versions in the storage bucket
    const cleanName = name.replace(/\s+/g, '_');
    const folderPath = `workspaces/${workspaceId}/${projectId ? `projects/${projectId}` : 'shared'}`;
    const storageKey = `${folderPath}/${nextVersion}_${Date.now()}_${cleanName}`;

    const uploadData = await this.storageService.getUploadUrl(storageKey, mimeType);

    return {
      ...uploadData,
      key: storageKey,
      version: nextVersion,
    };
  }

  async registerFile(
    userId: string,
    workspaceId: string,
    dto: RegisterFileDto,
  ) {
    const { name, key, url, mimeType, sizeBytes, projectId, milestoneId, isDeliverable } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Find if there is an existing latest version file with the same name
      const existingLatestFile = await tx.file.findFirst({
        where: {
          workspaceId,
          projectId: projectId || null,
          milestoneId: milestoneId || null,
          name,
          deletedAt: null,
          parentId: null, // latest version
        },
      });

      const nextVersion = existingLatestFile ? existingLatestFile.version + 1 : 1;

      // 1. Create the new file version as the latest version (parentId = null)
      const newFile = await tx.file.create({
        data: {
          workspaceId,
          projectId: projectId || null,
          milestoneId: milestoneId || null,
          name,
          key,
          url,
          mimeType,
          sizeBytes,
          isDeliverable: isDeliverable || false,
          version: nextVersion,
          uploadedBy: userId,
          parentId: null,
        },
      });

      // 2. Point the old version's parentId to the new version to build the history chain
      if (existingLatestFile) {
        await tx.file.update({
          where: { id: existingLatestFile.id },
          data: { parentId: newFile.id },
        });
      }

      return newFile;
    });
  }

  async findProjectFiles(
    workspaceId: string,
    projectId: string,
    query: FileQueryDto,
  ) {
    const { search, milestoneId, isDeliverable, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      workspaceId,
      projectId,
      deletedAt: null,
      parentId: null, // Only fetch the latest version of each file
    };

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    if (milestoneId) {
      whereClause.milestoneId = milestoneId;
    }

    if (isDeliverable !== undefined) {
      whereClause.isDeliverable = isDeliverable;
    }

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.file.count({ where: whereClause }),
    ]);

    return {
      data: files,
      pagination: {
        total,
        page,
        limit,
        hasNext: total > skip + files.length,
      },
    };
  }

  async findFileVersionHistory(
    workspaceId: string,
    fileId: string,
  ) {
    // Find the requested file
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, workspaceId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Traverse upstream or downstream depending on which file ID was queried
    // To keep it simple and performant, we find all files in the same workspace/project with the same name
    const allVersions = await this.prisma.file.findMany({
      where: {
        workspaceId,
        projectId: file.projectId,
        milestoneId: file.milestoneId,
        name: file.name,
        deletedAt: null,
      },
      orderBy: { version: 'desc' },
    });

    return allVersions;
  }

  async toggleDeliverable(
    workspaceId: string,
    fileId: string,
  ) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, workspaceId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.prisma.file.update({
      where: { id: fileId },
      data: { isDeliverable: !file.isDeliverable },
    });
  }

  async softDelete(
    workspaceId: string,
    fileId: string,
    userId: string,
  ) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, workspaceId, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Perform soft delete
    const deletedFile = await this.prisma.file.update({
      where: { id: fileId },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    // Clean up from the physical storage bucket asynchronously (optional, but good practice)
    try {
      await this.storageService.deleteFile(file.key);
    } catch (err) {
      console.error(`Failed to delete file ${file.key} from physical storage provider:`, err);
    }

    return deletedFile;
  }
}
