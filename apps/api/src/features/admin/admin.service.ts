import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Plan, AuditAction } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
        isActive: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            workspace: {
              select: {
                id: true,
                name: true,
                plan: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePlan(
    workspaceId: string,
    adminUserId: string,
    plan: Plan,
    planExpiresAt?: string,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWorkspace = await tx.workspace.update({
        where: { id: workspaceId },
        data: {
          plan,
          planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null,
        },
      });

      
      await tx.auditLog.create({
        data: {
          workspaceId,
          userId: adminUserId,
          action: AuditAction.PLAN_CHANGED,
          entityType: 'Workspace',
          entityId: workspaceId,
          entityLabel: updatedWorkspace.name,
          changes: {
            oldPlan: workspace.plan,
            newPlan: plan,
            oldExpiresAt: workspace.planExpiresAt,
            newExpiresAt: planExpiresAt || null,
          },
        },
      });

      return updatedWorkspace;
    });
  }

  async getMetrics() {
    const PLAN_PRICES = {
      FREE: 0,
      PRO: 29,
      AGENCY: 99,
      ENTERPRISE: 299,
    };

    const [activeWorkspaces, totalActiveUsers, totalInvoices] = await Promise.all([
      this.prisma.workspace.findMany({
        where: { isActive: true, deletedAt: null },
        select: { plan: true },
      }),
      this.prisma.user.count({
        where: { isActive: true },
      }),
      this.prisma.invoice.count({
        where: { deletedAt: null },
      }),
    ]);

    
    const mrr = activeWorkspaces.reduce(
      (sum, ws) => sum + (PLAN_PRICES[ws.plan] || 0),
      0,
    );

    
    const planDistribution = {
      FREE: 0,
      PRO: 0,
      AGENCY: 0,
      ENTERPRISE: 0,
    };
    activeWorkspaces.forEach((ws) => {
      if (ws.plan in planDistribution) {
        planDistribution[ws.plan]++;
      }
    });

    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [newUsersThisPeriod, newUsersLastPeriod] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
    ]);

    const signupGrowth =
      newUsersLastPeriod === 0
        ? newUsersThisPeriod * 100
        : parseFloat(
            (
              ((newUsersThisPeriod - newUsersLastPeriod) / newUsersLastPeriod) *
              100
            ).toFixed(2),
          );

    return {
      mrr,
      totalActiveUsers,
      totalInvoices,
      planDistribution,
      signupGrowth: {
        percentage: signupGrowth,
        newUsersThisPeriod,
        newUsersLastPeriod,
      },
    };
  }
}
