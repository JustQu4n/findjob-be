import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { User } from 'src/database/entities/user/user.entity';
import { UpdateJobSeekerDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneById(userId: string) {
    const jobSeeker = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!jobSeeker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    return { data: jobSeeker };
  }

  async update(userId: string, dto: UpdateJobSeekerDto) {
    const owner = await this.jobSeekerRepository.findOne({
      where: { user_id: userId },
    });

    if (!owner) {
      throw new NotFoundException('Không tìm thấy hồ sơ người tìm việc');
    }

    Object.assign(owner, dto);

    await this.jobSeekerRepository.save(owner);

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
}
