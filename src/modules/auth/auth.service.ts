import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from 'src/database/entities/user/user.entity';
import { Role } from 'src/database/entities/role/role.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { Admin } from 'src/database/entities/admin/admin.entity';
import { Company } from 'src/database/entities/company/company.entity';
import { UserStatus } from 'src/common/utils/enums';

import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, UserRole, RegisterEmployerDto } from './dto';
import { EmailService } from '../email/email.service';
import { RoleName } from 'src/database/entities/role/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(JobSeeker)
    private jobSeekerRepository: Repository<JobSeeker>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, full_name, phone, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate email verification token
    const email_verification_token = uuidv4();
    const email_verification_token_expires = new Date();
    email_verification_token_expires.setHours(email_verification_token_expires.getHours() + 24);

    // Create user
    const user = this.userRepository.create({
      email,
      password_hash,
      full_name,
      phone,
      status: UserStatus.ACTIVE,
      is_email_verified: false,
      email_verification_token,
      email_verification_token_expires,
    });

    // Get role - Map UserRole to RoleName
    const roleMapping: Record<UserRole, RoleName> = {
      [UserRole.ADMIN]: RoleName.ADMIN,
      [UserRole.EMPLOYER]: RoleName.EMPLOYER,
      [UserRole.JOB_SEEKER]: RoleName.JOBSEEKER,
    };

    const userRole = await this.roleRepository.findOne({
      where: { role_name: roleMapping[role] },
    });

    if (!userRole) {
      throw new BadRequestException('Vai trò không hợp lệ');
    }

    user.roles = [userRole];
    const savedUser = await this.userRepository.save(user);

    await this.createRoleSpecificProfile(savedUser, role);


    await this.emailService.sendVerificationEmail(
      email,
      full_name,
      email_verification_token,
    );

    return {
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        user_id: savedUser.user_id,
        email: savedUser.email,
        full_name: savedUser.full_name,
        role: role,
      },
    };
  }

  async registerEmployer(registerEmployerDto: RegisterEmployerDto) {
    const {
      fullname,
      email,
      password,
      company_name,
      company_address,
      company_logo_url,
      company_description,
      company_industry,
      company_website,
    } = registerEmployerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate email verification token
    const email_verification_token = uuidv4();
    const email_verification_token_expires = new Date();
    email_verification_token_expires.setHours(email_verification_token_expires.getHours() + 24);

    // Create company
    const company = this.companyRepository.create({
      name: company_name,
      location: company_address,
      logo_url: company_logo_url,
      description: company_description,
      industry: company_industry,
      website: company_website,
    });
    const savedCompany = await this.companyRepository.save(company);

    const user = this.userRepository.create({
      email,
      password_hash,
      full_name: fullname,
      status: UserStatus.ACTIVE,
      is_email_verified: false,
      email_verification_token,
      email_verification_token_expires,
    });

    // Get employer role
    const employerRole = await this.roleRepository.findOne({
      where: { role_name: RoleName.EMPLOYER },
    });

    if (!employerRole) {
      throw new BadRequestException('Vai trò employer không tồn tại');
    }

    user.roles = [employerRole];
    const savedUser = await this.userRepository.save(user);

    // Create employer profile with company association
    const employer = this.employerRepository.create({
      user_id: savedUser.user_id,
      company_id: savedCompany.company_id,
    });
    await this.employerRepository.save(employer);

    await this.emailService.sendVerificationEmail(
      email,
      company_name,
      email_verification_token,
    );

    return {
      message: 'Đăng ký nhà tuyển dụng thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        user_id: savedUser.user_id,
        email: savedUser.email,
        company_name: company_name,
        role: 'employer',
      },
      company: {
        company_id: savedCompany.company_id,
        name: savedCompany.name,
        location: savedCompany.location,
      },
    };
  }

  private async createRoleSpecificProfile(user: User, role: UserRole) {
    switch (role) {
      case UserRole.JOB_SEEKER:
        const jobSeeker = this.jobSeekerRepository.create({ user });
        await this.jobSeekerRepository.save(jobSeeker);
        break;
      case UserRole.EMPLOYER:
        const employer = this.employerRepository.create({ user });
        await this.employerRepository.save(employer);
        break;
      case UserRole.ADMIN:
        const admin = this.adminRepository.create({ user });
        await this.adminRepository.save(admin);
        break;
    }
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { email_verification_token: token },
      relations: ['roles'],
    });

    if (!user) {
      throw new BadRequestException('Token xác thực không hợp lệ');
    }

    if (user.is_email_verified) {
      throw new BadRequestException('Email đã được xác thực trước đó');
    }

    if (!user.email_verification_token_expires || new Date() > user.email_verification_token_expires) {
      throw new BadRequestException('Token xác thực đã hết hạn');
    }

    user.is_email_verified = true;
    user.email_verification_token = null;
    user.email_verification_token_expires = null;
    await this.userRepository.save(user);

    // Send welcome email
    const roleName = user.roles[0]?.role_name || 'user';
    await this.emailService.sendWelcomeEmail(user.email, user.full_name, roleName);

    return {
      message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay.',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (user.is_email_verified) {
      throw new BadRequestException('Email đã được xác thực');
    }

    // Generate new token
    const email_verification_token = uuidv4();
    const email_verification_token_expires = new Date();
    email_verification_token_expires.setHours(email_verification_token_expires.getHours() + 24);

    user.email_verification_token = email_verification_token;
    user.email_verification_token_expires = email_verification_token_expires;
    await this.userRepository.save(user);

    await this.emailService.sendVerificationEmail(
      email,
      user.full_name,
      email_verification_token,
    );

    return {
      message: 'Email xác thực đã được gửi lại',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.is_email_verified) {
      throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refresh_token = tokens.refreshToken;
    await this.userRepository.save(user);

    return {
      message: 'Đăng nhập thành công',
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        roles: user.roles.map(role => role.role_name),
      },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async refreshToken(user: User) {
    const tokens = await this.generateTokens(user);
    
    user.refresh_token = tokens.refreshToken;
    await this.userRepository.save(user);

    return {
      message: 'Refresh token thành công',
      ...tokens,
    };
  }

  async logout(userId: number) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    
    if (user) {
      user.refresh_token = null;
      await this.userRepository.save(user);
    }

    return {
      message: 'Đăng xuất thành công',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists for security
      return {
        message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi',
      };
    }

    // Generate reset token
    const password_reset_token = uuidv4();
    const password_reset_token_expires = new Date();
    password_reset_token_expires.setHours(password_reset_token_expires.getHours() + 1);

    user.password_reset_token = password_reset_token;
    user.password_reset_token_expires = password_reset_token_expires;
    await this.userRepository.save(user);

    await this.emailService.sendPasswordResetEmail(
      email,
      user.full_name,
      password_reset_token,
    );

    return {
      message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { password_reset_token: token },
    });

    if (!user) {
      throw new BadRequestException('Token đặt lại mật khẩu không hợp lệ');
    }

    if (!user.password_reset_token_expires || new Date() > user.password_reset_token_expires) {
      throw new BadRequestException('Token đặt lại mật khẩu đã hết hạn');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    user.password_hash = password_hash;
    user.password_reset_token = null;
    user.password_reset_token_expires = null;
    user.refresh_token = null; // Invalidate all sessions
    await this.userRepository.save(user);

    return {
      message: 'Đặt lại mật khẩu thành công',
    };
  }

  private async generateTokens(user: User) {
    const payload: any = {
      sub: user.user_id,
      email: user.email,
      roles: user.roles.map(role => role.role_name),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'careervibe-secret-key-2024',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'careervibe-refresh-secret-2024',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
