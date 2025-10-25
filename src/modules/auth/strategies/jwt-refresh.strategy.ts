import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'careervibe-refresh-secret-2024',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any): Promise<User> {
    const refreshToken = req.body.refreshToken;
    const user = await this.userRepository.findOne({
      where: { user_id: payload.sub },
      relations: ['roles'],
    });

    if (!user || user.refresh_token !== refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    return user;
  }
}
