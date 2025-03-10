import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AtGuard } from './common/decorators/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  //requare access token for every route
  app.useGlobalGuards(new AtGuard());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
