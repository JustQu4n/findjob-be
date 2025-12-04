import { Injectable, BadRequestException } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get('MINIO_PORT', '9000')),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'yourminiouser'),
      secretKey: this.configService.get(
        'MINIO_SECRET_KEY',
        'yourminiopassword',
      ),
    });
    this.bucketName = this.configService.get('MINIO_BUCKET_NAME', 'careervibe');
    this.ensureBucketExists();
  }

  /**
   * Đảm bảo bucket tồn tại
   */
  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
    }
  }

  /**
   * Upload file lên MinIO
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'applications',
  ): Promise<string> {
    try {
      if (!file) {
        throw new Error('File is required');
      }

      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      const metaData = {
        'Content-Type': file.mimetype,
      };

      console.log('Uploading file to MinIO:', {
        bucket: this.bucketName,
        fileName,
        size: file.size,
        mimetype: file.mimetype,
      });

      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        metaData,
      );

      console.log('File uploaded successfully:', fileName);
      return fileName;
    } catch (error) {
      console.error('MinIO upload error:', error);
      throw new BadRequestException(
        `Lỗi khi upload file: ${error.message || JSON.stringify(error)}`,
      );
    }
  }

  /**
   * Lấy URL để download file
   */
  async getFileUrl(fileName: string): Promise<string> {
    try {
      // If the stored value is already a full URL, return it directly
      if (!fileName) {
        throw new Error('fileName is required');
      }

      if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
        return fileName;
      }

      // If a public URL is configured, construct a stable public URL instead of a presigned one.
      const publicBase = this.configService.get<string>('MINIO_PUBLIC_URL');
      const includeBucketInPath = this.configService.get<string>('MINIO_PUBLIC_BUCKET_IN_PATH', 'true') === 'true';

      if (publicBase) {
        const cleanedBase = publicBase.replace(/\/$/, '');
        const cleanedFile = fileName.replace(/^\//, '');
        const url = includeBucketInPath
          ? `${cleanedBase}/${this.bucketName}/${cleanedFile}`
          : `${cleanedBase}/${cleanedFile}`;
        return url;
      }

      // Fallback: generate a presigned URL. Expiration is configurable via
      // MINIO_PRESIGNED_EXPIRES (in seconds). Default: 7 days.
      const defaultExpiry = 7 * 24 * 60 * 60; // 7 days in seconds
      const configured = parseInt(this.configService.get<string>('MINIO_PRESIGNED_EXPIRES') || '', 10);
      const expires = Number.isFinite(configured) && configured > 0 ? configured : defaultExpiry;

      return await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        expires,
      );
    } catch (error) {
      throw new BadRequestException(
        `Lỗi khi lấy URL file: ${error.message}`,
      );
    }
  }

  /**
   * Xóa file khỏi MinIO
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      // Normalize input: accept either stored object key (e.g. "avatars/..")
      // or a full public/presigned URL. If given a URL, extract the object
      // key portion so MinIO client can remove the object correctly.
      let objectKey = fileName;

      if (!objectKey) {
        throw new Error('fileName is required');
      }

      if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
        try {
          const parsed = new URL(objectKey);
          // parsed.pathname is like '/bucketName/path/to/object' or '/path/to/object'
          let pathname = parsed.pathname.replace(/^\/+/,'');
          const includeBucketInPath = this.configService.get<string>('MINIO_PUBLIC_BUCKET_IN_PATH', 'true') === 'true';

          if (includeBucketInPath) {
            // If bucket name is present at the start of the public URL path, strip it
            if (pathname.startsWith(`${this.bucketName}/`)) {
              pathname = pathname.substring(this.bucketName.length + 1);
            }
          }

          objectKey = pathname;
        } catch (err) {
          // If URL parsing fails, fallback to original value (may still fail removeObject)
          objectKey = fileName;
        }
      } else {
        // Ensure no leading slash
        objectKey = objectKey.replace(/^\/+/, '');
      }

      await this.minioClient.removeObject(this.bucketName, objectKey);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi xóa file: ${error.message}`);
    }
  }

  /**
   * Kiểm tra file extension hợp lệ
   */
  validateFileType(file: Express.Multer.File): boolean {
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    return (
      allowedExtensions.includes(fileExtension) &&
      allowedMimeTypes.includes(file.mimetype)
    );
  }
}
