import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const configService = new ConfigService();
  const frontendUrls = configService.get<string>('FRONTEND_URL');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: frontendUrls,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((err) => {
  // Handle any errors that might occur during startup
  console.error('Error during application startup:', err);
});
