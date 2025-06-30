import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = await app.resolve(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.enableCors({
    credentials: true,
    origin: [
      config.get(AppConfig.App.FrontendUrl),
      config.get(AppConfig.App.FrontendUrlPublic),
    ],
  });
  app.setGlobalPrefix(config.get(AppConfig.App.Prefix));
  await app.listen(config.get(AppConfig.App.Port));
}
bootstrap();
