import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { User } from 'src/database/entities/user/user.entity';
import { QueryEmployerDto, UpdateEmployerStatusDto } from './dto';
import { PaginatedResult } from 'src/common/dto';
import { createPaginatedResult, calculateSkip } from 'src/common/utils/helpers';
import { UserStatus } from 'src/common/utils/enums';

@Injectable()
export class EmployerManagementService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Lấy danh sách tất cả employers
   */
  async findAll(query: QueryEmployerDto): Promise<PaginatedResult<Employer>> {
    const { search, status, company_name, page = 1, limit = 10 } = query;
    const skip = calculateSkip(page, limit);

    const queryBuilder = this.employerRepository
      .createQueryBuilder('employer')
      .leftJoinAndSelect('employer.user', 'user')
      .leftJoinAndSelect('employer.company', 'company')
      .leftJoinAndSelect('employer.jobPosts', 'jobPosts');

    // Search by user email or full_name
    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.full_name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by user status
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Filter by company name
    if (company_name) {
      queryBuilder.andWhere('company.name LIKE :company_name', {
        company_name: `%${company_name}%`,
      });
    }

    queryBuilder
      .orderBy('employer.employer_id', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Lấy chi tiết một employer
   */
  async findOne(employerId: number) {
    const employer = await this.employerRepository.findOne({
      where: { employer_id: employerId },
      relations: ['user', 'company', 'jobPosts', 'jobPosts.applications'],
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy nhà tuyển dụng');
    }

    return {
      data: employer,
      statistics: {
        total_job_posts: employer.jobPosts?.length || 0,
        total_applications: employer.jobPosts?.reduce(
          (acc, jp) => acc + (jp.applications?.length || 0),
          0,
        ) || 0,
      },
    };
  }

  /**
   * Cập nhật trạng thái employer (active/inactive)
   */
  async updateStatus(
    employerId: number,
    updateStatusDto: UpdateEmployerStatusDto,
  ) {
    const employer = await this.employerRepository.findOne({
      where: { employer_id: employerId },
      relations: ['user'],
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy nhà tuyển dụng');
    }

    const { status } = updateStatusDto;

    // Update user status
    employer.user.status = status;
    await this.userRepository.save(employer.user);

    return {
      message: `Cập nhật trạng thái thành công`,
      data: {
        employer_id: employer.employer_id,
        user_email: employer.user.email,
        status: employer.user.status,
      },
    };
  }

  /**
   * Xóa employer (soft delete bằng cách set status = INACTIVE)
   */
  async remove(employerId: number) {
    const employer = await this.employerRepository.findOne({
      where: { employer_id: employerId },
      relations: ['user'],
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy nhà tuyển dụng');
    }

    // Set status to INACTIVE instead of hard delete
    employer.user.status = UserStatus.INACTIVE;
    await this.userRepository.save(employer.user);

    return {
      message: 'Xóa nhà tuyển dụng thành công',
    };
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getStatistics() {
    const total = await this.employerRepository.count();

    const active = await this.employerRepository
      .createQueryBuilder('employer')
      .leftJoin('employer.user', 'user')
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .getCount();

    const inactive = total - active;

    // Count employers by verification status
    const verified = await this.employerRepository
      .createQueryBuilder('employer')
      .leftJoin('employer.user', 'user')
      .where('user.is_email_verified = :verified', { verified: true })
      .getCount();

    const unverified = total - verified;

    // Employers with companies
    const withCompany = await this.employerRepository
      .createQueryBuilder('employer')
      .where('employer.company_id IS NOT NULL')
      .getCount();

    const withoutCompany = total - withCompany;

    return {
      total,
      active,
      inactive,
      verified,
      unverified,
      withCompany,
      withoutCompany,
    };
  }
}
