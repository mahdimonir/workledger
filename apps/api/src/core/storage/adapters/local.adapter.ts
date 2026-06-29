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

    
    const uploadUrl = `${apiUrl.replace(/\/$/, '')}/api/v1/files/upload-local`;

    
    const fileUrl = `${apiUrl.replace(/\/$/, '')}/public/uploads/${key}`;

    return {
      uploadUrl,
      fileUrl,
      fields: {
        key, 
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
    
    
    fs.mkdirSync(directory, { recursive: true });
    
    
    fs.writeFileSync(filePath, buffer);

    const apiUrl = this.configService.get<string>('apiUrl') || 'http://localhost:8000';
    return `${apiUrl.replace(/\/$/, '')}/public/uploads/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    
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
