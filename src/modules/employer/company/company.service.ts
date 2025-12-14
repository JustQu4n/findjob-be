import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from 'src/database/entities/company/company.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { UpdateCompanyDto } from './dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
  ) {}

  async getCompanyJobPosts(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    const jobPosts = await this.jobPostRepository.find({
      where: { company_id: companyId },
      relations: ['company', 'employer', 'employer.user'],
      order: { created_at: 'DESC' },
    });

    return {
      data: jobPosts,
      total: jobPosts.length,
    };
  }

  async updateCompany(userId: string, companyId: string, dto: UpdateCompanyDto) {
    // Verify employer belongs to this company
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    if (employer.company_id !== companyId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật thông tin công ty này',
      );
    }

    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    Object.assign(company, dto);
    await this.companyRepository.save(company);

    return {
      message: 'Cập nhật thông tin công ty thành công',
      data: company,
    };
  }

  async getCompanyByUserId(userId: string) {
    // Find employer by user_id and include company relation
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
      relations: ['company'],
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy nhà tuyển dụng');
    }

    if (!employer.company) {
      throw new NotFoundException('Người dùng chưa liên kết với công ty nào');
    }

    // Return company details
    const company = await this.companyRepository.findOne({
      where: { company_id: employer.company.company_id },
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    return { data: company };
  }
}
