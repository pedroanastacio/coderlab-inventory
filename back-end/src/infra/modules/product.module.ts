import { Module } from '@nestjs/common';
import { CreateProductUseCase } from '../../application/use-cases/product/create-product.use-case';
import { FindProductByIdUseCase } from '../../application/use-cases/product/find-product-by-id.use-case';
import { ProductController } from '../http/controllers/product.controller';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/tokens';
import { PrismaProductRepository } from '../database/prisma/repositories/prisma-product.repository';
import { CategoryModule } from './category.module';

@Module({
  imports: [CategoryModule],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    CreateProductUseCase,
    FindProductByIdUseCase,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
