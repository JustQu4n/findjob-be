import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowedCompany } from '@/database/entities/followed-company/followed-company.entity';
import { JobSeeker } from '@/database/entities/job-seeker/job-seeker.entity';
import { Company } from '@/database/entities/company/company.entity';
import { PaginationDto } from '@/common/dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(FollowedCompany)
    private followedCompanyRepository: Repository<FollowedCompany>,
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async getCompanyDetail(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
      relations: ['jobPosts'],
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    // Count active job posts
    const activeJobPosts = company.jobPosts?.filter(
      (job) => job.status === 'active',
    ).length || 0;

    return {
      data: {
        ...company,
        activeJobPostsCount: activeJobPosts,
      },
    };
  }

  async followCompany(userId: string, companyId: string) {
    // Get job seeker
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    // Check if company exists
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    // Check if already followed
    const existingFollow = await this.followedCompanyRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        company_id: companyId,
      },
    });

    if (existingFollow) {
      throw new ConflictException('Bạn đã theo dõi công ty này rồi');
    }

    // Create followed company
    const followedCompany = this.followedCompanyRepository.create({
      job_seeker_id: jobSeeker.job_seeker_id,
      company_id: companyId,
    });
    await this.followedCompanyRepository.save(followedCompany);

    return {
      message: 'Theo dõi công ty thành công',
      data: followedCompany,
    };
  }

  async unfollowCompany(userId: string, companyId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const followedCompany = await this.followedCompanyRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        company_id: companyId,
      },
    });

    if (!followedCompany) {
      throw new NotFoundException('Bạn chưa theo dõi công ty này');
    }

    await this.followedCompanyRepository.remove(followedCompany);

    return { message: 'Bỏ theo dõi công ty thành công' };
  }

  async getFollowedCompanies(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const [data, total] = await this.followedCompanyRepository.findAndCount({
      where: { job_seeker_id: jobSeeker.job_seeker_id },
      relations: ['company'],
      order: { followed_at: 'DESC' },
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

  async checkCompanyFollowed(userId: string, companyId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const followedCompany = await this.followedCompanyRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        company_id: companyId,
      },
    });

    return {
      isFollowed: !!followedCompany,
      followedAt: followedCompany?.followed_at || null,
    };
  }
}
