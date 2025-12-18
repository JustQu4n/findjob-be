import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { JobPost } from '@/database/entities/job-post/job-post.entity';
import { SavedJob } from '@/database/entities/saved-job/saved-job.entity';
import { JobSeeker } from '@/database/entities/job-seeker/job-seeker.entity';
import { PaginationDto } from '@/common/dto';
import { SearchJobPostDto } from './dto';
import { JobStatus } from '@/common/utils/enums';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(SavedJob)
    private savedJobRepository: Repository<SavedJob>,
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
  ) {}

  async findAll(searchDto: SearchJobPostDto) {
    const { 
      keyword, 
      location, 
      job_type,
      category_id,
      level,
      experience,
      salary_range,
      company_id,
      skills,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1, 
      limit = 10 
    } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobPostRepository
      .createQueryBuilder('job_post')
      .leftJoinAndSelect('job_post.company', 'company')
      .leftJoinAndSelect('job_post.category', 'category')
      .leftJoinAndSelect('job_post.employer', 'employer')
      .leftJoinAndSelect('job_post.jobPostSkills', 'jobPostSkills')
      .leftJoinAndSelect('jobPostSkills.skill', 'skill')
      .where('job_post.status = :status', { status: JobStatus.ACTIVE });

    // Search by keyword in title, description, or company name
    if (keyword && keyword.trim()) {
      queryBuilder.andWhere(
        '(LOWER(job_post.title) LIKE LOWER(:keyword) OR LOWER(job_post.description) LIKE LOWER(:keyword) OR LOWER(job_post.requirements) LIKE LOWER(:keyword) OR LOWER(company.name) LIKE LOWER(:keyword))',
        { keyword: `%${keyword}%` },
      );
    }

    // Filter by location
    if (location && location.trim()) {
      queryBuilder.andWhere('LOWER(job_post.location) LIKE LOWER(:location)', {
        location: `%${location}%`,
      });
    }

    // Filter by job type
    if (job_type) {
      queryBuilder.andWhere('job_post.job_type = :job_type', { job_type });
    }

    // Filter by category
    if (category_id) {
      queryBuilder.andWhere('job_post.category_id = :category_id', { category_id });
    }

    // Filter by level
    if (level) {
      queryBuilder.andWhere('job_post.level = :level', { level });
    }

    // Filter by experience
    if (experience) {
      queryBuilder.andWhere('LOWER(job_post.experience) LIKE LOWER(:experience)', {
        experience: `%${experience}%`,
      });
    }

    // Filter by salary range
    if (salary_range) {
      queryBuilder.andWhere('LOWER(job_post.salary_range) LIKE LOWER(:salary_range)', {
        salary_range: `%${salary_range}%`,
      });
    }

    // Filter by company
    if (company_id) {
      queryBuilder.andWhere('job_post.company_id = :company_id', { company_id });
    }

    // Filter by skills
    if (skills && skills.length > 0) {
      queryBuilder.andWhere('skill.name IN (:...skills)', { skills });
    }

    // Sorting
    const validSortColumns = {
      'created_at': 'job_post.created_at',
      'views_count': 'job_post.views_count',
      'saves_count': 'job_post.saves_count',
      'title': 'job_post.title',
      'salary_range': 'job_post.salary_range',
    };

    const sortColumn = validSortColumns[sort_by] || 'job_post.created_at';
    queryBuilder.orderBy(sortColumn, sort_order);

    // Add secondary sort by created_at if primary sort is not created_at
    if (sort_by !== 'created_at') {
      queryBuilder.addOrderBy('job_post.created_at', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getFeatured(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Featured posts: high views + saves, recent posts prioritized
    const [data, total] = await this.jobPostRepository.findAndCount({
      where: { status: JobStatus.ACTIVE },
      relations: ['company', 'category', 'employer'],
      order: { 
        views_count: 'DESC',
        saves_count: 'DESC',
        created_at: 'DESC' 
      },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMostViewed(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.jobPostRepository.findAndCount({
      where: { status: JobStatus.ACTIVE },
      relations: ['company', 'category', 'employer'],
      order: { 
        views_count: 'DESC',
        created_at: 'DESC' 
      },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMostSaved(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.jobPostRepository.findAndCount({
      where: { status: JobStatus.ACTIVE },
      relations: ['company', 'category', 'employer'],
      order: { 
        saves_count: 'DESC',
        created_at: 'DESC' 
      },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(searchDto: SearchJobPostDto) {
    const { 
      keyword, 
      location, 
      job_type,
      category_id,
      level,
      experience,
      salary_range,
      company_id,
      skills,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1, 
      limit = 10 
    } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobPostRepository
      .createQueryBuilder('job_post')
      .leftJoinAndSelect('job_post.company', 'company')
      .leftJoinAndSelect('job_post.category', 'category')
      .leftJoinAndSelect('job_post.employer', 'employer')
      .leftJoinAndSelect('job_post.jobPostSkills', 'jobPostSkills')
      .leftJoinAndSelect('jobPostSkills.skill', 'skill')
      .where('job_post.status = :status', { status: JobStatus.ACTIVE });

    // Search by keyword in title, description, or company name
    if (keyword && keyword.trim()) {
      queryBuilder.andWhere(
        '(LOWER(job_post.title) LIKE LOWER(:keyword) OR LOWER(job_post.description) LIKE LOWER(:keyword) OR LOWER(job_post.requirements) LIKE LOWER(:keyword) OR LOWER(company.name) LIKE LOWER(:keyword))',
        { keyword: `%${keyword}%` },
      );
    }

    // Filter by location
    if (location && location.trim()) {
      queryBuilder.andWhere('LOWER(job_post.location) LIKE LOWER(:location)', {
        location: `%${location}%`,
      });
    }

    // Filter by job type
    if (job_type) {
      queryBuilder.andWhere('job_post.job_type = :job_type', { job_type });
    }

    // Filter by category
    if (category_id) {
      queryBuilder.andWhere('job_post.category_id = :category_id', { category_id });
    }

    // Filter by level
    if (level) {
      queryBuilder.andWhere('job_post.level = :level', { level });
    }

    // Filter by experience
    if (experience) {
      queryBuilder.andWhere('LOWER(job_post.experience) LIKE LOWER(:experience)', {
        experience: `%${experience}%`,
      });
    }

    // Filter by salary range
    if (salary_range) {
      queryBuilder.andWhere('LOWER(job_post.salary_range) LIKE LOWER(:salary_range)', {
        salary_range: `%${salary_range}%`,
      });
    }

    // Filter by company
    if (company_id) {
      queryBuilder.andWhere('job_post.company_id = :company_id', { company_id });
    }

    // Filter by skills
    if (skills && skills.length > 0) {
      queryBuilder.andWhere('skill.name IN (:...skills)', { skills });
    }

    // Sorting
    const validSortColumns = {
      'created_at': 'job_post.created_at',
      'views_count': 'job_post.views_count',
      'saves_count': 'job_post.saves_count',
      'title': 'job_post.title',
      'salary_range': 'job_post.salary_range',
    };

    const sortColumn = validSortColumns[sort_by] || 'job_post.created_at';
    queryBuilder.orderBy(sortColumn, sort_order);

    // Add secondary sort by created_at if primary sort is not created_at
    if (sort_by !== 'created_at') {
      queryBuilder.addOrderBy('job_post.created_at', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filters: {
          keyword,
          location,
          job_type,
          category_id,
          level,
          experience,
          salary_range,
          company_id,
          skills,
          sort_by,
          sort_order,
        },
      },
    };
  }

  async findOne(id: string) {
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: id, status: JobStatus.ACTIVE },
      relations: [
        'company',
        'category',
        'employer',
        'employer.user',
        'jobPostSkills',
        'jobPostSkills.skill',
      ],
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Increment view count
    jobPost.views_count += 1;
    await this.jobPostRepository.save(jobPost);

    // Map skills from jobPostSkills relation to a simple array
    const skills = (jobPost.jobPostSkills || []).map((jps) => {
      return jps?.skill
        ? {
            id: jps.skill.id,
            name: jps.skill.name,
          }
        : null;
    }).filter(Boolean);

    const result = {
      ...jobPost,
      skills,
    };

    return { data: result };
  }

  async saveJob(userId: string, jobPostId: string) {
    // Get job seeker
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    // Check if job post exists
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: jobPostId, status: JobStatus.ACTIVE },
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Check if already saved
    const existingSave = await this.savedJobRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        job_post_id: jobPostId,
      },
    });

    if (existingSave) {
      throw new ConflictException('Bạn đã lưu tin tuyển dụng này rồi');
    }

    // Create saved job
    const savedJob = this.savedJobRepository.create({
      job_seeker_id: jobSeeker.job_seeker_id,
      job_post_id: jobPostId,
    });
    await this.savedJobRepository.save(savedJob);

    // Increment saves count
    jobPost.saves_count += 1;
    await this.jobPostRepository.save(jobPost);

    return {
      message: 'Lưu tin tuyển dụng thành công',
      data: savedJob,
    };
  }

  async unsaveJob(userId: string, jobPostId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const savedJob = await this.savedJobRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        job_post_id: jobPostId,
      },
    });

    if (!savedJob) {
      throw new NotFoundException('Tin tuyển dụng chưa được lưu');
    }

    await this.savedJobRepository.remove(savedJob);

    // Decrement saves count
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: jobPostId },
    });
    if (jobPost && jobPost.saves_count > 0) {
      jobPost.saves_count -= 1;
      await this.jobPostRepository.save(jobPost);
    }

    return { message: 'Bỏ lưu tin tuyển dụng thành công' };
  }

  async getSavedJobs(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const [data, total] = await this.savedJobRepository.findAndCount({
      where: { job_seeker_id: jobSeeker.job_seeker_id },
      relations: ['jobPost', 'jobPost.company', 'jobPost.category'],
      order: { saved_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async checkJobSaved(userId: string, jobPostId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const savedJob = await this.savedJobRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        job_post_id: jobPostId,
      },
    });

    return {
      isSaved: !!savedJob,
      savedAt: savedJob?.saved_at || null,
    };
  }

  /**
   * Find related job posts for a given job post id.
   * Strategy: prefer same category, then same company or location. Exclude the current post.
   */
  async getRelated(jobPostId: string, limit = 5) {
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: jobPostId, status: JobStatus.ACTIVE },
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Try to find posts in same category first
    const qb = this.jobPostRepository.createQueryBuilder('job_post')
      .leftJoinAndSelect('job_post.company', 'company')
      .leftJoinAndSelect('job_post.category', 'category')
      .leftJoinAndSelect('job_post.employer', 'employer')
      .where('job_post.status = :status', { status: JobStatus.ACTIVE })
      .andWhere('job_post.job_post_id != :id', { id: jobPostId })
      .orderBy('job_post.created_at', 'DESC')
      .take(limit);

    if (jobPost.category_id) {
      qb.andWhere('job_post.category_id = :catId', { catId: jobPost.category_id });
      const data = await qb.getMany();
      if (data.length > 0) return { data };
    }

    // Fallback: same company or same location
    const qb2 = this.jobPostRepository.createQueryBuilder('job_post')
      .leftJoinAndSelect('job_post.company', 'company')
      .leftJoinAndSelect('job_post.category', 'category')
      .leftJoinAndSelect('job_post.employer', 'employer')
      .where('job_post.status = :status', { status: JobStatus.ACTIVE })
      .andWhere('job_post.job_post_id != :id', { id: jobPostId })
      .orderBy('job_post.created_at', 'DESC')
      .take(limit)
      .andWhere('(job_post.company_id = :companyId OR LOWER(job_post.location) = LOWER(:location))', {
        companyId: jobPost.company_id,
        location: jobPost.location || '',
      });

    const fallback = await qb2.getMany();
    return { 
      success: true,
      data: fallback 
    };
  }
}
