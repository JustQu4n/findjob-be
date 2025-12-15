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
import { Interview } from 'src/database/entities/interview/interview.entity';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { NotificationType } from '@/common/utils/enums/notification-type.enum';
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
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private cloudinaryService: CloudinaryService,
    private notificationsService: NotificationsService,
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

    // Kiểm tra job post tồn tại (load employer to notify)
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: dto.job_post_id },
      relations: ['employer', 'employer.user'],
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
      if (!this.cloudinaryService.validateFileType(file)) {
        throw new BadRequestException(
          'File không hợp lệ. Chỉ chấp nhận file PDF, DOC, DOCX',
        );
      }

      console.log('File validation passed, uploading to Cloudinary...');
        // Upload to Cloudinary (returns permanent public URL)
        resumeUrl = await this.cloudinaryService.uploadFile(file, 'resumes');
        console.log('File uploaded successfully, stored resume URL:', resumeUrl);
    }

    // Tạo application
    const application = this.applicationRepository.create({
      job_post_id: dto.job_post_id,
      job_seeker_id: jobSeeker.job_seeker_id,
      cover_letter: dto.cover_letter,
      resume_url: resumeUrl,
    });

    await this.applicationRepository.save(application);

    // Notify employer about new application (if employer exists)
    try {
      const employerUserId = jobPost?.employer?.user?.user_id;
      if (employerUserId) {
        await this.notificationsService.sendToUser(employerUserId, {
          type: NotificationType.NEW_APPLICATION,
          message: `Bạn có ứng viên mới cho tin: ${jobPost.title || ''}`,
          metadata: { application_id: application.application_id, job_post_id: jobPost.job_post_id },
        });
      }

      // Confirmation for job seeker
      await this.notificationsService.sendToUser(jobSeeker.user_id, {
        type: NotificationType.APPLICATION_SUBMITTED,
        message: `Bạn đã nộp đơn thành công cho vị trí: ${jobPost.title || ''}`,
        metadata: { application_id: application.application_id, job_post_id: jobPost.job_post_id },
      });
    } catch (err) {
      console.error('Failed to send notifications for application:', err?.message || err);
    }

    // Check if JobPost has an active Interview
    let activeInterview: Interview | null = null;
    if (jobPost.job_post_id) {
      activeInterview = await this.interviewRepository
        .createQueryBuilder('interview')
        .where('interview.job_post_id = :jobPostId', { jobPostId: jobPost.job_post_id })
        .andWhere('interview.status IN (:...statuses)', { statuses: ['active', 'open'] })
        .getOne();
    }

    return {
      message: 'Nộp đơn ứng tuyển thành công',
      data: await this.applicationRepository.findOne({
        where: { application_id: application.application_id },
        relations: ['jobPost', 'jobPost.company'],
      }),
      interview: activeInterview ? {
        interview_id: activeInterview.interview_id,
        title: activeInterview.title,
        description: activeInterview.description,
        total_time_minutes: activeInterview.total_time_minutes,
        has_interview: true,
      } : null,
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

    // Get applications with permanent Cloudinary URLs
    const applicationsWithUrls = await Promise.all(
      applications.map(async (app) => {
        if (app.resume_url) {
          // Cloudinary URLs are permanent, so just ensure they're accessible
          const resumeUrl = await this.cloudinaryService.getFileUrl(
            app.resume_url,
          );
          return { ...app, resume_download_url: resumeUrl };
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
