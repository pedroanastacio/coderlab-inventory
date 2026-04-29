import { Injectable } from '@nestjs/common';
import type {
  ProductRepository,
  ProductFilterParams,
} from '../../../../domain/repositories/product.repository';
import { PrismaService } from '../prisma.service';
import { Product } from '../../../../domain/entities/product/product.entity';
import { PrismaProductMapper } from '../mappers/product.mapper';
import type { PaginationParams } from '../../../../shared/types/pagination-params.types';
import type { SortParams } from '../../../../shared/types/sort-params.types';
import type { PaginatedResult } from '../../../../shared/types/paginated-result.types';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<Product> {
    const data = PrismaProductMapper.toPersistence(product);

    const created = await this.prisma.product.create({
      data,
      include: { categories: { include: { category: true } } },
    });

    return PrismaProductMapper.toDomain(created);
  }

  async findById(id: string): Promise<Product | null> {
    const data = await this.prisma.product.findUnique({
      where: { id },
      include: { categories: { include: { category: true } } },
    });

    if (!data) {
      return null;
    }

    return PrismaProductMapper.toDomain(data);
  }

  async update(product: Product): Promise<Product> {
    const data = PrismaProductMapper.toPersistence(product);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.categoryOnProduct.deleteMany({
        where: { productId: product.id },
      });

      return tx.product.update({
        where: { id: product.id },
        data,
        include: { categories: { include: { category: true } } },
      });
    });

    return PrismaProductMapper.toDomain(updated);
  }

  async findAll(
    filters: ProductFilterParams,
    pagination: PaginationParams,
    sort: SortParams<string>,
  ): Promise<PaginatedResult<Product>> {
    const whereClause: Record<string, unknown> = {};

    if (filters.query) {
      whereClause.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      whereClause.categories = {
        some: { categoryId: filters.categoryId },
      };
    }

    const total = await this.prisma.product.count({ where: whereClause });

    const data = await this.prisma.product.findMany({
      where: whereClause,
      skip: (pagination.page - 1) * pagination.perPage,
      take: pagination.perPage,
      orderBy: {
        [sort.sortBy]: sort.sortOrder,
      },
      include: { categories: { include: { category: true } } },
    });

    const products = data.map((p) => PrismaProductMapper.toDomain(p));

    return {
      data: products,
      pagination: {
        total,
        page: pagination.page,
        perPage: pagination.perPage,
        pageCount: Math.ceil(total / pagination.perPage),
      },
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}
