import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product/product.entity';
import type { ProductRepository } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';
import { NotFoundError } from '../../../domain/errors/not-found.error';

interface FindProductByIdInput {
  id: string;
}

type FindProductByIdOutput = Product;

@Injectable()
export class FindProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: FindProductByIdInput): Promise<FindProductByIdOutput> {
    const product = await this.productRepository.findById(input.id);

    if (!product) {
      throw new NotFoundError(`Product with id ${input.id} not found`);
    }

    return product;
  }
}
