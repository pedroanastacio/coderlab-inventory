import { NestFactory } from '@nestjs/core';
import { AppModule } from './infra/modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';
import { DomainErrorFilter } from './infra/http/filters/domain-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainErrorFilter());

  const config = new DocumentBuilder()
    .setTitle('Coderlab Inventory API')
    .setDescription('API REST to manage inventory of products for CoderLab')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
