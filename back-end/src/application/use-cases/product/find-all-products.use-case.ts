import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product/product.entity';
import type {
  ProductFilterParams,
  ProductRepository,
} from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';
import type {
  PaginatedResult,
  PaginationParams,
  SortParams,
} from '../../../shared/types';

interface FindAllProductsInput {
  filters: ProductFilterParams;
  pagination: PaginationParams;
  sort: SortParams<string>;
}

type FindAllProductsOutput = PaginatedResult<Product>;

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: FindAllProductsInput): Promise<FindAllProductsOutput> {
    return await this.productRepository.findAll(
      input.filters,
      input.pagination,
      input.sort,
    );
  }
}
