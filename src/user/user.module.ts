import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from './user.service';
import { AtGuard } from 'src/common/guards';
import { AtStrategy } from 'src/strategies';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, AtGuard, AtStrategy, PassportModule],
})
export class UserModule {}
