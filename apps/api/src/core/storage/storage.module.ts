import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { CloudinaryAdapter } from './adapters/cloudinary.adapter';
import { R2Adapter } from './adapters/r2.adapter';
import { LocalAdapter } from './adapters/local.adapter';
import { LocalUploadController } from './controllers/local-upload.controller';

@Global()
@Module({
  controllers: [LocalUploadController],
  providers: [
    {
      provide: StorageService,
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('storageProvider') || 'local';
        if (provider === 'cloudinary') {
          return new CloudinaryAdapter(config);
        }
        if (provider === 'r2') {
          return new R2Adapter(config);
        }
        return new LocalAdapter(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
