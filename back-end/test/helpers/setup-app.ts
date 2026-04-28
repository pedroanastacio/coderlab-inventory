import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/infra/modules/app.module';
import { PrismaService } from '../../src/infra/database/prisma/prisma.service';
import { DomainErrorFilter } from '../../src/infra/http/filters/domain-error.filter';
import { App } from 'supertest/types';

interface SetupResult {
  app: INestApplication<App>;
  prisma: PrismaService;
}

export async function setupTestApp(): Promise<SetupResult> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainErrorFilter());

  const prisma = app.get(PrismaService);
  await app.init();

  return { app, prisma };
}
