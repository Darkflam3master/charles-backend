import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookies } from './types';

type JwtRefreshPayload = {
  id: string;
  userName: string;
};

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    const refreshSecretToken =
      configService.get<string>('REFRESH_TOKEN_SECRET') || '';

    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req?.cookies as Cookies;

          return cookies?.refresh_token || null;
        },
      ]),
      secretOrKey: refreshSecretToken,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtRefreshPayload) {
    const cookies = req?.cookies as Cookies;

    const refreshToken = cookies?.refresh_token;

    return { ...payload, refreshToken };
  }
}
