import { Global, Module }    from '@nestjs/common';
import { PrismaService }     from './prisma.service';
import { SnapshotService }   from './snapshot.service';

@Global()   // available everywhere without importing
@Module({
  providers: [PrismaService, SnapshotService],
  exports:   [PrismaService, SnapshotService],
})
export class DatabaseModule {}
