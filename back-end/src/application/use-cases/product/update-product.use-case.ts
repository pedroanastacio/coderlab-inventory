import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product/product.entity';
import type { ProductRepository } from '../../../domain/repositories/product.repository';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/tokens';
import { NotFoundError } from '../../../domain/errors/not-found.error';

interface UpdateProductInput {
  id: string;
  data: {
    name?: string;
    description?: string | null;
    price?: number;
    categoryIds?: string[];
  };
}

type UpdateProductOutput = Product;

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({
    id,
    data,
  }: UpdateProductInput): Promise<UpdateProductOutput> {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    if (data.categoryIds && data.categoryIds.length > 0) {
      await Promise.all(
        data.categoryIds.map(async (categoryId) => {
          const category = await this.categoryRepository.findById(categoryId);

          if (!category) {
            throw new NotFoundError(`Category with id ${categoryId} not found`);
          }
        }),
      );
    }

    const name = data.name ?? existingProduct.name;
    const description =
      data.description !== undefined
        ? data.description
        : existingProduct.description;
    const price = data.price ?? existingProduct.price;
    const categoryIds = data.categoryIds ?? existingProduct.categoryIds;

    const updatedProduct = new Product({
      id,
      name,
      description,
      price,
      categoryIds,
      createdAt: existingProduct.createdAt,
    });

    return this.productRepository.update(updatedProduct);
  }
}
