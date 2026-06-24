import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalQueryDto } from './dto/proposal-query.dto';
import { AcceptProposalDto } from './dto/accept-proposal.dto';
import { ProposalStatus } from '@workledger/shared';
import { nanoid } from 'nanoid';
import { tenantContext } from '../../shared/context/tenant.context';

@Injectable()
export class ProposalService {
  constructor(private prisma: PrismaService) {}

  private calculateTotals(lineItems: any[], discountAmount = 0) {
    let subtotal = 0;
    let taxTotal = 0;

    for (const item of lineItems) {
      const itemSub = item.quantity * item.rate;
      subtotal += itemSub;
      
      const taxRate = item.taxRate ?? 0;
      if (taxRate > 0) {
        taxTotal += itemSub * (taxRate / 100);
      }
    }

    subtotal = Math.round(subtotal * 100) / 100;
    taxTotal = Math.round(taxTotal * 100) / 100;
    const total = Math.max(0, Math.round((subtotal + taxTotal - discountAmount) * 100) / 100);

    return {
      subtotal,
      taxTotal,
      total,
    };
  }

  async createProposal(dto: CreateProposalDto, userId: string) {
    // 1. Recalculate totals on backend to prevent client tampering
    const totals = this.calculateTotals(dto.lineItems, dto.discountAmount ?? 0);
    const viewToken = nanoid(21);

    return this.prisma.$transaction(async (tx) => {
      // 2. Create proposal
      const proposal = await tx.proposal.create({
        data: {
          clientId:       dto.clientId,
          title:          dto.title,
          introduction:   dto.introduction ?? null,
          lineItems:      dto.lineItems as any,
          subtotal:       totals.subtotal,
          taxTotal:       totals.taxTotal,
          discountAmount: dto.discountAmount ?? 0,
          total:          totals.total,
          currency:       dto.currency ?? 'USD',
          validUntil:     dto.validUntil ? new Date(dto.validUntil) : null,
          status:         ProposalStatus.DRAFT,
          viewToken,
          createdBy:      userId,
          version:        1,
        } as any,
      });

      // 3. Log initial version snapshot
      await tx.proposalVersion.create({
        data: {
          proposalId: proposal.id,
          version:    1,
          snapshot:   JSON.parse(JSON.stringify(proposal)),
          savedBy:    userId,
        },
      });

      return proposal;
    });
  }

  async getProposals(query: ProposalQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { introduction: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const total = await this.prisma.proposal.count({ where });
    const proposals = await this.prisma.proposal.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });

