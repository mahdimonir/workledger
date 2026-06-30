import { Module }       from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule }  from '@nestjs/schedule';
import { DatabaseModule }  from './core/database/database.module';
import { CacheModule }     from './core/cache/cache.module';
import { StorageModule }   from './core/storage/storage.module';
import appConfig, { validationSchema } from './core/config/app.config';
import { AuthModule } from './features/auth/auth.module';
import { ClientModule } from './features/client/client.module';
import { ProjectModule } from './features/project/project.module';
import { ProposalModule } from './features/proposal/proposal.module';
import { MilestoneModule } from './features/milestone/milestone.module';
import { TaskModule } from './features/task/task.module';
import { InvoiceModule } from './features/invoice/invoice.module';
import { FileModule } from './features/file/file.module';
import { CommentModule } from './features/comment/comment.module';
import { WorkspaceModule } from './features/workspace/workspace.module';
import { NotificationPreferenceModule } from './features/notification/notification-preference.module';
import { DataExportModule } from './features/export/data-export.module';
import { AdminModule } from './features/admin/admin.module';
import { MemberModule } from './features/member/member.module';
import { PlanModule } from './features/plan/plan.module';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal:     true,
      load:         [appConfig],
      validationSchema,
      envFilePath:  '.env',
    }),

    
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    
    ScheduleModule.forRoot(),

    
    DatabaseModule,
    CacheModule,
    StorageModule,

    
    AuthModule,
    ClientModule,
    ProjectModule,
    ProposalModule,
    MilestoneModule,
    TaskModule,
    InvoiceModule,
    FileModule,
    CommentModule,
    WorkspaceModule,
    NotificationPreferenceModule,
    DataExportModule,
    AdminModule,
    MemberModule,
    PlanModule,
  ],
})
export class AppModule {}

