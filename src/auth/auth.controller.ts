import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthSignUpDto, AuthLogInDto } from './dto';
import { RtGuard } from 'src/common/guards';
import {
  GetCurrentToken,
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from 'src/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() dto: AuthSignUpDto, @Res() res: Response) {
    return this.authService.signup(dto, res);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AuthLogInDto, @Res() res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() id: string) {
    return this.authService.logout(id);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  getUser(@GetCurrentUserId() id: string) {
    return this.authService.getUser(id);
  }

  @Post('verify-access-token')
  @HttpCode(HttpStatus.OK)
  verifyAccessToken(
    @GetCurrentToken('access_token') accessToken: string,
    @Res() res: Response,
  ) {
    return this.authService.verifyAccessToken(accessToken, res);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('verify-refresh-token')
  @HttpCode(HttpStatus.OK)
  verifyRefreshToken(
    @GetCurrentToken('refresh_token') refreshToken: string,
    @Res() res: Response,
  ) {
    return this.authService.verifyRefreshToken(refreshToken, res);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() id: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    return this.authService.refreshTokens(id, refreshToken, res);
  }
}
