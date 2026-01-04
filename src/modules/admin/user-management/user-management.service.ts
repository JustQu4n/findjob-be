import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user/user.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { QueryUserDto, UpdateUserStatusDto } from './dto';
import { PaginatedResult } from 'src/common/dto';
import { createPaginatedResult, calculateSkip } from 'src/common/utils/helpers';
import { UserStatus } from 'src/common/utils/enums';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
  ) {}

  /**
   * Lấy danh sách tất cả users với phân trang và filter
   */
  async findAll(query: QueryUserDto): Promise<PaginatedResult<User>> {
    const { search, status, role, page = 1, limit = 10 } = query;
    const skip = calculateSkip(page, limit);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.user_id',
        'user.full_name',
        'user.email',
        'user.phone',
        'user.address',
        'user.avatar_url',
        'user.cover_url',
        'user.status',
        'user.is_email_verified',
        'user.created_at',
        'user.updated_at',
      ])
      .leftJoinAndSelect('user.jobSeeker', 'jobSeeker')
      .leftJoinAndSelect('user.employer', 'employer')
      .leftJoinAndSelect('employer.company', 'company')
      .leftJoinAndSelect('user.roles', 'roles');

    // Search by email or full_name
    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.full_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Filter by role
    if (role) {
      if (role === 'job_seeker') {
        queryBuilder.andWhere('jobSeeker.job_seeker_id IS NOT NULL');
      } else if (role === 'employer') {
        queryBuilder.andWhere('employer.employer_id IS NOT NULL');
      } else if (role === 'admin') {
        queryBuilder.andWhere('roles.name = :roleName', { roleName: 'admin' });
      }
    }

    queryBuilder
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Lấy chi tiết một user
   */
  async findOne(userId: string) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: [
        'jobSeeker',
        'jobSeeker.applications',
        'jobSeeker.applications.jobPost',
        'jobSeeker.followedCompanies',
        'jobSeeker.savedJobs',
        'employer',
        'employer.company',
        'employer.jobPosts',
        'roles',
      ],
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Calculate statistics
    const statistics: any = {
      role: user.jobSeeker ? 'job_seeker' : user.employer ? 'employer' : 'user',
    };

    if (user.jobSeeker) {
      statistics.total_applications = user.jobSeeker.applications?.length || 0;
      statistics.total_followed_companies = user.jobSeeker.followedCompanies?.length || 0;
      statistics.total_saved_jobs = user.jobSeeker.savedJobs?.length || 0;
    }

    if (user.employer) {
      statistics.total_job_posts = user.employer.jobPosts?.length || 0;
      statistics.company_name = user.employer.company?.name || null;
    }

    return {
      data: user,
      statistics,
    };
  }

  /**
   * Cập nhật trạng thái user
   */
  async updateStatus(userId: string, updateStatusDto: UpdateUserStatusDto) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.status = updateStatusDto.status;
    await this.userRepository.save(user);

    return {
      message: 'Cập nhật trạng thái thành công',
      data: {
        user_id: user.user_id,
        email: user.email,
        status: user.status,
      },
    };
  }

  /**
   * Xóa user (soft delete)
   */
  async remove(userId: string) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Soft delete
    await this.userRepository.softDelete(userId);

    return {
      message: 'Xóa người dùng thành công',
    };
  }

  /**
   * Lấy thống kê tổng quan users
   */
  async getStatistics() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });
    const inactiveUsers = await this.userRepository.count({
      where: { status: UserStatus.INACTIVE },
    });
    const bannedUsers = await this.userRepository.count({
      where: { status: UserStatus.BANNED },
    });

    const totalJobSeekers = await this.jobSeekerRepository.count();
    const totalEmployers = await this.employerRepository.count();

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :date', { date: thirtyDaysAgo })
      .getCount();

    return {
      total_users: totalUsers,
      active_users: activeUsers,
      inactive_users: inactiveUsers,
      banned_users: bannedUsers,
      total_job_seekers: totalJobSeekers,
      total_employers: totalEmployers,
      recent_users_30_days: recentUsers,
      user_status_breakdown: {
        active: activeUsers,
        inactive: inactiveUsers,
        banned: bannedUsers,
      },
      user_type_breakdown: {
        job_seekers: totalJobSeekers,
        employers: totalEmployers,
      },
    };
  }
}
