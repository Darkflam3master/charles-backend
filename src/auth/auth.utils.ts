import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import * as zxcvbn from 'zxcvbn';

@Injectable()
export class AuthUtils {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

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
    const accessTokenSecret = this.config.get<string>('ACCESS_TOKEN_SECRET');
    const refreshTokenSecret = this.config.get<string>('REFRESH_TOKEN_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, userName, email, twoFactorEnabled, lastLogIn },
        { secret: accessTokenSecret, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { id: userId, userName, email, twoFactorEnabled, lastLogIn },
        { secret: refreshTokenSecret, expiresIn: '7d' },
      ),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  static async hashPassword(password: string) {
    return await argon.hash(password);
  }

  static async verifyPassword(hash: string, password: string) {
    return await argon.verify(hash, password);
  }
}
