import { Category } from '../../../domain/entities/category.entity';

import { CategoryResponseDto } from '../dtos/category-response.dto';

export class CategoryMapper {
  static toDto(data: Category): CategoryResponseDto {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
