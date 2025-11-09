import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { CreateJobPostDto, UpdateJobPostDto, QueryJobPostDto } from './dto';
import { PaginatedResult, PaginationMeta } from 'src/common/dto';
import { createPaginatedResult, calculateSkip } from 'src/common/utils/helpers';

@Injectable()
export class JobPostService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
  ) {}

  /**
   * Tạo job post mới
   */
  async create(userId: string, createJobPostDto: CreateJobPostDto) {
    // Tìm employer từ user_id
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
      relations: ['company'],
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    if (!employer.company_id) {
      throw new BadRequestException(
        'Bạn cần liên kết với công ty trước khi đăng tin tuyển dụng',
      );
    }

    // Tạo job post
    const jobPost = this.jobPostRepository.create({
      title: createJobPostDto.title,
      description: createJobPostDto.description,
      requirements: createJobPostDto.requirements,
      salary_range: createJobPostDto.salary_range,
      location: createJobPostDto.location,
      employment_type: createJobPostDto.employment_type,
      category_id: createJobPostDto.category_id,
    });

    jobPost.employer_id = employer.employer_id;
    jobPost.company_id = employer.company_id;
    
    if (createJobPostDto.deadline) {
      jobPost.deadline = new Date(createJobPostDto.deadline);
    }

    const savedJobPost = await this.jobPostRepository.save(jobPost);

    return {
      message: 'Tạo tin tuyển dụng thành công',
      data: await this.findOneById(savedJobPost.job_post_id),
    };
  }

  /**
   * Lấy toàn bộ job posts của employer với phân trang (không filter)
   */
  async findAll(
    userId: string,
    query: QueryJobPostDto,
  ): Promise<PaginatedResult<JobPost>> {
    
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    const { page = 1, limit = 10 } = query;
    const skip = calculateSkip(page, limit);

    const queryBuilder = this.jobPostRepository
      .createQueryBuilder('job_post')
      .leftJoin('job_post.company', 'company')
      .leftJoin('job_post.employer', 'employer')
      .where('job_post.employer_id = :employerId', {
        employerId: employer.employer_id,
      })
      .orderBy('job_post.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Lấy chi tiết một job post
   */
  async findOne(userId: string, jobPostId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    const jobPost = await this.findOneById(jobPostId);

    // Kiểm tra quyền sở hữu
    if (jobPost.employer_id !== employer.employer_id) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tin tuyển dụng này',
      );
    }

    return {
      data: jobPost,
    };
  }

  /**
   * Cập nhật job post
   */
  async update(
    userId: string,
    jobPostId: string,
    updateJobPostDto: UpdateJobPostDto,
  ) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: jobPostId },
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Kiểm tra quyền sở hữu
    if (jobPost.employer_id !== employer.employer_id) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa tin tuyển dụng này',
      );
    }

    // Update fields
    Object.assign(jobPost, updateJobPostDto);

    if (updateJobPostDto.deadline) {
      jobPost.deadline = new Date(updateJobPostDto.deadline);
    }

    await this.jobPostRepository.save(jobPost);

    return {
      message: 'Cập nhật tin tuyển dụng thành công',
      data: await this.findOneById(jobPostId),
    };
  }

  /**
   * Xóa job post
   */
  async remove(userId: string, jobPostId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: jobPostId },
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Kiểm tra quyền sở hữu
    if (jobPost.employer_id !== employer.employer_id) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa tin tuyển dụng này',
      );
    }

    await this.jobPostRepository.remove(jobPost);

    return {
      message: 'Xóa tin tuyển dụng thành công',
    };
  }

  /**
   * Lấy thống kê job posts của employer
   */
  async getStatistics(userId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    const total = await this.jobPostRepository.count({
      where: { employer_id: employer.employer_id },
    });

    const active = await this.jobPostRepository
      .createQueryBuilder('job_post')
      .where('job_post.employer_id = :employerId', {
        employerId: employer.employer_id,
      })
      .andWhere('(job_post.deadline IS NULL OR job_post.deadline >= :now)', {
        now: new Date(),
      })
      .getCount();

    const expired = total - active;

    // Count by employment type
    const byEmploymentType = await this.jobPostRepository
      .createQueryBuilder('job_post')
      .select('job_post.employment_type', 'employment_type')
      .addSelect('COUNT(*)', 'count')
      .where('job_post.employer_id = :employerId', {
        employerId: employer.employer_id,
      })
      .groupBy('job_post.employment_type')
      .getRawMany();

    return {
      total,
      active,
      expired,
      byEmploymentType: byEmploymentType.reduce((acc, item) => {
        acc[item.employment_type || 'other'] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  /**
   * Debug: Lấy thông tin employer
   */
  async getEmployerInfo(userId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
      relations: ['user', 'company'],
    });

    const allEmployers = await this.employerRepository.find({
      relations: ['user', 'company'],
    });

    return {
      userId,
      employer,
      totalEmployers: allEmployers.length,
      allEmployers: allEmployers.map(e => ({
        employer_id: e.employer_id,
        user_id: e.user_id,
        company_id: e.company_id,
        user_email: e.user?.email,
      })),
    };
  }

  /**
   * Helper: Tìm job post theo ID với relations
   */
  private async findOneById(jobPostId: string): Promise<JobPost> {
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: jobPostId },
      relations: ['company', 'employer', 'employer.user', 'category'],
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    return jobPost;
  }
}
