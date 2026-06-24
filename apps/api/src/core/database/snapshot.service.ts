import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { tenantContext } from '../../shared/context/tenant.context';

@Injectable()
export class SnapshotService {
  constructor(private prisma: PrismaService) {}

  async createSnapshot(params: {
    entityType: string;
    entityId:   string;
    operation:  'update' | 'delete';
    data:       Record<string, unknown>;
  }) {
    const ctx = tenantContext.getStore();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days retention

    return this.prisma.entitySnapshot.create({
      data: {
        entityType: params.entityType,
        entityId:   params.entityId,
        operation:  params.operation,
        previousData: params.data as any,
        workspaceId: ctx?.workspaceId || '',
        createdBy:   ctx?.userId || '',
        expiresAt,
      },
    });
  }

  async restore(snapshotId: string) {
    const ctx = tenantContext.getStore();
    const snap = await this.prisma.entitySnapshot.findFirstOrThrow({
      where: {
        id: snapshotId,
        workspaceId: ctx?.workspaceId || '',
        restoredAt: null,
      },
    });

    // Dynamically restore the correct model
    const modelName = snap.entityType.toLowerCase();
    await (this.prisma as any)[modelName].update({
      where: { id: snap.entityId },
      data: {
        ...snap.previousData as any,
        deletedAt: null,
        deletedBy: null,
      },
    });

    // Mark snapshot as consumed — cannot restore twice
    return this.prisma.entitySnapshot.update({
      where: { id: snapshotId },
      data: {
        restoredAt: new Date(),
        restoredBy: ctx?.userId || '',
      },
    });
  }

  async pruneExpiredSnapshots() {
    return this.prisma.entitySnapshot.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}
