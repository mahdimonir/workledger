import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UpdateWorkspaceSettingsDto } from './dto/update-workspace-settings.dto';
import { AuditAction } from '@prisma/client';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace || !workspace.isActive) {
      throw new NotFoundException('Workspace not found or inactive');
    }
    return workspace;
  }

  async updateSettings(
    workspaceId: string,
    userId: string,
    dto: UpdateWorkspaceSettingsDto,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace || !workspace.isActive) {
      throw new NotFoundException('Workspace not found or inactive');
    }

    return this.prisma.$transaction(async (tx) => {
      
      const updatedWorkspace = await tx.workspace.update({
        where: { id: workspaceId },
        data: {
          name: dto.name !== undefined ? dto.name : undefined,
          brandColor: dto.brandColor !== undefined ? dto.brandColor : undefined,
          invoicePrefix: dto.invoicePrefix !== undefined ? dto.invoicePrefix : undefined,
          invoiceNextNum: dto.invoiceNextNum !== undefined ? dto.invoiceNextNum : undefined,
          defaultCurrency: dto.defaultCurrency !== undefined ? dto.defaultCurrency : undefined,
          defaultTaxRate: dto.defaultTaxRate !== undefined ? dto.defaultTaxRate : undefined,
          taxNumber: dto.taxNumber !== undefined ? dto.taxNumber : undefined,
          businessName: dto.businessName !== undefined ? dto.businessName : undefined,
          businessEmail: dto.businessEmail !== undefined ? dto.businessEmail : undefined,
          address: dto.address !== undefined ? dto.address : undefined,
          timezone: dto.timezone !== undefined ? dto.timezone : undefined,
          paymentTerms: dto.paymentTerms !== undefined ? dto.paymentTerms : undefined,
        },
      });

      
      await tx.auditLog.create({
        data: {
          workspaceId,
          userId,
          action: AuditAction.WORKSPACE_SETTINGS_CHANGED,
          entityType: 'Workspace',
          entityId: workspaceId,
          entityLabel: updatedWorkspace.name,
          changes: dto as any,
        },
      });

      return updatedWorkspace;
    });
  }
}
