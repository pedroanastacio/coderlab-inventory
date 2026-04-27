import { Inject, Injectable } from '@nestjs/common';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/tokens';
import { NotFoundError } from '../../domain/errors/not-found.error';

interface DeleteCategoryInput {
  id: string;
}

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({ id }: DeleteCategoryInput): Promise<void> {
    const existingCategory = await this.categoryRepository.findById(id);

    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    await this.categoryRepository.delete(id);
  }
}
