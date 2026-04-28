import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '../../../domain/entities/category/category.entity';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/tokens';

interface FindCategoryByIdInput {
  id: string;
}

type FindCategoryByIdOutput = Category;

@Injectable()
export class FindCategoryByIdUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(input: FindCategoryByIdInput): Promise<FindCategoryByIdOutput> {
    const category = await this.categoryRepository.findById(input.id);

    if (!category) {
      throw new NotFoundException(`Category with id ${input.id} not found`);
    }

    return category;
  }
}
