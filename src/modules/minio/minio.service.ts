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
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        24 * 60 * 60, // URL valid for 24 hours
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
      await this.minioClient.removeObject(this.bucketName, fileName);
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
