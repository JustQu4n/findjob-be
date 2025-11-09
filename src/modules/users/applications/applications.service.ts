import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Application } from 'src/database/entities/application/application.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { MinioService } from 'src/modules/minio/minio.service';
import { SubmitApplicationDto } from './dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    private minioService: MinioService,
  ) {}

  /**
   * Nộp đơn ứng tuyển
   */
  async submitApplication(
    userId: string,
    dto: SubmitApplicationDto,
    file?: Express.Multer.File,
  ) {
    // Kiểm tra job seeker
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy thông tin người tìm việc');
    }

    // Kiểm tra job post tồn tại
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: dto.job_post_id },
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Kiểm tra đã ứng tuyển chưa
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        job_post_id: dto.job_post_id,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('Bạn đã ứng tuyển vào tin này rồi');
    }

    let resumeUrl: string | undefined = undefined;

    // Upload file nếu có
    if (file) {
      console.log('File received:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'exists' : 'missing',
      });

      // Validate file type
      if (!this.minioService.validateFileType(file)) {
        throw new BadRequestException(
          'File không hợp lệ. Chỉ chấp nhận file PDF, DOC, DOCX',
        );
      }

      console.log('File validation passed, uploading to MinIO...');
      // Upload to MinIO
      resumeUrl = await this.minioService.uploadFile(file, 'resumes');
      console.log('File uploaded successfully, URL:', resumeUrl);
    }

    // Tạo application
    const application = this.applicationRepository.create({
      job_post_id: dto.job_post_id,
      job_seeker_id: jobSeeker.job_seeker_id,
      cover_letter: dto.cover_letter,
      resume_url: resumeUrl,
    });

    await this.applicationRepository.save(application);

    return {
      message: 'Nộp đơn ứng tuyển thành công',
      data: await this.applicationRepository.findOne({
        where: { application_id: application.application_id },
        relations: ['jobPost', 'jobPost.company'],
      }),
    };
  }

  /**
   * Lấy lịch sử ứng tuyển
   */
  async getApplicationHistory(userId: string, jobSeekerId: string) {
    // Kiểm tra quyền truy cập
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy thông tin người tìm việc');
    }

    // Chỉ cho phép xem lịch sử của chính mình
    if (jobSeeker.job_seeker_id !== jobSeekerId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem lịch sử ứng tuyển này',
      );
    }

    const applications = await this.applicationRepository.find({
      where: { job_seeker_id: jobSeekerId },
      relations: [
        'jobPost',
        'jobPost.company',
        'jobPost.employer',
        'jobPost.category',
      ],
      order: { applied_at: 'DESC' },
    });

    // Thêm presigned URL cho resume
    const applicationsWithUrls = await Promise.all(
      applications.map(async (app) => {
        if (app.resume_url) {
          const presignedUrl = await this.minioService.getFileUrl(
            app.resume_url,
          );
          return { ...app, resume_download_url: presignedUrl };
        }
        return app;
      }),
    );

    return {
      data: applicationsWithUrls,
      total: applicationsWithUrls.length,
    };
  }
}
