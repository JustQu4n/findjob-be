import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { User } from 'src/database/entities/user/user.entity';
import { MinioService } from 'src/modules/minio/minio.service';

@Injectable()
export class JobSeekerService {
  constructor(
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private minioService: MinioService,
  ) {}

  async findProfileByUserId(userId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
      relations: [
        'user',
        'experiences',
        'educations',
        'projects',
        'userSkills',
        'userSkills.skill',
      ],
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    // If avatar is stored as object key, attempt to convert to downloadable URL
    let avatar_url: string | null = null;
    if (jobSeeker.avatar_url) {
      try {
        avatar_url = await this.minioService.getFileUrl(jobSeeker.avatar_url);
      } catch (err) {
        // fallback to stored value
        avatar_url = jobSeeker.avatar_url;
      }
    }

    const experiences = jobSeeker.experiences?.map(exp => ({
      id: exp.id,
      company_name: exp.company_name,
      title: exp.title,
      location: exp.location,
      start_date: exp.start_date,
      end_date: exp.end_date,
      is_current: exp.is_current,
      description: exp.description,
    })) || [];

    const educations = jobSeeker.educations?.map(edu => ({
      id: edu.id,
      school: edu.school,
      degree: edu.degree,
      field: edu.field,
      grade: edu.grade,
      start_date: edu.start_date,
      end_date: edu.end_date,
      is_current: edu.is_current,
      activities: edu.activities,
      description: edu.description,
    })) || [];

    const projects = jobSeeker.projects?.map(proj => ({
      id: proj.id,
      title: proj.title,
      description: proj.description,
      role: proj.role,
      start_date: proj.start_date,
      end_date: proj.end_date,
      is_current: proj.is_current,
      project_url: proj.project_url,
      repo_url: proj.repo_url,
      company_name: proj.company_name,
    })) || [];

    const skills = jobSeeker.userSkills?.map(us => ({
      skill_id: us.skill_id,
      skill_name: us.skill.name,
      endorsement_count: us.endorsement_count,
    })) || [];

    return {
      data: {
        job_seeker_id: jobSeeker.job_seeker_id,
        user_id: jobSeeker.user_id,
        resume_url: jobSeeker.resume_url,
        avatar_url,
        bio: jobSeeker.bio,
        user: jobSeeker.user,
        experiences,
        educations,
        projects,
        skills,
      },
    };
  }
}
