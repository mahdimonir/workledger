import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage.service';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2Adapter implements StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('r2.accountId');
    const accessKeyId = this.configService.get<string>('r2.accessKeyId');
    const secretAccessKey = this.configService.get<string>('r2.secretAccessKey');
    this.bucketName =
      this.configService.get<string>('r2.bucketName') || 'workledger-files';

    
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async getUploadUrl(
    key: string,
    mimeType: string,
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    fields?: Record<string, string>;
  }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
    });

    
    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

    const publicUrlConfig = this.configService.get<string>('r2.publicUrl');
    const fileUrl = publicUrlConfig
      ? `${publicUrlConfig.replace(/\/$/, '')}/${key}`
      : `https://${this.bucketName}.${this.configService.get<string>('r2.accountId')}.r2.cloudflarestorage.com/${key}`;

    return {
      uploadUrl,
      fileUrl,
    };
  }

  async getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds || 3600,
    });
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);

    const publicUrlConfig = this.configService.get<string>('r2.publicUrl');
    return publicUrlConfig
      ? `${publicUrlConfig.replace(/\/$/, '')}/${key}`
      : `https://${this.bucketName}.${this.configService.get<string>('r2.accountId')}.r2.cloudflarestorage.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
