import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalAdapter implements StorageService {
  constructor(private readonly configService: ConfigService) {}

  async getUploadUrl(
    key: string,
    mimeType: string,
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    fields?: Record<string, string>;
  }> {
    const apiUrl = this.configService.get<string>('apiUrl') || 'http://localhost:8000';

    // Upload endpoint on this local API server
    const uploadUrl = `${apiUrl.replace(/\/$/, '')}/api/v1/files/upload-local`;

    // Static URL where NestJS serves static files from public/
    const fileUrl = `${apiUrl.replace(/\/$/, '')}/public/uploads/${key}`;

    return {
      uploadUrl,
      fileUrl,
      fields: {
        key, // The key will be sent in the multipart form field 'key'
      },
    };
  }

  async getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string> {
    const apiUrl = this.configService.get<string>('apiUrl') || 'http://localhost:8000';
    return `${apiUrl.replace(/\/$/, '')}/public/uploads/${key}`;
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const filePath = path.join(__dirname, '..', '..', '..', '..', 'public', 'uploads', key);
    const directory = path.dirname(filePath);
    
    // Synchronously create folders if they do not exist
    fs.mkdirSync(directory, { recursive: true });
    
    // Write buffer to local disk
    fs.writeFileSync(filePath, buffer);

    const apiUrl = this.configService.get<string>('apiUrl') || 'http://localhost:8000';
    return `${apiUrl.replace(/\/$/, '')}/public/uploads/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    // Resolve path relative to compiled dist directory: e.g. apps/api/public/uploads
    const filePath = path.join(__dirname, '..', '..', '..', '..', 'public', 'uploads', key);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error(`Failed to delete local file at ${filePath}:`, e);
    }
  }
}
