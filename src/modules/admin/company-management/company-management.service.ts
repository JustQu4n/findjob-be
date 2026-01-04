import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from 'src/database/entities/company/company.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { FollowedCompany } from 'src/database/entities/followed-company/followed-company.entity';
import { QueryCompanyDto, CreateCompanyDto, UpdateCompanyDto } from './dto';
import { PaginatedResult } from 'src/common/dto';
import { createPaginatedResult, calculateSkip } from 'src/common/utils/helpers';

@Injectable()
export class CompanyManagementService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(FollowedCompany)
    private followedCompanyRepository: Repository<FollowedCompany>,
  ) {}

  /**
   * Tạo công ty mới
   */
  async create(createCompanyDto: CreateCompanyDto) {
    // Check if company name already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { name: createCompanyDto.name },
    });

    if (existingCompany) {
      throw new ConflictException('Tên công ty đã tồn tại');
    }

    const company = this.companyRepository.create(createCompanyDto);
    await this.companyRepository.save(company);

    return {
      message: 'Tạo công ty thành công',
      data: company,
    };
  }

  /**
   * Lấy danh sách tất cả công ty
   */
  async findAll(query: QueryCompanyDto): Promise<PaginatedResult<Company>> {
    const { search, industry, location, page = 1, limit = 10 } = query;
    const skip = calculateSkip(page, limit);

    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.employers', 'employers')
      .leftJoinAndSelect('company.jobPosts', 'jobPosts');

    // Search by name
    if (search) {
      queryBuilder.andWhere('company.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Filter by industry
    if (industry) {
      queryBuilder.andWhere('company.industry ILIKE :industry', {
        industry: `%${industry}%`,
      });
    }

    // Filter by location
    if (location) {
      queryBuilder.andWhere('company.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    queryBuilder
      .orderBy('company.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Lấy chi tiết một công ty
   */
  async findOne(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
      relations: ['employers', 'employers.user', 'jobPosts'],
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    // Get statistics
    const totalJobPosts = await this.jobPostRepository.count({
      where: { company_id: companyId },
    });

    const activeJobPosts = await this.jobPostRepository.count({
      where: { company_id: companyId, status: 'ACTIVE' as any },
    });

    const totalFollowers = await this.followedCompanyRepository.count({
      where: { company_id: companyId },
    });

    const totalEmployers = company.employers?.length || 0;

    return {
      data: company,
      statistics: {
        total_job_posts: totalJobPosts,
        active_job_posts: activeJobPosts,
        total_followers: totalFollowers,
        total_employers: totalEmployers,
      },
    };
  }

  /**
   * Cập nhật thông tin công ty
   */
  async update(companyId: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    // Check if new name conflicts
    if (updateCompanyDto.name && updateCompanyDto.name !== company.name) {
      const existingCompany = await this.companyRepository.findOne({
        where: { name: updateCompanyDto.name },
      });

      if (existingCompany) {
        throw new ConflictException('Tên công ty đã tồn tại');
      }
    }

    Object.assign(company, updateCompanyDto);
    await this.companyRepository.save(company);

    return {
      message: 'Cập nhật công ty thành công',
      data: company,
    };
  }

  /**
   * Xóa công ty (soft delete)
   */
  async remove(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
      relations: ['employers', 'jobPosts'],
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    // Check if company has active job posts or employers
    const activeJobPosts = company.jobPosts?.filter(
      (jp) => jp.status === 'ACTIVE' as any,
    ).length || 0;

    if (activeJobPosts > 0) {
      throw new ConflictException(
        'Không thể xóa công ty có tin tuyển dụng đang hoạt động',
      );
    }

    // Soft delete
    await this.companyRepository.softDelete(companyId);

    return {
      message: 'Xóa công ty thành công',
    };
  }

  /**
   * Lấy thống kê công ty
   */
  async getStatistics() {
    const totalCompanies = await this.companyRepository.count();

    // Get companies by industry
    const companiesByIndustry = await this.companyRepository
      .createQueryBuilder('company')
      .select('company.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .where('company.industry IS NOT NULL')
      .groupBy('company.industry')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Get top companies by followers
    const topCompaniesByFollowers = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('followed_companies', 'fc', 'fc.company_id = company.company_id')
      .select('company.company_id', 'company_id')
      .addSelect('company.name', 'name')
      .addSelect('COUNT(fc.followed_company_id)', 'followers')
      .groupBy('company.company_id')
      .addGroupBy('company.name')
      .orderBy('followers', 'DESC')
      .limit(10)
      .getRawMany();

    // Get top companies by job posts
    const topCompaniesByJobPosts = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('job_posts', 'jp', 'jp.company_id = company.company_id')
      .select('company.company_id', 'company_id')
      .addSelect('company.name', 'name')
      .addSelect('COUNT(jp.job_post_id)', 'job_posts')
      .groupBy('company.company_id')
      .addGroupBy('company.name')
      .orderBy('job_posts', 'DESC')
      .limit(10)
      .getRawMany();

    // Recent companies (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompanies = await this.companyRepository
      .createQueryBuilder('company')
      .where('company.created_at >= :date', { date: thirtyDaysAgo })
      .getCount();

    return {
      total_companies: totalCompanies,
      recent_companies_30_days: recentCompanies,
      companies_by_industry: companiesByIndustry,
      top_companies_by_followers: topCompaniesByFollowers,
      top_companies_by_job_posts: topCompaniesByJobPosts,
    };
  }
}
