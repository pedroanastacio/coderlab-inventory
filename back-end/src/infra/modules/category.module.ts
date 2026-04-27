import { Module } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { FindCategoryByIdUseCase } from '../../application/use-cases/find-category-by-id.use-case';
import { FindAllCategoriesUseCase } from '../../application/use-cases/find-all-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { CategoryController } from '../http/controllers/category.controller';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/tokens';
import { PrismaCategoryRepository } from '../database/prisma/repositories/prisma-category.repository';

@Module({
  providers: [
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
    CreateCategoryUseCase,
    FindCategoryByIdUseCase,
    FindAllCategoriesUseCase,
    UpdateCategoryUseCase,
  ],
  controllers: [CategoryController],
})
export class CategoryModule {}
