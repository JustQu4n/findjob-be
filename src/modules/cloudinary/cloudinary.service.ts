import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary with credentials from environment
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload file to Cloudinary
   * @param file - Express.Multer.File object
   * @param folder - Cloudinary folder name (e.g., 'avatars', 'resumes')
   * @returns Public URL of uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      if (!file) {
        throw new Error('File is required');
      }

      // Convert buffer to base64 data URI for upload
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataURI,
          {
            folder: folder,
            resource_type: 'auto',
            // Generate unique public_id
            public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) return reject(error);
            if (result) return resolve(result);
            reject(new Error('Upload failed'));
          },
        );
      });

      console.log('File uploaded to Cloudinary:', {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
      });

      // Return the secure URL
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException(
        `Lỗi khi upload file: ${error.message || JSON.stringify(error)}`,
      );
    }
  }

  /**
   * Get file URL (for Cloudinary, URLs are permanent, so just return as-is)
   * @param fileUrl - URL or public_id
   * @returns File URL
   */
  async getFileUrl(fileUrl: string): Promise<string> {
    try {
      if (!fileUrl) {
        throw new Error('fileUrl is required');
      }

      // If it's already a full URL, return it
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        return fileUrl;
      }

      // If it's a public_id, construct the URL
      // This is a fallback - normally we store full URLs from Cloudinary
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      return `https://res.cloudinary.com/${cloudName}/image/upload/${fileUrl}`;
    } catch (error) {
      throw new BadRequestException(
        `Lỗi khi lấy URL file: ${error.message}`,
      );
    }
  }

  /**
   * Delete file from Cloudinary
   * @param fileUrl - URL or public_id of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) {
        throw new Error('fileUrl is required');
      }

      // Extract public_id from URL or use as-is if it's already a public_id
      let publicId = fileUrl;

      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        // Extract public_id from Cloudinary URL
        // Example: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/file.jpg
        // public_id would be: folder/file
        const matches = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        if (matches && matches[1]) {
          publicId = matches[1];
        } else {
          console.warn('Could not extract public_id from URL:', fileUrl);
          return;
        }
      }

      await cloudinary.uploader.destroy(publicId);
      console.log('File deleted from Cloudinary:', publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new BadRequestException(`Lỗi khi xóa file: ${error.message}`);
    }
  }

  /**
   * Validate file type for images
   * @param file - Express.Multer.File object
   * @returns true if valid image type
   */
  validateImageType(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedMimeTypes.includes(file.mimetype);
  }

  /**
   * Validate file type for documents (PDFs, Word docs)
   * @param file - Express.Multer.File object
   * @returns true if valid document type
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
