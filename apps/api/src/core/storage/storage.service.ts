export abstract class StorageService {
  
  abstract getUploadUrl(
    key: string,
    mimeType: string,
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    fields?: Record<string, string>;
  }>;

  
  abstract getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  
  abstract uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string>;

  
  abstract deleteFile(key: string): Promise<void>;
}
