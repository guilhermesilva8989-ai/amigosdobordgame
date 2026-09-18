import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3001);
  const webUrl = configService.get<string>(
    'WEB_URL',
    'http://localhost:5173',
  );

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: webUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Amigos do Board Game API')
    .setDescription(
      'API responsável pelo controle financeiro do Amigos do Board Game.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'Amigos do Board Game | API',
  });

  await app.listen(port);

  console.log(`API disponível em: http://localhost:${port}/api`);
  console.log(`Swagger disponível em: http://localhost:${port}/api/docs`);
}

void bootstrap();
