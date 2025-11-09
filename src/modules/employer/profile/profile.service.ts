import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Employer } from 'src/database/entities/employer/employer.entity';
import { User } from 'src/database/entities/user/user.entity';
import { UpdateEmployerDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
}
