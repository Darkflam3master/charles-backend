import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthSignUpDto, AuthLogInDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: AuthSignUpDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: AuthLogInDto) {
    return this.authService.login(dto);
  }
}
