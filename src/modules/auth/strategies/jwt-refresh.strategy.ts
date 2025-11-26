import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          if (!req) return null;
          // Prefer body field, fallback to cookie (HttpOnly cookie named 'refreshToken')
          return req.body?.refreshToken || req.cookies?.refreshToken || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'careervibe-refresh-secret-2024',
      passReqToCallback: true,
    });
  }

  // Return the payload plus the extracted refresh token. Actual validation
  // (compare with stored hashed token) will be performed inside AuthService.
  async validate(req: any, payload: any): Promise<any> {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    return { ...payload, refreshToken };
  }
}
