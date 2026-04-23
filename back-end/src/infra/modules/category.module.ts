import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { PrismaCategoryRepository } from '../database/prisma/repositories/prisma-category.repository';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { FindCategoryByIdUseCase } from '../../application/use-cases/find-category-by-id.use-case';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/tokens';
import { CategoryController } from '../http/controllers/category.controller';

@Module({
  providers: [
    PrismaService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
    CreateCategoryUseCase,
    FindCategoryByIdUseCase,
  ],
  controllers: [CategoryController],
})
export class CategoryModule {}
