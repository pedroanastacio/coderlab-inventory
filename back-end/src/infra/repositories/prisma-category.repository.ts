import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../repositories/category.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import { Category } from '../../entities/category.entity';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<Category> {
    const data = await this.prisma.category.create({
      data: {
        name: category.name,
        description: category.description ?? null,
        parentId: category.parentId ?? null,
      },
    });

    return new Category({
      id: data.id,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
    });
  }
}
