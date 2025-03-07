// src/users/users.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateInput } from './types';

@Controller('user')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  create(@Body() data: UserCreateInput) {
    return this.userService.create(data);
  }
}
