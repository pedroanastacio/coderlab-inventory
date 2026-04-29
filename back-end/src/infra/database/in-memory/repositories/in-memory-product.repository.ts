import { Injectable } from '@nestjs/common';
import type {
  ProductRepository,
  ProductFilterParams,
} from '../../../../domain/repositories/product.repository';
import { Product } from '../../../../domain/entities/product/product.entity';
import type { PaginationParams } from '../../../../shared/types/pagination-params.types';
import {
  SortOrder,
  type SortParams,
} from '../../../../shared/types/sort-params.types';
import type { PaginatedResult } from '../../../../shared/types/paginated-result.types';
import { NotFoundError } from '../../../../domain/errors/not-found.error';

@Injectable()
export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];

  async create(product: Product): Promise<Product> {
    this.products.push(product);
    return Promise.resolve(product);
  }

  async findById(id: string): Promise<Product | null> {
    return Promise.resolve(this.products.find((p) => p.id === id) ?? null);
  }

  async update(product: Product): Promise<Product> {
    const index = this.products.findIndex((p) => p.id === product.id);
    if (index === -1) {
      throw new NotFoundError('Product not found');
    }
    this.products[index] = product;
    return Promise.resolve(product);
  }

  async findAll(
    filters: ProductFilterParams,
    pagination: PaginationParams,
    sort: SortParams<string>,
  ): Promise<PaginatedResult<Product>> {
    let result = [...this.products];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    if (filters.categoryId) {
      result = result.filter((p) =>
        p.categoryIds.includes(filters.categoryId!),
      );
    }

    const total = result.length;

    result.sort((a, b) => {
      const aVal = a[sort.sortBy as keyof Product];
      const bVal = b[sort.sortBy as keyof Product];
      const order = sort.sortOrder === SortOrder.ASC ? 1 : -1;
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return order;
      if (bVal === null || bVal === undefined) return -order;
      return aVal < bVal ? -order : order;
    });

    const start = (pagination.page - 1) * pagination.perPage;
    const data = result.slice(start, start + pagination.perPage);

    return Promise.resolve({
      data,
      pagination: {
        total,
        page: pagination.page,
        perPage: pagination.perPage,
        pageCount: Math.ceil(total / pagination.perPage),
      },
    });
  }

  clear(): void {
    this.products = [];
  }

  async delete(id: string): Promise<void> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundError('Product not found');
    }
    this.products.splice(index, 1);
    return Promise.resolve();
  }
}
