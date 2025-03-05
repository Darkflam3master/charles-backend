import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp() {
    return 'i am signup';
  }

  @Post('login')
  login() {
    return 'i am login';
  }
}
