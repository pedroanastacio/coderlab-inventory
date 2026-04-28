import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../../domain/entities/category.entity';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/tokens';
import { NotFoundError } from '../../../domain/errors/not-found.error';

interface UpdateCategoryInput {
  id: string;
  data: {
    name?: string;
    description?: string | null;
    parentId?: string | null;
  };
}

type UpdateCategoryOutput = Category;

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({
    id,
    data,
  }: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    if (data.parentId) {
      const parentExists = await this.categoryRepository.findById(
        data.parentId,
      );

      if (!parentExists) {
        throw new NotFoundError('Parent category not found');
      }
    }

    const name = data.name ?? existingCategory.name;
    const description =
      data.description !== undefined
        ? data.description
        : existingCategory.description;
    const parentId =
      data.parentId !== undefined ? data.parentId : existingCategory.parentId;

    const updatedCategory = new Category({
      id,
      name,
      description,
      parentId,
      createdAt: existingCategory.createdAt,
    });

    return this.categoryRepository.update(updatedCategory);
  }
}
