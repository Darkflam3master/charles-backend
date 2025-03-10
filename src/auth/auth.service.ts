import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';

import { AuthSignUpDto, AuthLogInDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tokens } from './types';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getTokens(userId: string, userName: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          userName,
        },
        { secret: 'at-secret', expiresIn: 60 * 15 },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          userName,
        },
        { secret: 'rt-secret', expiresIn: 60 * 60 * 24 * 7 },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(id: string, rt: string) {
    const hash = await argon.hash(rt);

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async signup(dto: AuthSignUpDto): Promise<Tokens> {
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

      const tokens = await this.getTokens(newUser.id, newUser.userName);
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

    return { message: 'Sign in Successful' };
  }
}
