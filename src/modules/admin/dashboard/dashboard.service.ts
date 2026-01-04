import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user/user.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { Company } from 'src/database/entities/company/company.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { Category } from 'src/database/entities/category/category.entity';
import { Notification } from 'src/database/entities/notification/notification.entity';
import { Post } from 'src/database/entities/post/post.entity';
import { DashboardQueryDto } from './dto';
import { UserStatus } from 'src/common/utils/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  /**
   * Lấy tổng quan thống kê toàn hệ thống
   */
  async getOverviewStatistics(query?: DashboardQueryDto) {
    const dateFilter = this.buildDateFilter(query);

    // Users statistics
    const totalUsers = await this.userRepository.count(dateFilter);
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE, ...dateFilter.where },
    });
    const totalJobSeekers = await this.jobSeekerRepository.count(dateFilter);
    const totalEmployers = await this.employerRepository.count(dateFilter);

    // Companies statistics
    const totalCompanies = await this.companyRepository.count(dateFilter);

    // Job Posts statistics
    const totalJobPosts = await this.jobPostRepository.count(dateFilter);
    const activeJobPosts = await this.jobPostRepository.count({
      where: { status: 'ACTIVE' as any, ...dateFilter.where },
    });

    // Applications statistics
    const totalApplications = await this.applicationRepository.count(dateFilter);
    const pendingApplications = await this.applicationRepository.count({
      where: { status: 'PENDING' as any, ...dateFilter.where },
    });
    const acceptedApplications = await this.applicationRepository.count({
      where: { status: 'ACCEPTED' as any, ...dateFilter.where },
    });

    // Categories
    const totalCategories = await this.categoryRepository.count();

    // Social Posts
    const totalPosts = await this.postRepository.count(dateFilter);

    // Notifications
    const totalNotifications = await this.notificationRepository.count(dateFilter);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        job_seekers: totalJobSeekers,
        employers: totalEmployers,
      },
      companies: {
        total: totalCompanies,
      },
      job_posts: {
        total: totalJobPosts,
        active: activeJobPosts,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
      },
      categories: {
        total: totalCategories,
      },
      social: {
        total_posts: totalPosts,
      },
      notifications: {
        total: totalNotifications,
      },
    };
  }

  /**
   * Lấy thống kê theo thời gian (growth rate)
   */
  async getGrowthStatistics() {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    // Users growth
    const usersThisMonth = await this.userRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :date', { date: lastMonth })
      .getCount();

    const usersLastMonth = await this.userRepository
      .createQueryBuilder('user')
      .where(
        'user.created_at >= :startDate AND user.created_at < :endDate',
        {
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1),
          endDate: lastMonth,
        },
      )
      .getCount();

    const userGrowthRate = usersLastMonth > 0
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
      : 0;

    // Job Posts growth
    const jobPostsThisMonth = await this.jobPostRepository
      .createQueryBuilder('job_post')
      .where('job_post.created_at >= :date', { date: lastMonth })
      .getCount();

    const jobPostsLastMonth = await this.jobPostRepository
      .createQueryBuilder('job_post')
      .where(
        'job_post.created_at >= :startDate AND job_post.created_at < :endDate',
        {
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1),
          endDate: lastMonth,
        },
      )
      .getCount();

    const jobPostGrowthRate = jobPostsLastMonth > 0
      ? ((jobPostsThisMonth - jobPostsLastMonth) / jobPostsLastMonth) * 100
      : 0;

    // Applications growth
    const applicationsThisMonth = await this.applicationRepository
      .createQueryBuilder('application')
      .where('application.applied_at >= :date', { date: lastMonth })
      .getCount();

    const applicationsLastMonth = await this.applicationRepository
      .createQueryBuilder('application')
      .where(
        'application.applied_at >= :startDate AND application.applied_at < :endDate',
        {
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1),
          endDate: lastMonth,
        },
      )
      .getCount();

    const applicationGrowthRate = applicationsLastMonth > 0
      ? ((applicationsThisMonth - applicationsLastMonth) / applicationsLastMonth) * 100
      : 0;

    return {
      users: {
        this_month: usersThisMonth,
        last_month: usersLastMonth,
        growth_rate: parseFloat(userGrowthRate.toFixed(2)),
      },
      job_posts: {
        this_month: jobPostsThisMonth,
        last_month: jobPostsLastMonth,
        growth_rate: parseFloat(jobPostGrowthRate.toFixed(2)),
      },
      applications: {
        this_month: applicationsThisMonth,
        last_month: applicationsLastMonth,
        growth_rate: parseFloat(applicationGrowthRate.toFixed(2)),
      },
    };
  }

  /**
   * Lấy top categories theo số lượng job posts
   */
  async getTopCategories(limit = 10) {
    const topCategories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('job_posts', 'jp', 'jp.category_id = category.category_id')
      .select('category.category_id', 'category_id')
      .addSelect('category.name', 'name')
      .addSelect('category.slug', 'slug')
      .addSelect('COUNT(jp.job_post_id)', 'job_posts_count')
      .groupBy('category.category_id')
      .addGroupBy('category.name')
      .addGroupBy('category.slug')
      .orderBy('job_posts_count', 'DESC')
      .limit(limit)
      .getRawMany();

    return topCategories;
  }

  /**
   * Lấy top companies theo followers và job posts
   */
  async getTopCompanies(limit = 10) {
    const topCompaniesByFollowers = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('followed_companies', 'fc', 'fc.company_id = company.company_id')
      .select('company.company_id', 'company_id')
      .addSelect('company.name', 'name')
      .addSelect('company.logo_url', 'logo_url')
      .addSelect('COUNT(fc.followed_company_id)', 'followers_count')
      .groupBy('company.company_id')
      .addGroupBy('company.name')
      .addGroupBy('company.logo_url')
      .orderBy('followers_count', 'DESC')
      .limit(limit)
      .getRawMany();

    const topCompaniesByJobPosts = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('job_posts', 'jp', 'jp.company_id = company.company_id')
      .select('company.company_id', 'company_id')
      .addSelect('company.name', 'name')
      .addSelect('company.logo_url', 'logo_url')
      .addSelect('COUNT(jp.job_post_id)', 'job_posts_count')
      .groupBy('company.company_id')
      .addGroupBy('company.name')
      .addGroupBy('company.logo_url')
      .orderBy('job_posts_count', 'DESC')
      .limit(limit)
      .getRawMany();

    return {
      by_followers: topCompaniesByFollowers,
      by_job_posts: topCompaniesByJobPosts,
    };
  }

  /**
   * Lấy thống kê applications theo status
   */
  async getApplicationStatusBreakdown() {
    const statusBreakdown = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('application.status')
      .getRawMany();

    return statusBreakdown;
  }

  /**
   * Lấy recent activities
   */
  async getRecentActivities(limit = 20) {
    // Recent users
    const recentUsers = await this.userRepository.find({
      order: { created_at: 'DESC' },
      take: 5,
      select: ['user_id', 'full_name', 'email', 'created_at'],
    });

    // Recent job posts
    const recentJobPosts = await this.jobPostRepository.find({
      relations: ['company'],
      order: { created_at: 'DESC' },
      take: 5,
      select: ['job_post_id', 'title', 'created_at'],
    });

    // Recent applications
    const recentApplications = await this.applicationRepository.find({
      relations: ['jobPost', 'jobSeeker', 'jobSeeker.user'],
      order: { applied_at: 'DESC' },
      take: 5,
    });

    // Recent companies
    const recentCompanies = await this.companyRepository.find({
      order: { created_at: 'DESC' },
      take: 5,
      select: ['company_id', 'name', 'industry', 'created_at'],
    });

    return {
      recent_users: recentUsers,
      recent_job_posts: recentJobPosts,
      recent_applications: recentApplications,
      recent_companies: recentCompanies,
    };
  }

  /**
   * Lấy chart data - users registration over time
   */
  async getUsersChartData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const chartData = await this.userRepository
      .createQueryBuilder('user')
      .select("DATE(user.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.created_at >= :startDate', { startDate })
      .groupBy('DATE(user.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return chartData;
  }

  /**
   * Lấy chart data - job posts over time
   */
  async getJobPostsChartData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const chartData = await this.jobPostRepository
      .createQueryBuilder('job_post')
      .select("DATE(job_post.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('job_post.created_at >= :startDate', { startDate })
      .groupBy('DATE(job_post.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return chartData;
  }

  /**
   * Lấy chart data - applications over time
   */
  async getApplicationsChartData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const chartData = await this.applicationRepository
      .createQueryBuilder('application')
      .select("DATE(application.applied_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('application.applied_at >= :startDate', { startDate })
      .groupBy('DATE(application.applied_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return chartData;
  }

  /**
   * Helper: Build date filter
   */
  private buildDateFilter(query?: DashboardQueryDto) {
    if (!query?.start_date && !query?.end_date) {
      return {};
    }

    const where: any = {};

    if (query.start_date && query.end_date) {
      where.created_at = {
        $gte: new Date(query.start_date),
        $lte: new Date(query.end_date),
      };
    } else if (query.start_date) {
      where.created_at = { $gte: new Date(query.start_date) };
    } else if (query.end_date) {
      where.created_at = { $lte: new Date(query.end_date) };
    }

    return { where };
  }
}
