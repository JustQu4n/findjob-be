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

import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, UserRole, RegisterEmployerDto, RegisterAdminDto } from './dto';
import { EmailService } from '../email/email.service';
import { MinioService } from '../minio/minio.service';
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
    private minioService: MinioService,
  ) {}

  async register(registerDto: RegisterDto, avatar?: Express.Multer.File) {
    const { email, password, full_name, phone, address, skills, role } = registerDto;

    // Parse skills if it's a string (from multipart/form-data)
    let parsedSkills: string[] | undefined;
    if (skills) {
      if (typeof skills === 'string') {
        try {
          parsedSkills = JSON.parse(skills as string);
        } catch {
          // If not JSON, treat as comma-separated string
          parsedSkills = (skills as string).split(',').map(s => s.trim()).filter(s => s);
        }
      } else {
        parsedSkills = skills as string[];
      }
    }

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

    // Upload avatar if provided
    let avatar_url: string | undefined = undefined;
    if (avatar) {
      // Validate image type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(avatar.mimetype)) {
        throw new BadRequestException(
          'File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF',
        );
      }
      avatar_url = await this.minioService.uploadFile(avatar, 'avatars');
    }

    // Create user
    const user = this.userRepository.create({
      email,
      password_hash,
      full_name,
      phone,
      address,
      avatar_url,
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

    await this.createRoleSpecificProfile(savedUser, role, avatar_url, parsedSkills);


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

  async registerEmployer(registerEmployerDto: RegisterEmployerDto, avatar?: Express.Multer.File) {
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

    // Upload avatar if provided
    let avatar_url: string | undefined = undefined;
    if (avatar) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(avatar.mimetype)) {
        throw new BadRequestException(
          'File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF',
        );
      }
      avatar_url = await this.minioService.uploadFile(avatar, 'avatars');
    }

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
      avatar_url,
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
      avatar_url,
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

  async registerAdmin(registerAdminDto: RegisterAdminDto, avatar?: Express.Multer.File) {
    const {
      full_name,
      email,
      password,
      department,
      position,
    } = registerAdminDto;

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

    // Upload avatar if provided
    let avatar_url: string | undefined = undefined;
    if (avatar) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(avatar.mimetype)) {
        throw new BadRequestException(
          'File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF',
        );
      }
      avatar_url = await this.minioService.uploadFile(avatar, 'avatars');
    }

    // Create user
    const user = this.userRepository.create({
      email,
      password_hash,
      full_name,
      avatar_url,
      status: UserStatus.ACTIVE,
      is_email_verified: false,
      email_verification_token,
      email_verification_token_expires,
    });

    // Get admin role
    const adminRole = await this.roleRepository.findOne({
      where: { role_name: RoleName.ADMIN },
    });

    if (!adminRole) {
      throw new BadRequestException('Vai trò admin không tồn tại');
    }

    user.roles = [adminRole];
    const savedUser = await this.userRepository.save(user);

    // Create admin profile
    const admin = this.adminRepository.create({
      user_id: savedUser.user_id,
      department,
      position,
    });
    await this.adminRepository.save(admin);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      email,
      full_name,
      email_verification_token,
    );

    return {
      message: 'Đăng ký admin thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        user_id: savedUser.user_id,
        email: savedUser.email,
        full_name: savedUser.full_name,
        role: 'admin',
        department,
        position,
      },
    };
  }

  private async createRoleSpecificProfile(user: User, role: UserRole, avatar_url?: string, skills?: string[]) {
    switch (role) {
      case UserRole.JOB_SEEKER:
        const jobSeeker = this.jobSeekerRepository.create({ 
          user,
          avatar_url,
          ...(skills && { skills: skills.join(', ') })
        });
        await this.jobSeekerRepository.save(jobSeeker);
        break;
      case UserRole.EMPLOYER:
        const employer = this.employerRepository.create({ 
          user,
          avatar_url 
        });
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

    // Get avatar URL if exists
    let avatar_url: string | null = null;
    if (user.avatar_url) {
      avatar_url = await this.minioService.getFileUrl(user.avatar_url);
    }

    
    return {
      message: 'Đăng nhập thành công',
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url,
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

  async logout(userId: string) {
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

  async getProfile(user: User) {
    let avatar_url: string | null = null;
    if (user.avatar_url) {
      avatar_url = await this.minioService.getFileUrl(user.avatar_url);
    }

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        avatar_url,
        status: user.status,
        is_email_verified: user.is_email_verified,
        roles: user.roles.map(role => role.role_name),
        created_at: user.created_at,
      },
    };
  }

  async getAvatarUrl(fileName: string) {
    if (!fileName) {
      throw new BadRequestException('File name is required');
    }
    const url = await this.minioService.getFileUrl(fileName);
    return { url };
  }
}
