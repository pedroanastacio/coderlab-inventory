import type { Product as PrismaProduct } from '../../../../generated/prisma/client';
import { Product } from '../../../../domain/entities/product/product.entity';

export class PrismaProductMapper {
  static toDomain(
    data: PrismaProduct & {
      categories?: { categoryId: string }[];
    },
  ): Product {
    return new Product({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      categoryIds: data.categories?.map((c) => c.categoryId) ?? [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toPersistence(product: Product) {
    const categoryConnections = product.categoryIds.map((categoryId) => ({
      category: { connect: { id: categoryId } },
    }));

    return {
      id: product.id,
      name: product.name,
      description: product.description ?? null,
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categories: {
        create: categoryConnections,
      },
    };
  }
}
