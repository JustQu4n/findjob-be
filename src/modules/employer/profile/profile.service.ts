import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Employer } from 'src/database/entities/employer/employer.entity';
import { User } from 'src/database/entities/user/user.entity';
import { UpdateEmployerDto } from './dto';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findOneById(userId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
      relations: ['user', 'company'],
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    return { data: employer };
  }

  async update(userId: string, dto: UpdateEmployerDto) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    Object.assign(employer, dto);

    await this.employerRepository.save(employer);

    return {
      message: 'Cập nhật thông tin nhà tuyển dụng thành công',
      data: await this.findOneById(userId).then(r => r.data),
    };
  }

  async remove(userId: string) {
    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    await this.employerRepository.remove(employer);

    return { message: 'Xóa thông tin nhà tuyển dụng thành công' };
  }

  async updateAvatar(userId: string, avatar: Express.Multer.File) {
    if (!avatar) {
      throw new BadRequestException('Vui lòng chọn file avatar');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(avatar.mimetype)) {
      throw new BadRequestException('File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF');
    }

    const employer = await this.employerRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    // Delete old avatar if exists
    if (employer.avatar_url) {
      try {
        await this.cloudinaryService.deleteFile(employer.avatar_url);
      } catch (error) {
        // ignore deletion errors
      }
    }

    const avatarUrl = await this.cloudinaryService.uploadFile(avatar, 'avatars');

    employer.avatar_url = avatarUrl;
    if (employer.user) {
      employer.user.avatar_url = avatarUrl;
      await this.userRepository.save(employer.user);
    }

    await this.employerRepository.save(employer);

    return {
      message: 'Cập nhật avatar thành công',
      data: { avatar_url: avatarUrl, avatar_download_url: avatarUrl },
    };
  }
}
