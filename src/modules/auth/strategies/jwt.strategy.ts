import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user/user.entity';
import { UserStatus } from 'src/common/utils/enums';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'careervibe-secret-key-2024',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { sub: userId } = payload;

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    if (!user.is_email_verified) {
      throw new UnauthorizedException('Email chưa được xác thực');
    }

    return user;
  }
}
