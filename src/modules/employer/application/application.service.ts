import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Application } from 'src/database/entities/application/application.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import {
  QueryApplicationsDto,
  UpdateApplicationStatusDto,
  BatchUpdateApplicationsDto,
} from './dto';
import { createPaginatedResult, calculateSkip } from 'src/common/utils/helpers';
import { ApplicationStatus } from 'src/common/utils/enums';
import { EmailService } from 'src/modules/email/email.service';
import { MinioService } from 'src/modules/minio/minio.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    private emailService: EmailService,
    private minioService: MinioService,
  ) {}


  /**
   * Lấy tất cả applications của employer với filter
   */
  async findAll(userId: string, query: QueryApplicationsDto) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    const { job_post_id, status, page = 1, limit = 10 } = query;
    const skip = calculateSkip(page, limit);

    // Build query
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.jobSeeker', 'jobSeeker')
      .leftJoinAndSelect('jobSeeker.user', 'user')
      .leftJoinAndSelect('application.jobPost', 'jobPost')
      .leftJoinAndSelect('jobPost.company', 'company')
      .leftJoin('jobPost.employer', 'employer')
      .where('employer.employer_id = :employerId', {
        employerId: employer.employer_id,
      });

    // Apply filters
    if (job_post_id) {
      queryBuilder.andWhere('application.job_post_id = :jobPostId', {
        jobPostId: job_post_id,
      });
    }

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    queryBuilder
      .orderBy('application.applied_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  private getApplicationStatusEmailTemplate(application: Application): string {
    const user = application.jobSeeker?.user;
    const company = application.jobPost?.company;
    const position = application.jobPost?.title || '';
    const status = application.status as ApplicationStatus;
    const frontend = process.env.FRONTEND_URL || '';
    const viewUrl = frontend ? `${frontend}/applications/${application.application_id}` : '';

    // Compose a warm, professional message body (human-like tone)
    let intro = '';
    if (status === ApplicationStatus.ACCEPTED) {
      intro = `🎉 Xin chúc mừng! Chúng tôi rất vui thông báo rằng hồ sơ của bạn đã được lựa chọn cho bước tiếp theo trong quy trình tuyển dụng tại ${company?.name || 'công ty'}. Đội ngũ tuyển dụng sẽ sớm liên hệ để xếp lịch phỏng vấn và hướng dẫn chi tiết.`;
    } else if (status === ApplicationStatus.REJECTED) {
      intro = `🙏 Cảm ơn bạn đã dành thời gian ứng tuyển cho vị trí ${position} tại ${company?.name || 'công ty'}. Sau khi xem xét kỹ lưỡng, lần này chúng tôi chưa thể tiếp nhận bạn. Chúng tôi đánh giá cao hồ sơ và những nỗ lực của bạn — nếu bạn muốn, bạn có thể phản hồi email này để xin nhận xét chi tiết.`;
    } else if (status === ApplicationStatus.REVIEWED) {
      intro = `🔎 Hồ sơ của bạn đã được bộ phận tuyển dụng xem xét. Chúng tôi vẫn đang tiếp tục tiến hành sàng lọc và sẽ quay lại với bạn khi có kết quả.`;
    } else if (status === ApplicationStatus.PENDING) {
      intro = `📩 Chúng tôi đã nhận được hồ sơ của bạn cho vị trí ${position}. Cảm ơn bạn đã quan tâm — chúng tôi sẽ sớm xem xét và cập nhật cho bạn.`;
    } else {
      intro = `📣 Trạng thái ứng tuyển của bạn đã được cập nhật: ${String(status)}.`;
    }

    // Longer, human-like paragraph to reassure and provide next steps
    const bodyParagraph = `
      ${intro}

      Trong quá trình này, nếu bạn có thắc mắc hoặc cần cập nhật thêm thông tin, vui lòng phản hồi lại email này. Chúng tôi luôn trân trọng sự chủ động và sẵn sàng hỗ trợ bạn.

      Mỗi lần tuyển dụng có nhiều yếu tố khác nhau — kinh nghiệm, kỹ năng chuyên môn, và sự phù hợp với văn hoá công ty. Nếu lần này không thành công, đừng nản lòng: chúng tôi khuyến khích bạn tiếp tục nộp hồ sơ cho các vị trí phù hợp trong tương lai.
    `;

    // Friendly signature
    const signature = `Trân trọng,\\nĐội ngũ Tuyển dụng ${company?.name || 'CareerVibe'}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f3f4f6; color:#0f172a; }
          .container { max-width:720px; margin:28px auto; }
          .card { background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 8px 30px rgba(2,6,23,0.08); }
          .hero { background:linear-gradient(90deg,#0b5cff,#06b6d4); padding:20px 24px; color:#fff; display:flex; gap:12px; align-items:center }
          .hero .icon { font-size:28px }
          .hero h1 { margin:0; font-size:20px; font-weight:600 }
          .content { padding:22px; color:#111827; line-height:1.6 }
          .cta { display:inline-block; margin-top:18px; padding:10px 16px; background:#0b5cff; color:#fff; text-decoration:none; border-radius:8px }
          .muted { color:#6b7280; font-size:13px }
          .footer { padding:16px 22px; text-align:center; font-size:12px; color:#9ca3af }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="hero">
              <div class="icon">📣</div>
              <div>
                <h1>Cập nhật ứng tuyển — ${position}</h1>
                <div class="muted">${company?.name || ''}</div>
              </div>
            </div>
            <div class="content">
              <p style="margin-top:0">Xin chào ${user?.full_name || 'bạn'},</p>
              <p style="white-space:pre-line">${bodyParagraph}</p>

              ${viewUrl ? `<p style="text-align:center"><a href="${viewUrl}" class="cta">Xem chi tiết trạng thái</a></p>` : ''}

              <p style="margin-top:18px; white-space:pre-line">${signature}</p>
            </div>
            <div class="footer">📅 ${new Date().toLocaleDateString('vi-VN')} • Đây là email tự động — vui lòng không trả lời trực tiếp</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Lấy chi tiết một application
   */
  async findOne(userId: string, applicationId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    const application = await this.applicationRepository.findOne({
      where: { application_id: applicationId },
      relations: [
        'jobSeeker',
        'jobSeeker.user',
        'jobPost',
        'jobPost.company',
        'jobPost.employer',
      ],
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    // Verify ownership
    if (application.jobPost.employer_id !== employer.employer_id) {
      throw new ForbiddenException(
        'Bạn không có quyền xem đơn ứng tuyển này',
      );
    }

    return { data: application };
  }

  /**
   * Cập nhật trạng thái application
   */
  async updateStatus(
    userId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    const application = await this.applicationRepository.findOne({
      where: { application_id: applicationId },
      relations: ['jobPost'],
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    // Verify ownership
    if (application.jobPost.employer_id !== employer.employer_id) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật đơn ứng tuyển này',
      );
    }

    application.status = dto.status;
    await this.applicationRepository.save(application);

    // Load full application with relations to include in email
    const fullApp = await this.applicationRepository.findOne({
      where: { application_id: applicationId },
      relations: ['jobSeeker', 'jobSeeker.user', 'jobPost', 'jobPost.company', 'jobPost.employer'],
    });

    // Send notification email to job seeker (best-effort)
    try {
      if (fullApp && fullApp.jobSeeker && fullApp.jobSeeker.user && fullApp.jobSeeker.user.email) {
        const to = fullApp.jobSeeker.user.email;
        const subject = `Cập nhật trạng thái ứng tuyển: ${fullApp.jobPost?.title || ''}`;
        const html = this.getApplicationStatusEmailTemplate(fullApp);
        await this.emailService.sendApplicationStatusEmail(to, subject, html);
      }
    } catch (err) {
      // Don't block the request if email fails; log for debugging
      console.error('Failed to send application status email', err);
    }

    return {
      message: 'Cập nhật trạng thái đơn ứng tuyển thành công',
      data: fullApp,
    };
  }

  /**
   * Cập nhật hàng loạt applications
   */
  async batchUpdate(userId: string, dto: BatchUpdateApplicationsDto) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    // Get all applications
    const applications = await this.applicationRepository.find({
      where: { application_id: In(dto.application_ids) },
      relations: ['jobPost'],
    });

    if (applications.length === 0) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển nào');
    }

    // Verify all applications belong to employer
    const invalidApplications = applications.filter(
      (app) => app.jobPost.employer_id !== employer.employer_id,
    );

    if (invalidApplications.length > 0) {
      throw new ForbiddenException(
        'Một số đơn ứng tuyển không thuộc quyền quản lý của bạn',
      );
    }

    // Update status for all
    applications.forEach((app) => {
      app.status = dto.status;
    });

    await this.applicationRepository.save(applications);

    return {
      message: `Cập nhật trạng thái thành công cho ${applications.length} đơn ứng tuyển`,
      data: {
        updated_count: applications.length,
        status: dto.status,
      },
    };
  }

  /**
   * Lấy thống kê applications cho một job post
   */
  async getStatistics(userId: string, jobPostId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    // Verify job post ownership
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: jobPostId },
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    if (jobPost.employer_id !== employer.employer_id) {
      throw new ForbiddenException(
        'Bạn không có quyền xem thống kê tin tuyển dụng này',
      );
    }

    // Get total applications
    const total = await this.applicationRepository.count({
      where: { job_post_id: jobPostId },
    });

    // Get count by status
    const byStatus = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('application.job_post_id = :jobPostId', { jobPostId })
      .groupBy('application.status')
      .getRawMany();

    // Get recent applications
    const recentApplications = await this.applicationRepository.find({
      where: { job_post_id: jobPostId },
      relations: ['jobSeeker', 'jobSeeker.user'],
      order: { applied_at: 'DESC' },
      take: 5,
    });

    return {
      data: {
        total,
        by_status: byStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        recent_applications: recentApplications,
      },
    };
  }

  /**
   * Lấy danh sách tất cả ứng viên ứng tuyển cho một job post (có phân trang và filter)
   */
  async findByJobPost(
    userId: string,
    jobPostId: string,
    query: QueryApplicationsDto,
  ) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    // Verify job post ownership
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: jobPostId },
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    if (jobPost.employer_id !== employer.employer_id) {
      throw new ForbiddenException(
        'Bạn không có quyền xem ứng viên của tin tuyển dụng này',
      );
    }

    const { status, page = 1, limit = 10 } = query;
    const skip = calculateSkip(page, limit);

    const where: any = { job_post_id: jobPostId };
    if (status) where.status = status;

    const [data, total] = await this.applicationRepository.findAndCount({
      where,
      relations: ['jobSeeker', 'jobSeeker.user'],
      order: { applied_at: 'DESC' },
      skip,
      take: limit,
    });

    return createPaginatedResult(data, total, page, limit);
  }
}