    return {
      data: proposals,
      pagination: {
        total,
        page,
        limit,
        hasNext: skip + proposals.length < total,
      },
    };
  }

  async getProposalById(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where:   { id },
      include: {
        client:   true,
        versions: { orderBy: { version: 'desc' } },
      },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    return proposal;
  }

  async updateProposal(id: string, dto: UpdateProposalDto, userId: string) {
    const original = await this.getProposalById(id);

    if (original.status === ProposalStatus.ACCEPTED) {
      throw new BadRequestException('Cannot update a proposal that has already been accepted.');
    }

    const updateData: any = { ...dto };
    delete updateData.createVersion;

    if (dto.validUntil) {
      updateData.validUntil = new Date(dto.validUntil);
    }

    // Recalculate totals if items or discount is updated
    if (dto.lineItems || dto.discountAmount !== undefined) {
      const lineItems = dto.lineItems ?? original.lineItems;
      const discountAmount = dto.discountAmount !== undefined ? dto.discountAmount : Number(original.discountAmount);
      const totals = this.calculateTotals(lineItems as any[], discountAmount);

      updateData.subtotal = totals.subtotal;
      updateData.taxTotal = totals.taxTotal;
      updateData.total = totals.total;
    }

    // Check if we need to create a version snapshot
    const statusChanged = dto.status && dto.status !== original.status;
    const shouldCreateVersion = dto.createVersion === true || statusChanged || original.status === ProposalStatus.DRAFT;

    if (shouldCreateVersion) {
      return this.prisma.$transaction(async (tx) => {
        const nextVersion = original.version + 1;

        const proposal = await tx.proposal.update({
          where: { id },
          data:  {
            ...updateData,
            version: nextVersion,
          },
        });

        // Write snapshot
        await tx.proposalVersion.create({
          data: {
            proposalId: id,
            version:    nextVersion,
            snapshot:   JSON.parse(JSON.stringify(proposal)),
            savedBy:    userId,
          },
        });

        return proposal;
      });
    }

    return this.prisma.proposal.update({
      where: { id },
      data:  updateData,
    });
  }

  async deleteProposal(id: string) {
    await this.getProposalById(id);
    return this.prisma.proposal.delete({
      where: { id },
    });
  }

  async getProposalByViewToken(viewToken: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where:   { viewToken },
      include: {
        client: {
          select: {
            name:    true,
            company: true,
            address: true,
            email:   true,
          },
        },
      },
    });

    if (!proposal || proposal.status === ProposalStatus.DRAFT) {
      throw new NotFoundException('Proposal not found or is in draft status.');
    }

    // If status is SENT, update to VIEWED and capture timestamp
    if (proposal.status === ProposalStatus.SENT) {
      await tenantContext.run(
        {
          workspaceId: proposal.workspaceId,
          userId:      'CLIENT_PORTAL',
          role:        'VIEWER',
          plan:        'FREE',
        },
        async () => {
        await this.prisma.proposal.update({
          where: { id: proposal.id },
          data:  {
            status:   ProposalStatus.VIEWED,
            viewedAt: new Date(),
          },
        });
      });
      proposal.status = ProposalStatus.VIEWED;
    }

    return proposal;
  }

  async acceptProposal(viewToken: string, dto: AcceptProposalDto, ipAddress: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { viewToken },
    });

    if (!proposal || proposal.status === ProposalStatus.DRAFT) {
      throw new NotFoundException('Proposal not found.');
    }

    if (proposal.status === ProposalStatus.ACCEPTED) {
      throw new BadRequestException('Proposal has already been accepted.');
    }

    // Set correct tenant scope for unauthenticated client action
    return tenantContext.run(
      {
        workspaceId: proposal.workspaceId,
        userId:      'CLIENT_PORTAL',
        role:        'VIEWER',
        plan:        'FREE',
      },
      async () => {
        return this.prisma.$transaction(async (tx) => {
          // 1. Update proposal status and acceptance data
          const acceptedProposal = await tx.proposal.update({
            where: { id: proposal.id },
            data:  {
              status:     ProposalStatus.ACCEPTED,
              acceptedBy: dto.acceptedBy,
              acceptedIp: ipAddress,
              acceptedAt: new Date(),
            },
          });

          // 2. Provision new project automatically from proposal
          const shareToken = nanoid(21);
          const project = await tx.project.create({
            data: {
              clientId:       proposal.clientId,
              name:           proposal.title,
              description:    proposal.introduction,
              status:         'LEAD',
              shareToken,
              createdBy:      proposal.createdBy,
            } as any,
          });

          // 3. Log initial stage history for project
          await tx.projectStageHistory.create({
            data: {
              projectId: project.id,
              fromStage: null,
              toStage:   'LEAD',
              changedBy: proposal.createdBy,
              note:      `Project created automatically from accepted proposal: ${proposal.id}`,
            },
          });

          // 4. Link proposal to the created project
          return tx.proposal.update({
            where: { id: proposal.id },
            data:  {
              convertedToProjectId: project.id,
            },
          });
        });
      },
    );
  }

  async rejectProposal(viewToken: string, rejectionNote: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { viewToken },
    });

    if (!proposal || proposal.status === ProposalStatus.DRAFT) {
      throw new NotFoundException('Proposal not found.');
    }

    if (proposal.status === ProposalStatus.ACCEPTED) {
      throw new BadRequestException('Cannot reject a proposal that has already been accepted.');
    }

    return tenantContext.run(
      {
        workspaceId: proposal.workspaceId,
        userId:      'CLIENT_PORTAL',
        role:        'VIEWER',
        plan:        'FREE',
      },
      async () => {
        return this.prisma.proposal.update({
          where: { id: proposal.id },
          data:  {
            status:        ProposalStatus.REJECTED,
            rejectedAt:    new Date(),
            rejectionNote,
          },
        });
      },
    );
  }

  async getVersions(proposalId: string) {
    // Verifies proposal workspace access first
    await this.getProposalById(proposalId);
    return this.prisma.proposalVersion.findMany({
      where:   { proposalId },
      orderBy: { version: 'desc' },
    });
  }

  async restoreVersion(proposalId: string, versionNum: number, userId: string) {
    const original = await this.getProposalById(proposalId);
    if (original.status === ProposalStatus.ACCEPTED) {
      throw new BadRequestException('Cannot modify/restore versions on an accepted proposal.');
    }

    const versionSnapshot = await this.prisma.proposalVersion.findUnique({
      where: {
        proposalId_version: {
          proposalId,
          version: versionNum,
        },
      },
    });

    if (!versionSnapshot) {
      throw new NotFoundException(`Snapshot version ${versionNum} not found for proposal ${proposalId}`);
    }

    const snapshot = versionSnapshot.snapshot as any;

    return this.prisma.$transaction(async (tx) => {
      const nextVersion = original.version + 1;

      // Update proposal with historical values and increment version
      const restored = await tx.proposal.update({
        where: { id: proposalId },
        data:  {
          title:          snapshot.title,
          introduction:   snapshot.introduction,
          lineItems:      snapshot.lineItems,
          subtotal:       snapshot.subtotal,
          taxTotal:       snapshot.taxTotal,
          discountAmount: snapshot.discountAmount,
          total:          snapshot.total,
          currency:       snapshot.currency,
          validUntil:     snapshot.validUntil ? new Date(snapshot.validUntil) : null,
          version:        nextVersion,
        },
      });

      // Log a new version representing the restored snapshot state
      await tx.proposalVersion.create({
        data: {
          proposalId,
          version:    nextVersion,
          snapshot:   JSON.parse(JSON.stringify(restored)),
          savedBy:    userId,
        },
      });

      return restored;
    });
  }
}
