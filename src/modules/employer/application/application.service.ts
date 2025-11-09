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

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
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

    return {
      message: 'Cập nhật trạng thái đơn ứng tuyển thành công',
      data: await this.applicationRepository.findOne({
        where: { application_id: applicationId },
        relations: ['jobSeeker', 'jobSeeker.user', 'jobPost'],
      }),
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
}
