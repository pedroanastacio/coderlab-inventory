import { Category as PrismaCategory } from '../../../../generated/prisma/client';
import { Category } from '../../../../domain/entities/category/category.entity';

type PrismaCategoryWithParent = PrismaCategory & {
  parent?: PrismaCategory | null;
};

export class PrismaCategoryMapper {
  static toDomain(data: PrismaCategoryWithParent): Category {
    return new Category({
      id: data.id,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      parent: data.parent
        ? new Category({
            id: data.parent.id,
            name: data.parent.name,
            description: data.parent.description,
            parentId: data.parent.parentId,
            deletedAt: data.parent.deletedAt,
            createdAt: data.parent.createdAt,
            updatedAt: data.parent.updatedAt,
          })
        : null,
      deletedAt: data.deletedAt,
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
      deletedAt: category.deletedAt ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
