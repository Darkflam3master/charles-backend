import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';

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

  async signup(dto: AuthSignUpDto): Promise<Tokens> {
    AuthUtils.validatePassword(dto.password);
    //generate the password hash
    const hash = await argon.hash(dto.password);

    try {
      //save new user into db
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          userName: dto.userName,
        },
      });

      const tokens = await this.AuthUtils.getTokens(
        newUser.id,
        newUser.userName,
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

  async login(dto: AuthLogInDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        userName: dto.userName,
      },
    });

    if (!user) {
      throw new ForbiddenException('Incorrect Credential');
    }

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Incorrect Credential');
    }

    const tokens = await this.AuthUtils.getTokens(user.id, user.userName);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
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
  }

  async refreshTokens(id: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, rt);

    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.AuthUtils.getTokens(user.id, user.userName);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }
}
