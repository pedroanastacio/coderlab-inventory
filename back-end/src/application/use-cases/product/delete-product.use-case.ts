import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepository } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';
import { NotFoundError } from '../../../domain/errors/not-found.error';

interface DeleteProductInput {
  id: string;
}

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute({ id }: DeleteProductInput): Promise<void> {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    await this.productRepository.delete(id);
  }
}
