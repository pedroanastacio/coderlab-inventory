import { Product } from '../entities/product/product.entity';
import type { PaginatedResult } from '../../shared/types/paginated-result.types';
import type { FilterParams } from '../../shared/types/filter-params.types';
import type { PaginationParams } from '../../shared/types/pagination-params.types';
import type { SortParams } from '../../shared/types/sort-params.types';

export type ProductFilterParams = FilterParams<string> & {
  categoryId?: string;
};

export interface ProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  update(product: Product): Promise<Product>;
  findAll(
    filters: ProductFilterParams,
    pagination: PaginationParams,
    sort: SortParams<string>,
  ): Promise<PaginatedResult<Product>>;
  delete(id: string): Promise<void>;
}
