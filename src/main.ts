import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // 全局使用管道
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3001);
}
bootstrap();
