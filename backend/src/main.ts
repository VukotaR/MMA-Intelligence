import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MMA Intelligence API')
    .setDescription('Backend API for MMA Intelligence application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `API running on http://localhost:${process.env.PORT ?? 3000}`,
  );

  console.log(
    `Swagger: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}

bootstrap();