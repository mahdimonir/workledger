import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryAdapter implements StorageService {
  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }
  }

  async getUploadUrl(
    key: string,
    mimeType: string,
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    fields?: Record<string, string>;
  }> {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');
    const uploadPreset = this.configService.get<string>('cloudinary.uploadPreset');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary is not fully configured. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();

    // Estimate Cloudinary resource type
    const isImage = mimeType.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    // Extract folder and publicId from the storage key
    const lastSlashIndex = key.lastIndexOf('/');
    const folder = lastSlashIndex !== -1 ? key.substring(0, lastSlashIndex) : '';
    let publicId = lastSlashIndex !== -1 ? key.substring(lastSlashIndex + 1) : key;
    if (isImage && publicId.includes('.')) {
      publicId = publicId.substring(0, publicId.lastIndexOf('.'));
    }

    const paramsToSign: Record<string, any> = {
      timestamp,
      public_id: publicId,
    };
    if (folder) {
      paramsToSign['folder'] = folder;
    }
    if (uploadPreset) {
      paramsToSign['upload_preset'] = uploadPreset;
    }

    // Generate SHA-1 API request signature
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const ext = key.includes('.') ? key.substring(key.lastIndexOf('.')) : '';
    const fileUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${folder ? folder + '/' : ''}${publicId}${ext}`;

    return {
      uploadUrl,
      fileUrl,
      fields: {
        api_key: apiKey,
        timestamp,
        public_id: publicId,
        signature,
        ...(folder ? { folder } : {}),
        ...(uploadPreset ? { upload_preset: uploadPreset } : {}),
      },
    };
  }

  async getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string> {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');

    const lastSlashIndex = key.lastIndexOf('/');
    const folder = lastSlashIndex !== -1 ? key.substring(0, lastSlashIndex) : '';
    let publicId = lastSlashIndex !== -1 ? key.substring(lastSlashIndex + 1) : key;
    const isImage = key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    if (isImage && publicId.includes('.')) {
      publicId = publicId.substring(0, publicId.lastIndexOf('.'));
    }
    const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

    if (expiresInSeconds && this.configService.get<string>('cloudinary.apiSecret')) {
      return cloudinary.url(fullPublicId, {
        sign_url: true,
        secure: true,
        expires_at: Math.round(new Date().getTime() / 1000) + expiresInSeconds,
      });
    }

    const resourceType = isImage ? 'image' : 'raw';
    const ext = key.includes('.') ? key.substring(key.lastIndexOf('.')) : '';
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${fullPublicId}${ext}`;
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const isImage = mimeType.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    const lastSlashIndex = key.lastIndexOf('/');
    const folder = lastSlashIndex !== -1 ? key.substring(0, lastSlashIndex) : '';
    let publicId = lastSlashIndex !== -1 ? key.substring(lastSlashIndex + 1) : key;
    if (isImage && publicId.includes('.')) {
      publicId = publicId.substring(0, publicId.lastIndexOf('.'));
    }

    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: folder || undefined,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!.secure_url);
          }
        },
      );
      uploadStream.end(buffer);
    });
  }

  async deleteFile(key: string): Promise<void> {
    const isImage = key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    const resourceType = isImage ? 'image' : 'raw';

    const lastSlashIndex = key.lastIndexOf('/');
    const folder = lastSlashIndex !== -1 ? key.substring(0, lastSlashIndex) : '';
    let publicId = lastSlashIndex !== -1 ? key.substring(lastSlashIndex + 1) : key;
    if (isImage && publicId.includes('.')) {
      publicId = publicId.substring(0, publicId.lastIndexOf('.'));
    }
    const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(
        fullPublicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });
  }
}
