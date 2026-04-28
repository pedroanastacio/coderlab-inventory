import { Injectable } from '@nestjs/common';
import type {
  CategoryRepository,
  CategoryFilterParams,
} from '../../../../domain/repositories/category.repository';
import { Category } from '../../../../domain/entities/category/category.entity';
import type { PaginationParams } from '../../../../shared/types/pagination-params.types';
import {
  SortOrder,
  type SortParams,
} from '../../../../shared/types/sort-params.types';
import type { PaginatedResult } from '../../../../shared/types/paginated-result.types';
import { NotFoundError } from '../../../../domain/errors/not-found.error';

@Injectable()
export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];

  async create(category: Category): Promise<Category> {
    this.categories.push(category);
    return Promise.resolve(category);
  }

  async findById(id: string): Promise<Category | null> {
    return Promise.resolve(this.categories.find((c) => c.id === id) ?? null);
  }

  async update(category: Category): Promise<Category> {
    const index = this.categories.findIndex((c) => c.id === category.id);
    if (index === -1) {
      throw new NotFoundError('Category not found');
    }
    this.categories[index] = category;
    return Promise.resolve(category);
  }

  async findAll(
    filters: CategoryFilterParams,
    pagination: PaginationParams,
    sort: SortParams<string>,
  ): Promise<PaginatedResult<Category>> {
    let result = [...this.categories];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query),
      );
    }

    if (filters.parentId) {
      result = result.filter((c) => c.parentId === filters.parentId);
    }

    const total = result.length;

    result.sort((a, b) => {
      const aVal = a[sort.sortBy as keyof Category];
      const bVal = b[sort.sortBy as keyof Category];
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
    this.categories = [];
  }

  async delete(id: string): Promise<void> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundError('Category not found');
    }
    this.categories.splice(index, 1);
    return Promise.resolve();
  }
}
