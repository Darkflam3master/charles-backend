import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { GetCurrentUserId } from 'src/common/decorators';

@Controller('user')
export class UsersController {
  constructor(private userService: UserService) {}

  @Public()
  @Get('user')
  @HttpCode(HttpStatus.OK)
  getUser(@GetCurrentUserId() id: string) {
    return this.userService.getUser(id);
  }
}
