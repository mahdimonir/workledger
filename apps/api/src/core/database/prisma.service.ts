import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantContext } from '../../shared/context/tenant.context';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: any;

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    });

    this.prisma = this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args, query }) => {
            const ctx = tenantContext.getStore();
            const _args = args as any;

            const TENANTED = [
              'Client', 'Project', 'Invoice', 'Payment', 'Expense',
              'Proposal', 'Milestone', 'Task', 'TaskComment', 'File', 'Comment',
              'Notification', 'AuditLog', 'EntitySnapshot',
            ];

            const SOFT_DELETE_MODELS = [
              'Client', 'Project', 'Invoice', 'Proposal', 'Milestone',
              'Task', 'TaskComment', 'File', 'Comment', 'Workspace',
            ];

            
            if (ctx?.workspaceId && TENANTED.includes(model)) {
              if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy', 'update', 'updateMany', 'upsert', 'delete', 'deleteMany'].includes(operation)) {
                _args.where = _args.where || {};
                _args.where.workspaceId = ctx.workspaceId;
              } else if (operation === 'create') {
                _args.data = _args.data || {};
                _args.data.workspaceId = ctx.workspaceId;
              } else if (operation === 'createMany') {
                _args.data = _args.data || {};
                if (Array.isArray(_args.data)) {
                  _args.data = _args.data.map(item => ({
                    ...item,
                    workspaceId: ctx.workspaceId,
                  }));
                } else if (_args.data.data && Array.isArray(_args.data.data)) {
                  _args.data.data = _args.data.data.map(item => ({
                    ...item,
                    workspaceId: ctx.workspaceId,
                  }));
                }
              }
            }

            const MODELS_WITH_DELETED_BY = ['Client', 'Project', 'Invoice', 'File'];

            
            if (SOFT_DELETE_MODELS.includes(model)) {
              if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate'].includes(operation)) {
                _args.where = _args.where || {};
                
                if (_args.where.deletedAt === undefined) {
                  _args.where.deletedAt = null;
                }
              }

              
              if (operation === 'delete') {
                const data: any = { deletedAt: new Date() };
                if (MODELS_WITH_DELETED_BY.includes(model)) {
                  data.deletedBy = ctx?.userId ?? null;
                }
                return (this as any).prisma[model].update({
                  where: _args.where,
                  data,
                });
              }

              if (operation === 'deleteMany') {
                const data: any = { deletedAt: new Date() };
                if (MODELS_WITH_DELETED_BY.includes(model)) {
                  data.deletedBy = ctx?.userId ?? null;
                }
                return (this as any).prisma[model].updateMany({
                  where: _args.where,
                  data,
                });
              }
            }

            return query(_args);
          },
        },
      },
    });

    
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop === 'onModuleInit') return target.onModuleInit.bind(target);
        if (prop === 'onModuleDestroy') return target.onModuleDestroy.bind(target);
        if (prop === 'prisma') return target.prisma;
        return Reflect.get(target.prisma, prop, receiver);
      },
    });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
