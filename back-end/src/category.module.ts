import { Module } from '@nestjs/common';
import { PrismaService } from './infra/database/prisma/prisma.service';
import { PrismaCategoryRepository } from './infra/repositories/prisma-category.repository';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { CATEGORY_REPOSITORY } from './domain/repositories/tokens';

@Module({
  providers: [
    PrismaService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
    CreateCategoryUseCase,
  ],
})
export class CategoryModule {}
