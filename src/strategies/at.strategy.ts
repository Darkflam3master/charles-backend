import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Cookies } from './types';

type JwtPayload = {
  id: string;
  userName: string;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    const accessSecretToken =
      configService.get<string>('ACCESS_TOKEN_SECRET') || '';

    super({
      // getting from bearer token and not cookie
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req?.cookies as Cookies;

          return cookies?.access_token || null;
        },
      ]),
      secretOrKey: accessSecretToken,
    });
  }
  validate(payload: JwtPayload) {
    return payload;
  }
}
