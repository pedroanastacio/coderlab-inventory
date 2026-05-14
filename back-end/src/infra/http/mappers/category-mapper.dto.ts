import { Category } from '../../../domain/entities/category/category.entity';

import {
  CategoryParentDto,
  CategoryResponseDto,
} from '../dtos/category/category-response.dto';

export class CategoryMapper {
  static toDto(data: Category): CategoryResponseDto {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      parent: data.parent
        ? {
            id: data.parent.id,
            name: data.parent.name,
            description: data.parent.description,
            parentId: data.parent.parentId,
            createdAt: data.parent.createdAt,
            updatedAt: data.parent.updatedAt,
          }
        : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
