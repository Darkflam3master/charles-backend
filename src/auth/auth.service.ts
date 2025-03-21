import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { Response } from 'express';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthSignUpDto, AuthLogInDto } from './dto';
import { Tokens } from './types';
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

  async signup({
    userName,
    email,
    password,
    dateOfBirth,
    twoFactorEnabled = false,
  }: AuthSignUpDto): Promise<Tokens> {
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

      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'p2002') {
          throw new ForbiddenException('Duplicate Credential');
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
      throw new ForbiddenException('Incorrect Credential');
    }

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Incorrect Credential');
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

    res.json({ message: 'Logged in successfully' });
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

  async refreshTokens(id: string, rt: string, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, rt);

    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.AuthUtils.getTokens(
      user.id,
      user.userName,
      user.email,
      user.twoFactorEnabled,
      user.lastLogIn,
    );
    await this.updateRtHash(user.id, tokens.refresh_token);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: true,
    });

    res.json({ message: 'Refresh token rotated successfully' });
  }
}
