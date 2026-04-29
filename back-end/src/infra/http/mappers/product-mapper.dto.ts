import { Product } from '../../../domain/entities/product/product.entity';
import { ProductResponseDto } from '../dtos/product/product-response.dto';

export class ProductMapper {
  static toDto(data: Product): ProductResponseDto {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      categoryIds: data.categoryIds,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
