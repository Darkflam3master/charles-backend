// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserCreateInput } from './types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany(); // Example query
  }

  async create(data: UserCreateInput) {
    return await this.prisma.user.create({ data });
  }
}
