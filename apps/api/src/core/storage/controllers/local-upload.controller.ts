import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Public } from '../../../shared/guards/jwt-auth.guard';

@Controller('files')
export class LocalUploadController {
  @Public() // Allow clients to upload without auth for public/deliverable uploads
  @Post('upload-local')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const key = req.body.key;
          if (!key) {
            return cb(new BadRequestException('Missing key in upload request'), '');
          }

          // Resolve path to apps/api/public/uploads
          const baseUploadDir = path.join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'public',
            'uploads',
          );
          const lastSlashIndex = key.lastIndexOf('/');
          const relativeFolder =
            lastSlashIndex !== -1 ? key.substring(0, lastSlashIndex) : '';
          const destinationDir = path.join(baseUploadDir, relativeFolder);

          // Synchronously create folder structure if not exists
          fs.mkdirSync(destinationDir, { recursive: true });
          cb(null, destinationDir);
        },
        filename: (req, file, cb) => {
          const key = req.body.key;
          const lastSlashIndex = key.lastIndexOf('/');
          const filename =
            lastSlashIndex !== -1 ? key.substring(lastSlashIndex + 1) : key;
          cb(null, filename);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: any, @Body('key') key: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      message: 'File uploaded successfully to local storage',
      filename: file.filename,
      key,
    };
  }
}
