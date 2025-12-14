import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Application } from 'src/database/entities/application/application.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { UpdateApplicationStatusDto } from './dto';

@Injectable()
export class ApplicationManagerService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
  ) {}

  async getApplicationsByCompany(userId: string, companyId: string) {
    // Verify employer belongs to this company
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    if (employer.company_id !== companyId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem đơn ứng tuyển của công ty này',
      );
    }

    // Get all applications for job posts of this company
    const applications = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.jobSeeker', 'jobSeeker')
      .leftJoinAndSelect('jobSeeker.user', 'user')
      .leftJoinAndSelect('application.jobPost', 'jobPost')
      .leftJoinAndSelect('jobPost.company', 'company')
      .where('jobPost.company_id = :companyId', { companyId })
      .orderBy('application.applied_at', 'DESC')
      .getMany();

    return {
      data: applications,
      total: applications.length,
    };
  }

  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    // Get application with relations
    const application = await this.applicationRepository.findOne({
      where: { application_id: applicationId },
      relations: ['jobPost', 'jobPost.company'],
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    // Verify employer owns this job post
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    // Check if employer's company matches job post's company
    if (employer.company_id !== application.jobPost.company_id) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật đơn ứng tuyển này',
      );
    }

    // Update status
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
}
