export abstract class StorageService {
  /**
   * Generates an upload URL (signed/pre-signed) for direct client upload
   * @param key Unique file identifier (e.g. workspaces/123/projects/456/logo.png)
   * @param mimeType The file MIME type (e.g. image/png)
   */
  abstract getUploadUrl(
    key: string,
    mimeType: string,
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    fields?: Record<string, string>;
  }>;

  /**
   * Generates a read/download URL (pre-signed or secure CDN link) for the file
   * @param key Unique file identifier
   * @param expiresInSeconds Optional expiry time for signed download links
   */
  abstract getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Uploads a raw file buffer directly to the storage provider
   * @param key Unique file identifier
   * @param buffer Raw file buffer
   * @param mimeType The file MIME type
   * @returns The secure public URL of the uploaded file
   */
  abstract uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string>;

  /**
   * Deletes a file from the storage provider
   * @param key Unique file identifier
   */
  abstract deleteFile(key: string): Promise<void>;
}
