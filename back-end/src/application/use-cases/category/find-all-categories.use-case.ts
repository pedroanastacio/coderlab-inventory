import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../../domain/entities/category/category.entity';
import type {
  CategoryFilterParams,
  CategoryRepository,
} from '../../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/tokens';
import type {
  PaginatedResult,
  PaginationParams,
  SortParams,
} from '../../../shared/types';

interface FindAllCategoriesInput {
  filters: CategoryFilterParams;
  pagination: PaginationParams;
  sort: SortParams<string>;
}

type FindAllCategoriesOutput = PaginatedResult<Category>;

@Injectable()
export class FindAllCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    input: FindAllCategoriesInput,
  ): Promise<FindAllCategoriesOutput> {
    return await this.categoryRepository.findAll(
      input.filters,
      input.pagination,
      input.sort,
    );
  }
}
