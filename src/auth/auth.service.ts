import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthSignUpDto, AuthLogInDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthSignUpDto) {
    //generate the password hash
    const hash = await argon.hash(dto.passWord);

    try {
      //save new user into db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passWord: hash,
          userName: dto.userName,
        },
      });

      const userWithoutPassword = {
        ...user,
        passWord: undefined,
      };
      //return saved user
      return userWithoutPassword;
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
      throw new ForbiddenException('Credential Not Found');
    }

    const pwMatches = await argon.verify(user.passWord, dto.passWord);

    if (!pwMatches) {
      throw new ForbiddenException('Incorrect Credential');
    }

    return { message: 'Sign in Successful' };
  }
}
