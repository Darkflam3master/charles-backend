import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AtStrategy, RtStrategy } from 'src/strategies';
import { JwtModule } from '@nestjs/jwt';
import { AuthUtils } from './auth.utils';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, AuthUtils, String],
})
export class AuthModule {}
