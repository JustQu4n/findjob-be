import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user/user.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { EmailService } from 'src/modules/email/email.service';
import { SendEmailToUserDto } from './dto/send-email.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employer)
    private readonly employerRepository: Repository<Employer>,
    private readonly emailService: EmailService,
  ) {}

  async sendEmailToUser(
    employerId: string,
    sendEmailDto: SendEmailToUserDto,
  ): Promise<{ message: string }> {
    const { userId, subject, message } = sendEmailDto;

    // Kiểm tra employer tồn tại
    const employer = await this.employerRepository.findOne({
      where: { employer_id: employerId },
      relations: ['user', 'company'],
    });

    if (!employer) {
      throw new NotFoundException('Không tìm thấy thông tin nhà tuyển dụng');
    }

    // Kiểm tra user nhận email tồn tại
    const recipientUser = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!recipientUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra email đã được xác thực
    if (!recipientUser.is_email_verified) {
      throw new BadRequestException('Email của người dùng chưa được xác thực');
    }

    // Lấy thông tin company
    let companyName = 'Công ty';
    if (employer.company) {
      companyName = employer.company.name;
    }

    // Gửi email
    await this.emailService.sendEmployerMessageToUser(
      recipientUser.email,
      recipientUser.full_name,
      employer.user.full_name,
      companyName,
      subject,
      message,
    );

    return {
      message: 'Gửi email thành công',
    };
  }
}
