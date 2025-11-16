import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { JobPost } from '@/database/entities/job-post/job-post.entity';
import { PaginationDto } from '@/common/dto';
import { SearchJobPostDto } from './dto';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.jobPostRepository.findAndCount({
      where: { status: 'active' },
      relations: ['company', 'category', 'employer'],
      order: { created_at: 'DESC' },
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
    const { keyword, location, page = 1, limit = 10 } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobPostRepository
      .createQueryBuilder('job_post')
      .leftJoinAndSelect('job_post.company', 'company')
      .leftJoinAndSelect('job_post.category', 'category')
      .leftJoinAndSelect('job_post.employer', 'employer')
      .where('job_post.status = :status', { status: 'active' });

    // Search by keyword in title or description
    if (keyword && keyword.trim()) {
      queryBuilder.andWhere(
        '(LOWER(job_post.title) LIKE LOWER(:keyword) OR LOWER(job_post.description) LIKE LOWER(:keyword) OR LOWER(job_post.requirements) LIKE LOWER(:keyword))',
        { keyword: `%${keyword}%` },
      );
    }

    // Search by location
    if (location && location.trim()) {
      queryBuilder.andWhere('LOWER(job_post.location) LIKE LOWER(:location)', {
        location: `%${location}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('job_post.created_at', 'DESC')
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
        keyword,
        location,
      },
    };
  }

  async findOne(id: string) {
    const jobPost = await this.jobPostRepository.findOne({
      where: { job_post_id: id, status: 'active' },
      relations: ['company', 'category', 'employer', 'employer.user'],
    });

    if (!jobPost) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Increment view count
    jobPost.views_count += 1;
    await this.jobPostRepository.save(jobPost);

    return { data: jobPost };
  }
}
