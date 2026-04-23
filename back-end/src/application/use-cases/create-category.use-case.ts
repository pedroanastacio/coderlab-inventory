import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '../../domain/entities/category.entity';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/tokens';

interface CreateCategoryInput {
  name: string;
  description?: string | null;
  parentId?: string | null;
}

type CreateCategoryOutput = Category;

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    if (input.parentId) {
      const parentExists = await this.categoryRepository.findById(
        input.parentId,
      );

      if (!parentExists) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = new Category({
      name: input.name,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
    });

    return this.categoryRepository.create(category);
  }
}
