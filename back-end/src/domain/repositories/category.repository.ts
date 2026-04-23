import { Category } from '../entities/category.entity';

export interface CategoryRepository {
  create(category: Category): Promise<Category>;
}
