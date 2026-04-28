import { Category } from '../entities/category/category.entity';
import type { PaginatedResult } from '../../shared/types/paginated-result.types';
import type { FilterParams } from '../../shared/types/filter-params.types';
import type { PaginationParams } from '../../shared/types/pagination-params.types';
import type { SortParams } from '../../shared/types/sort-params.types';

export type CategoryFilterParams = FilterParams<string> & {
  parentId?: string;
};
export interface CategoryRepository {
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  update(category: Category): Promise<Category>;
  findAll(
    filters: CategoryFilterParams,
    pagination: PaginationParams,
    sort: SortParams<string>,
  ): Promise<PaginatedResult<Category>>;
  delete(id: string): Promise<void>;
}
