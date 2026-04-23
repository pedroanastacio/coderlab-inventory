import { Category as PrismaCategory } from '../../../../generated/prisma/client';
import { Category } from '../../../../domain/entities/category.entity';

export class PrismaCategoryMapper {
  static toDomain(data: PrismaCategory): Category {
    return new Category({
      id: data.id,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toPersistence(category: Category): PrismaCategory {
    return {
      id: category.id,
      name: category.name,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
