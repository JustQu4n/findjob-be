import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Application } from 'src/database/entities/application/application.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Company } from 'src/database/entities/company/company.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(CandidateInterview)
    private candidateInterviewRepo: Repository<CandidateInterview>,
    private dataSource: DataSource,
  ) {}

  private async lastNDaysLabels(n = 7) {
    const days = [] as string[];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const iso = d.toISOString().slice(0, 10);
      days.push(JSON.stringify({ label, iso }));
    }
    return days.map((s) => JSON.parse(s));
  }

  async getDashboard() {
    // Basic aggregated counts (platform-wide)
    const totalApplications = await this.applicationRepository.count();
    const activeJobs = await this.jobPostRepository.count({ where: { status: 'active' } as any });
    const companies = await this.companyRepository.count();
    const totalCandidates = await this.jobSeekerRepository.count();

    // Stats header (strings formatted similar to frontend sample)
    const stats = [
      {
        title: 'Total Applications',
        value: totalApplications.toLocaleString(),
        change: '+0%',
        trending: 'up',
        color: 'blue',
        bgGradient: 'from-blue-500 to-cyan-500',
      },
      {
        title: 'Active Jobs',
        value: activeJobs.toLocaleString(),
        change: '+0%',
        trending: 'up',
        color: 'purple',
        bgGradient: 'from-purple-500 to-pink-500',
      },
      {
        title: 'Companies',
        value: companies.toLocaleString(),
        change: '+0%',
        trending: 'up',
        color: 'green',
        bgGradient: 'from-green-500 to-emerald-500',
      },
      {
        title: 'Total Candidates',
        value: totalCandidates.toLocaleString(),
        change: '+0%',
        trending: 'up',
        color: 'orange',
        bgGradient: 'from-orange-500 to-red-500',
      },
    ];

    // Applications chart for last 7 days (applications + interviews)
    const labels = await this.lastNDaysLabels(7);
    const applicationsData = [] as any[];
    for (const l of labels) {
      const date = l.iso; // YYYY-MM-DD
      const applications = await this.applicationRepository
        .createQueryBuilder('a')
        .where(`DATE(a.applied_at) = :date`, { date })
        .getCount();

      const interviews = await this.candidateInterviewRepo
        .createQueryBuilder('ci')
        .where(`DATE(ci.created_at) = :date`, { date })
        .getCount();

      applicationsData.push({ name: l.label, applications, interviews });
    }

    // Job status distribution
    const rawStatus = await this.jobPostRepository
      .createQueryBuilder('j')
      .select('j.status', 'name')
      .addSelect('COUNT(*)', 'value')
      .groupBy('j.status')
      .getRawMany();

    // Map default colors for known statuses
    const statusColorMap: Record<string, string> = {
      active: '#10b981',
      pending: '#f59e0b',
      closed: '#6366f1',
      draft: '#8b5cf6',
    };

    const jobStatusData = rawStatus.map((r) => ({ name: r.name, value: parseInt(r.value, 10), color: statusColorMap[r.name] || '#9ca3af' }));

    // Recent activities - gather last 4 mixed events
    const recentApplications = await this.applicationRepository.find({ order: { applied_at: 'DESC' }, take: 4, relations: ['jobPost', 'jobPost.company', 'jobSeeker'] });
    const recentInterviews = await this.candidateInterviewRepo.find({ order: { created_at: 'DESC' }, take: 4, relations: ['candidate', 'application', 'application.jobPost'] });
    const recentJobs = await this.jobPostRepository.find({ order: { created_at: 'DESC' }, take: 4, relations: ['company'] });

    const recentActivities: any[] = [];
    for (const a of recentApplications) {
      recentActivities.push({ id: `app-${a.application_id}`, type: 'application', title: 'New application received', description: `${a.jobSeeker ? a.jobSeeker.user_id : a.job_seeker_id} applied for ${a.jobPost?.title || 'a job'}`, time: a.applied_at, color: 'blue' });
    }
    for (const ci of recentInterviews) {
      recentActivities.push({ id: `int-${ci.candidate_interview_id}`, type: 'interview', title: 'Interview scheduled', description: `${ci.candidate ? ci.candidate.full_name : ci.candidate_id}`, time: ci.created_at, color: 'orange' });
    }
    for (const j of recentJobs) {
      recentActivities.push({ id: `job-${j.job_post_id}`, type: 'job', title: 'Job posted successfully', description: j.title, time: (j as any).created_at || null, color: 'green' });
    }

    // Sort by time desc and take top 4
    recentActivities.sort((x, y) => new Date(y.time).getTime() - new Date(x.time).getTime());
    const recent = recentActivities.slice(0, 4);

    // Top jobs by applications
    const topJobsRaw = await this.jobPostRepository
      .createQueryBuilder('j')
      .leftJoin('j.applications', 'a')
      .select(['j.job_post_id as id', 'j.title as title', 'j.company_id as company_id'])
      .addSelect('COUNT(a.application_id) as applications')
      .groupBy('j.job_post_id, j.title, j.company_id')
      .orderBy('applications', 'DESC')
      .limit(4)
      .getRawMany();

    // Resolve company name for each top job
    const topJobs = [] as any[];
    for (const t of topJobsRaw) {
      const company = await this.companyRepository.findOne({ where: { company_id: t.company_id } });
      topJobs.push({ id: t.id, title: t.title, company: company?.name || null, applications: parseInt(t.applications, 10), status: 'active', trending: 'up' });
    }

    return {
      stats,
      applicationsData,
      jobStatusData,
      recentActivities: recent,
      topJobs,
    };
  }
}
