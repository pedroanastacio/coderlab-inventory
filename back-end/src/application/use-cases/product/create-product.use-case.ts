import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product/product.entity';
import type { ProductRepository } from '../../../domain/repositories/product.repository';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/tokens';
import { NotFoundError } from '../../../domain/errors/not-found.error';

interface CreateProductInput {
  name: string;
  description?: string | null;
  price: number;
  categoryIds: string[];
}

type CreateProductOutput = Product;

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    await Promise.all(
      input.categoryIds.map(async (categoryId) => {
        const category = await this.categoryRepository.findById(categoryId);
        if (!category) {
          throw new NotFoundError(`Category with id ${categoryId} not found`);
        }
      }),
    );

    const product = new Product({
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      categoryIds: input.categoryIds,
    });

    return this.productRepository.create(product);
  }
}
