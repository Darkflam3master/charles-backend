import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import * as zxcvbn from 'zxcvbn';
import { TokenContent } from './types';

@Injectable()
export class AuthUtils {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private accessTokenSecret: string,
    private refreshTokenSecret: string,
  ) {
    this.accessTokenSecret =
      this.config.get<string>('ACCESS_TOKEN_SECRET') || '';
    this.refreshTokenSecret =
      this.config.get<string>('REFRESH_TOKEN_SECRET') || '';
  }

  static validatePassword(password: string) {
    const result = zxcvbn(password);
    if (result.score < 3) {
      throw new BadRequestException(
        'Password is too weak: ' + result.feedback.suggestions.join(' '),
      );
    }
  }

  async getTokens(
    userId: string,
    userName: string,
    email: string,
    twoFactorEnabled: boolean,
    lastLogIn: string,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, userName, email, twoFactorEnabled, lastLogIn },
        { secret: this.accessTokenSecret, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { id: userId, userName, email, twoFactorEnabled, lastLogIn },
        { secret: this.refreshTokenSecret, expiresIn: '7d' },
      ),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async verifyToken(token: string, tokenType: 'access' | 'refresh') {
    const tokenSecret =
      tokenType === 'access'
        ? this.accessTokenSecret
        : tokenType === 'refresh'
          ? this.refreshTokenSecret
          : '';

    try {
      const decodedToken: TokenContent = await this.jwtService.verify(token, {
        secret: tokenSecret,
      });

      return { valid: true, expired: false, decodedToken };
    } catch (err: unknown) {
      if (
        err instanceof TokenExpiredError &&
        err.name === 'TokenExpiredError'
      ) {
        return { valid: false, expired: true, decoded: null };
      }
      return { valid: false, expired: false, decoded: null };
    }
  }

  static async hashPassword(password: string) {
    return await argon.hash(password);
  }

  static async verifyPassword(hash: string, password: string) {
    return await argon.verify(hash, password);
  }
}
