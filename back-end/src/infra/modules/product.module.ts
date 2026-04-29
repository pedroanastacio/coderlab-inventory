import { Module } from '@nestjs/common';
import { CreateProductUseCase } from '../../application/use-cases/product/create-product.use-case';
import { FindProductByIdUseCase } from '../../application/use-cases/product/find-product-by-id.use-case';
import { FindAllProductsUseCase } from '../../application/use-cases/product/find-all-products.use-case';
import { ProductController } from '../http/controllers/product.controller';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/tokens';
import { PrismaProductRepository } from '../database/prisma/repositories/prisma-product.repository';
import { CategoryModule } from './category.module';
import { UpdateProductUseCase } from '../../application/use-cases/product/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/product/delete-product.use-case';

@Module({
  imports: [CategoryModule],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    CreateProductUseCase,
    FindProductByIdUseCase,
    FindAllProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
