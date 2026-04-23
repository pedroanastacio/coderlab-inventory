import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../../../domain/repositories/category.repository';
import { PrismaService } from '../prisma.service';
import { Category } from '../../../../domain/entities/category.entity';
import { PrismaCategoryMapper } from '../mappers/category.mapper';

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
}
