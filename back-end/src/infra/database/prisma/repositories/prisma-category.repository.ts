import { Injectable } from '@nestjs/common';
import type {
  CategoryRepository,
  CategoryFilterParams,
} from '../../../../domain/repositories/category.repository';
import { PrismaService } from '../prisma.service';
import { Category } from '../../../../domain/entities/category/category.entity';
import { PrismaCategoryMapper } from '../mappers/category.mapper';
import type { PaginationParams } from '../../../../shared/types/pagination-params.types';
import type { SortParams } from '../../../../shared/types/sort-params.types';
import type { PaginatedResult } from '../../../../shared/types/paginated-result.types';
import { Prisma } from '../../../../generated/prisma/client';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<Category> {
    const prismaCategory = PrismaCategoryMapper.toPersistence(category);

    const data = await this.prisma.category.create({
      data: prismaCategory,
    });

    return PrismaCategoryMapper.toDomain(data);
  }

  async findById(id: string): Promise<Category | null> {
    const data = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!data || data.deletedAt) {
      return null;
    }

    return PrismaCategoryMapper.toDomain(data);
  }

  async update(category: Category): Promise<Category> {
    const prismaCategory = PrismaCategoryMapper.toPersistence(category);

    const data = await this.prisma.category.update({
      where: { id: category.id, deletedAt: null },
      data: prismaCategory,
    });

    return PrismaCategoryMapper.toDomain(data);
  }

  async findAll(
    filters: CategoryFilterParams,
    pagination: PaginationParams,
    sort: SortParams<string>,
  ): Promise<PaginatedResult<Category>> {
    const whereClause: Prisma.CategoryWhereInput = { deletedAt: null };

    if (filters.query) {
      whereClause.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters.parentId) {
      whereClause.parentId = filters.parentId;
    }

    const total = await this.prisma.category.count({ where: whereClause });

    const data = await this.prisma.category.findMany({
      where: whereClause,
      skip: (pagination.page - 1) * pagination.perPage,
      take: pagination.perPage,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
    });

    const categories = data.map((c) => PrismaCategoryMapper.toDomain(c));

    return {
      data: categories,
      pagination: {
        total,
        page: pagination.page,
        perPage: pagination.perPage,
        pageCount: Math.ceil(total / pagination.perPage),
      },
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.categoryOnProduct.deleteMany({
        where: { categoryId: id },
      });

      await tx.category.updateMany({
        where: { parentId: id, deletedAt: null },
        data: { parentId: null },
      });

      const orphanedProducts = await tx.product.findMany({
        where: {
          categories: { none: {} },
          deletedAt: null,
        },
      });

      for (const product of orphanedProducts) {
        await tx.product.update({
          where: { id: product.id },
          data: { deletedAt: new Date() },
        });
      }

      await tx.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }
}
