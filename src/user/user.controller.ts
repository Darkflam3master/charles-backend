import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { GetCurrentUserId, Public } from 'src/common/decorators';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getUser(@GetCurrentUserId() id: string) {
    return this.userService.getUser(id);
  }
}
