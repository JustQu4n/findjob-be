import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { Skill } from 'src/database/entities/skill/skill.entity';
import { JobPostSkill } from 'src/database/entities/job-post-skill/job-post-skill.entity';
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
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(JobPostSkill)
    private jobPostSkillRepository: Repository<JobPostSkill>,
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
      industries: createJobPostDto.industries,
      description: createJobPostDto.description,
      requirements: createJobPostDto.requirements,
      location: createJobPostDto.location,
      address: createJobPostDto.address,
      experience: createJobPostDto.experience,
      level: createJobPostDto.level,
      salary_range: createJobPostDto.salary_range,
      gender: createJobPostDto.gender,
      job_type: createJobPostDto.job_type,
      status: createJobPostDto.status,
    });

    jobPost.employer_id = employer.employer_id;
    jobPost.company_id = employer.company_id;

    // Ensure job_post_id is generated on the application side in case the
    // database table lacks a UUID default (e.g., migrations/sync disabled).
    jobPost.job_post_id = uuidv4();

    if (createJobPostDto.expires_at) {
      jobPost.expires_at = new Date(createJobPostDto.expires_at);
    }

    if (createJobPostDto.deadline) {
      jobPost.deadline = new Date(createJobPostDto.deadline);
    }

    const savedJobPost = await this.jobPostRepository.save(jobPost);

    // Xử lý skills
    if (createJobPostDto.skills && createJobPostDto.skills.length > 0) {
      await this.handleJobPostSkills(
        savedJobPost.job_post_id,
        createJobPostDto.skills,
      );
    }

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
    if (updateJobPostDto.title) jobPost.title = updateJobPostDto.title;
    if (updateJobPostDto.industries)
      jobPost.industries = updateJobPostDto.industries;
    if (updateJobPostDto.description)
      jobPost.description = updateJobPostDto.description;
    if (updateJobPostDto.requirements)
      jobPost.requirements = updateJobPostDto.requirements;
    if (updateJobPostDto.location)
      jobPost.location = updateJobPostDto.location;
    if (updateJobPostDto.address) jobPost.address = updateJobPostDto.address;
    if (updateJobPostDto.experience)
      jobPost.experience = updateJobPostDto.experience;
    if (updateJobPostDto.level) jobPost.level = updateJobPostDto.level;
    if (updateJobPostDto.salary_range)
      jobPost.salary_range = updateJobPostDto.salary_range;
    if (updateJobPostDto.gender) jobPost.gender = updateJobPostDto.gender;
    if (updateJobPostDto.job_type) jobPost.job_type = updateJobPostDto.job_type;
    if (updateJobPostDto.status) jobPost.status = updateJobPostDto.status;

    if (updateJobPostDto.deadline) {
      jobPost.deadline = new Date(updateJobPostDto.deadline);
    }

    if (updateJobPostDto.expires_at) {
      jobPost.expires_at = new Date(updateJobPostDto.expires_at);
    }

    await this.jobPostRepository.save(jobPost);

    // Xử lý skills nếu có
    if (updateJobPostDto.skills) {
      await this.handleJobPostSkills(jobPostId, updateJobPostDto.skills);
    }

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
      relations: [
        'company',
        'employer',
        'employer.user',
        'category',
        'jobPostSkills',
        'jobPostSkills.skill',
      ],
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    return jobPost;
  }

  /**
   * Helper: Xử lý skills cho job post
   */
  private async handleJobPostSkills(
    jobPostId: string,
    skillNames: string[],
  ): Promise<void> {
    // Xóa các skills cũ
    await this.jobPostSkillRepository.delete({ job_post_id: jobPostId });

    if (!skillNames || skillNames.length === 0) {
      return;
    }

    // Tìm hoặc tạo skills
    const skills: Skill[] = [];
    for (const skillName of skillNames) {
      let skill = await this.skillRepository.findOne({
        where: { name: skillName.trim() },
      });

      if (!skill) {
        skill = this.skillRepository.create({ name: skillName.trim() });
        skill = await this.skillRepository.save(skill);
      }

      skills.push(skill);
    }

    // Tạo job post skills
    const jobPostSkills = skills.map((skill) =>
      this.jobPostSkillRepository.create({
        job_post_id: jobPostId,
        skill_id: skill.id,
      }),
    );

    await this.jobPostSkillRepository.save(jobPostSkills);
  }
}
