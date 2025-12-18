import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { User } from 'src/database/entities/user/user.entity';
import { Experience } from 'src/database/entities/experience/experience.entity';
import { Education } from 'src/database/entities/education/education.entity';
import { Project } from 'src/database/entities/project/project.entity';
import { UserSkill } from 'src/database/entities/user-skill/user-skill.entity';
import { Skill } from 'src/database/entities/skill/skill.entity';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { UpdateJobSeekerDto, CreateExperienceDto, UpdateExperienceDto, CreateEducationDto, UpdateEducationDto, CreateProjectDto, UpdateProjectDto, AddSkillDto, UpdateSkillDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
    @InjectRepository(Education)
    private educationRepository: Repository<Education>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findOneById(userId: string) {
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

    // Get avatar URL if exists (Cloudinary URLs are permanent)
    let avatar_url: string | null = null;
    if (jobSeeker.avatar_url) {
      avatar_url = await this.cloudinaryService.getFileUrl(jobSeeker.avatar_url);
    }

    // Format experiences
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

    // Format educations
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

    // Format projects
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

    // Format skills
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
      }
    };
  }

  async update(userId: string, dto: UpdateJobSeekerDto, authenticatedUserId?: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    // Verify ownership if authenticatedUserId is provided
    if (authenticatedUserId && jobSeeker.user_id !== authenticatedUserId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật hồ sơ này');
    }

    // Separate User fields from JobSeeker fields
    const { phone, address, bio } = dto;

    // Update JobSeeker bio
    if (bio !== undefined) {
      jobSeeker.bio = bio;
      await this.jobSeekerRepository.save(jobSeeker);
    }

    // Update User fields (phone, address)
    if (phone !== undefined || address !== undefined) {
      if (phone !== undefined) jobSeeker.user.phone = phone;
      if (address !== undefined) jobSeeker.user.address = address;
      await this.userRepository.save(jobSeeker.user);
    }

    return {
      message: 'Cập nhật hồ sơ thành công',
      data: await this.findOneById(userId).then(r => r.data),
    };
  }

  async remove(userId: string) {
    const owner = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!owner) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    await this.jobSeekerRepository.remove(owner);

    return { message: 'Xóa hồ sơ thành công' };
  }

  async updateAvatar(userId: string, avatar: Express.Multer.File) {
    if (!avatar) {
      throw new BadRequestException('Vui lòng chọn file avatar');
    }

    // Validate image type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(avatar.mimetype)) {
      throw new BadRequestException(
        'File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF',
      );
    }

    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    // Delete old avatar if exists
    if (jobSeeker.avatar_url) {
      try {
        await this.cloudinaryService.deleteFile(jobSeeker.avatar_url);
      } catch (error) {
        console.log('Failed to delete old avatar:', error.message);
      }
    }

    // Upload new avatar to Cloudinary (returns permanent public URL)
    const avatarUrl = await this.cloudinaryService.uploadFile(avatar, 'avatars');

    // Cloudinary URLs are permanent, so we can store them directly in DB
    jobSeeker.avatar_url = avatarUrl;
    jobSeeker.user.avatar_url = avatarUrl;

    await this.jobSeekerRepository.save(jobSeeker);
    await this.userRepository.save(jobSeeker.user);

    return {
      message: 'Cập nhật avatar thành công',
      data: {
        avatar_url: avatarUrl,
        avatar_download_url: avatarUrl,
      },
    };
  }

  async getApplicationsByJobSeekerId(userId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const applications = await this.applicationRepository.find({
      where: { job_seeker_id: jobSeeker.job_seeker_id },
      relations: ['jobPost', 'jobPost.company', 'jobPost.employer'],
      order: { applied_at: 'DESC' },
    });

    return { data: applications };
  }

  // ==================== EXPERIENCE CRUD ====================

  async createExperience(userId: string, dto: CreateExperienceDto) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const experience = this.experienceRepository.create({
      ...dto,
      job_seeker_id: jobSeeker.job_seeker_id,
    });

    await this.experienceRepository.save(experience);

    return {
      message: 'Thêm kinh nghiệm thành công',
      data: experience,
    };
  }

  async getExperiences(userId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const experiences = await this.experienceRepository.find({
      where: { job_seeker_id: jobSeeker.job_seeker_id },
      order: { start_date: 'DESC' },
    });

    return { data: experiences };
  }

  async getExperienceById(userId: string, experienceId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const experience = await this.experienceRepository.findOne({
      where: { 
        id: experienceId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!experience) {
      throw new NotFoundException('Không tìm thấy kinh nghiệm');
    }

    return { data: experience };
  }

  async updateExperience(userId: string, experienceId: string, dto: UpdateExperienceDto) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const experience = await this.experienceRepository.findOne({
      where: { 
        id: experienceId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!experience) {
      throw new NotFoundException('Không tìm thấy kinh nghiệm');
    }

    Object.assign(experience, dto);
    await this.experienceRepository.save(experience);

    return {
      message: 'Cập nhật kinh nghiệm thành công',
      data: experience,
    };
  }

  async deleteExperience(userId: string, experienceId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const experience = await this.experienceRepository.findOne({
      where: { 
        id: experienceId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!experience) {
      throw new NotFoundException('Không tìm thấy kinh nghiệm');
    }

    await this.experienceRepository.remove(experience);

    return { message: 'Xóa kinh nghiệm thành công' };
  }

  // ==================== EDUCATION CRUD ====================

  async createEducation(userId: string, dto: CreateEducationDto) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const education = this.educationRepository.create({
      ...dto,
      job_seeker_id: jobSeeker.job_seeker_id,
    });

    await this.educationRepository.save(education);

    return {
      message: 'Thêm học vấn thành công',
      data: education,
    };
  }

  async getEducations(userId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const educations = await this.educationRepository.find({
      where: { job_seeker_id: jobSeeker.job_seeker_id },
      order: { start_date: 'DESC' },
    });

    return { data: educations };
  }

  async getEducationById(userId: string, educationId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const education = await this.educationRepository.findOne({
      where: { 
        id: educationId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!education) {
      throw new NotFoundException('Không tìm thấy học vấn');
    }

    return { data: education };
  }

  async updateEducation(userId: string, educationId: string, dto: UpdateEducationDto) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const education = await this.educationRepository.findOne({
      where: { 
        id: educationId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!education) {
      throw new NotFoundException('Không tìm thấy học vấn');
    }

    Object.assign(education, dto);
    await this.educationRepository.save(education);

    return {
      message: 'Cập nhật học vấn thành công',
      data: education,
    };
  }

  async deleteEducation(userId: string, educationId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const education = await this.educationRepository.findOne({
      where: { 
        id: educationId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!education) {
      throw new NotFoundException('Không tìm thấy học vấn');
    }

    await this.educationRepository.remove(education);

    return { message: 'Xóa học vấn thành công' };
  }

  // ==================== PROJECT CRUD ====================

  async createProject(userId: string, dto: CreateProjectDto) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const project = this.projectRepository.create({
      ...dto,
      job_seeker_id: jobSeeker.job_seeker_id,
    });

    await this.projectRepository.save(project);

    return {
      message: 'Thêm dự án thành công',
      data: project,
    };
  }

  async getProjects(userId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const projects = await this.projectRepository.find({
      where: { job_seeker_id: jobSeeker.job_seeker_id },
      order: { start_date: 'DESC' },
    });

    return { data: projects };
  }

  async getProjectById(userId: string, projectId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const project = await this.projectRepository.findOne({
      where: { 
        id: projectId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    return { data: project };
  }

  async updateProject(userId: string, projectId: string, dto: UpdateProjectDto) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const project = await this.projectRepository.findOne({
      where: { 
        id: projectId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    Object.assign(project, dto);
    await this.projectRepository.save(project);

    return {
      message: 'Cập nhật dự án thành công',
      data: project,
    };
  }

  async deleteProject(userId: string, projectId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const project = await this.projectRepository.findOne({
      where: { 
        id: projectId,
        job_seeker_id: jobSeeker.job_seeker_id,
      },
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    await this.projectRepository.remove(project);

    return { message: 'Xóa dự án thành công' };
  }

  // ==================== SKILLS CRUD ====================

  async addSkill(userId: string, dto: AddSkillDto) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    // Check if skill exists
    const skill = await this.skillRepository.findOne({
      where: { id: dto.skill_id },
    });

    if (!skill) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    // Check if user already has this skill
    const existingUserSkill = await this.userSkillRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        skill_id: dto.skill_id,
      },
    });

    if (existingUserSkill) {
      throw new BadRequestException('Kỹ năng này đã tồn tại trong hồ sơ');
    }

    const userSkill = this.userSkillRepository.create({
      job_seeker_id: jobSeeker.job_seeker_id,
      skill_id: dto.skill_id,
      endorsement_count: dto.endorsement_count || 0,
    });

    await this.userSkillRepository.save(userSkill);

    // Reload with skill relation
    const savedUserSkill = await this.userSkillRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        skill_id: dto.skill_id,
      },
      relations: ['skill'],
    });

    if (!savedUserSkill) {
      throw new NotFoundException('Không thể tải lại kỹ năng');
    }

    return {
      message: 'Thêm kỹ năng thành công',
      data: {
        skill_id: savedUserSkill.skill_id,
        skill_name: savedUserSkill.skill.name,
        endorsement_count: savedUserSkill.endorsement_count,
      },
    };
  }

  async getSkills(userId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const userSkills = await this.userSkillRepository.find({
      where: { job_seeker_id: jobSeeker.job_seeker_id },
      relations: ['skill'],
      order: { endorsement_count: 'DESC' },
    });

    const skills = userSkills.map(us => ({
      skill_id: us.skill_id,
      skill_name: us.skill.name,
      endorsement_count: us.endorsement_count,
    }));

    return { data: skills };
  }

  async getSkillById(userId: string, skillId: number) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const userSkill = await this.userSkillRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        skill_id: skillId,
      },
      relations: ['skill'],
    });

    if (!userSkill) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    return {
      data: {
        skill_id: userSkill.skill_id,
        skill_name: userSkill.skill.name,
        endorsement_count: userSkill.endorsement_count,
      },
    };
  }

  async updateSkill(userId: string, skillId: number, dto: UpdateSkillDto) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const userSkill = await this.userSkillRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        skill_id: skillId,
      },
      relations: ['skill'],
    });

    if (!userSkill) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    Object.assign(userSkill, dto);
    await this.userSkillRepository.save(userSkill);

    return {
      message: 'Cập nhật kỹ năng thành công',
      data: {
        skill_id: userSkill.skill_id,
        skill_name: userSkill.skill.name,
        endorsement_count: userSkill.endorsement_count,
      },
    };
  }

  async deleteSkill(userId: string, skillId: number) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    const userSkill = await this.userSkillRepository.findOne({
      where: {
        job_seeker_id: jobSeeker.job_seeker_id,
        skill_id: skillId,
      },
    });

    if (!userSkill) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    await this.userSkillRepository.remove(userSkill);

    return { message: 'Xóa kỹ năng thành công' };
  }

  // Get all available skills from master list
  async getAllAvailableSkills() {
    const skills = await this.skillRepository.find({
      order: { name: 'ASC' },
    });

    return { data: skills };
  }
}
