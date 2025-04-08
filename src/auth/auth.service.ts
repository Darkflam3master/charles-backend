import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { Response } from 'express';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthSignUpDto, AuthLogInDto } from './dto';
import { AuthUtils } from './auth.utils';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private AuthUtils: AuthUtils,
  ) {}

  async updateRtHash(id: string, rt: string) {
    const hash = await AuthUtils.hashPassword(rt);

    await this.prisma.user.update({
      where: { id },
      data: { hashedRt: hash },
    });
  }

  async signup(
    {
      userName,
      email,
      password,
      dateOfBirth,
      twoFactorEnabled = false,
    }: AuthSignUpDto,
    res: Response,
  ) {
    AuthUtils.validatePassword(password);
    const hash = await argon.hash(password);
    const currentUtc = new Date().toISOString();

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hash,
          userName,
          createdAt: currentUtc,
          lastLogIn: currentUtc,
          twoFactorEnabled,
          ...(dateOfBirth && { dateOfBirth }),
        },
      });

      const tokens = await this.AuthUtils.getTokens(
        newUser.id,
        newUser.userName,
        newUser.email,
        newUser.twoFactorEnabled,
        currentUtc,
      );
      await this.updateRtHash(newUser.id, tokens.refresh_token);

      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 15 * 60 * 1000, // 15mins
        sameSite: true,
      });

      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: true,
      });

      res.json({
        user: {
          id: newUser.id,
          userName: newUser.userName,
          email: newUser.email,
          twoFactorEnabled: newUser.twoFactorEnabled,
          lastLogIn: newUser.lastLogIn,
        },
      });
    } catch (error) {
      console.log('ERROR PRINT HERE: ', error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          if (error.meta && Array.isArray(error.meta.target)) {
            if (error.meta.target.includes('user_name')) {
              throw new ConflictException('Duplicate User Name.');
            }

            if (error.meta.target.includes('email')) {
              throw new ConflictException('Duplicate email.');
            }
          }
        }
      }

      throw error;
    }
  }

  async login(dto: AuthLogInDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: {
        userName: dto.userName,
      },
    });
    const currentUtc = new Date().toISOString();

    if (!user) {
      throw new UnauthorizedException('Incorrect Credential');
    }

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) {
      throw new UnauthorizedException('Incorrect Credential');
    }

    const tokens = await this.AuthUtils.getTokens(
      user.id,
      user.userName,
      user.email,
      user.twoFactorEnabled,
      currentUtc,
    );

    await this.updateRtHash(user.id, tokens.refresh_token);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000, // 15mins
      sameSite: true,
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: true,
    });

    res.json({
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLogIn: user.lastLogIn,
      },
    });
  }

  async logout(id: string) {
    await this.prisma.user.updateMany({
      where: {
        id,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });

    return { message: 'Successfully logged out' };
  }

  async verifyAccessToken(accessToken: string, res: Response) {
    if (!accessToken) {
      console.error('No access token passed');
      throw new UnauthorizedException(
        'Authentication failed. Please try again.',
      );
    }

    const result = await this.AuthUtils.verifyToken(accessToken, 'access');

    if (result.valid) {
      return res.json({ message: 'TOKEN_VALID' });
    } else if (result.expired) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    } else {
      throw new ForbiddenException('TOKEN_INVALID');
    }
  }

  async verifyRefreshToken(refreshToken: string, res: Response) {
    const result = await this.AuthUtils.verifyToken(refreshToken, 'refresh');

    if (result.valid) {
      return res.json({ message: 'TOKEN_VALID' });
    } else if (result.expired) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    } else {
      throw new ForbiddenException('TOKEN_INVALID');
    }
  }

  async refreshTokens(id: string, rt: string, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user || !user.hashedRt)
      throw new UnauthorizedException(
        'Authentication failed. Please try again.',
      );

    const rtMatches = await argon.verify(user.hashedRt, rt);

    if (!rtMatches)
      throw new UnauthorizedException(
        'Authentication failed. Please try again.',
      );

    const tokens = await this.AuthUtils.getTokens(
      user.id,
      user.userName,
      user.email,
      user.twoFactorEnabled,
      user.lastLogIn,
    );
    await this.updateRtHash(user.id, tokens.refresh_token);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000, // 15mins
      sameSite: true,
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: true,
    });

    res.json({ message: 'Tokens refreshed successfully' });
  }
}
