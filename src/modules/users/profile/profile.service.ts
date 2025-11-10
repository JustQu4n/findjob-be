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
import { MinioService } from 'src/modules/minio/minio.service';
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
    private minioService: MinioService,
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
        await this.minioService.deleteFile(jobSeeker.avatar_url);
      } catch (error) {
        console.log('Failed to delete old avatar:', error.message);
      }
    }

    // Upload new avatar
    const avatar_url = await this.minioService.uploadFile(avatar, 'avatars');

    // Update both jobSeeker and user
    jobSeeker.avatar_url = avatar_url;
    jobSeeker.user.avatar_url = avatar_url;

    await this.jobSeekerRepository.save(jobSeeker);
    await this.userRepository.save(jobSeeker.user);

    return {
      message: 'Cập nhật avatar thành công',
      data: {
        avatar_url,
        avatar_download_url: await this.minioService.getFileUrl(avatar_url),
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
}
