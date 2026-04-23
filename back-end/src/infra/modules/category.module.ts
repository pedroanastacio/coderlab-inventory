import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { PrismaCategoryRepository } from '../repositories/prisma-category.repository';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
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
  ],
  controllers: [CategoryController],
})
export class CategoryModule {}
