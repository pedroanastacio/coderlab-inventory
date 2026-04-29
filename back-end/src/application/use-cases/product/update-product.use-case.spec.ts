import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { UpdateProductUseCase } from './update-product.use-case';
import { InMemoryProductRepository } from '../../../infra/database/in-memory/repositories/in-memory-product.repository';
import { InMemoryCategoryRepository } from '../../../infra/database/in-memory/repositories/in-memory-category.repository';
import { Product } from '../../../domain/entities/product/product.entity';
import { Category } from '../../../domain/entities/category/category.entity';

const getMockUpdateProductInput = (
  overrides?: Partial<{
    id: string;
    data: {
      name?: string;
      description?: string | null;
      price?: number;
      categoryIds?: string[];
    };
  }>,
) => {
  return {
    id: 'product-123',
    data: {
      name: undefined,
      description: undefined,
      price: undefined,
      categoryIds: undefined,
      ...overrides?.data,
    },
    ...overrides,
  };
};

describe('UpdateProductUseCase', () => {
  let productRepository: InMemoryProductRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let useCase: UpdateProductUseCase;

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    categoryRepository = new InMemoryCategoryRepository();
    useCase = new UpdateProductUseCase(productRepository, categoryRepository);

    const category = new Category({
      id: 'category-123',
      name: 'Test Category',
      description: null,
      parentId: null,
    });
    await categoryRepository.create(category);

    const product = new Product({
      id: 'product-123',
      name: 'Original Product',
      description: 'Original description',
      price: 100,
      categoryIds: ['category-123'],
    });
    await productRepository.create(product);
  });

  afterEach(() => {
    productRepository.clear();
    categoryRepository.clear();
  });

  describe('execute', () => {
    it('should update product name', async () => {
      const input = getMockUpdateProductInput({
        id: 'product-123',
        data: { name: 'Updated Product' },
      });

      const result = await useCase.execute(input);

      expect(result.name).toBe('Updated Product');
    });

    it('should update product description', async () => {
      const input = getMockUpdateProductInput({
        id: 'product-123',
        data: { description: 'New description' },
      });

      const result = await useCase.execute(input);

      expect(result.description).toBe('New description');
    });

    it('should update product price', async () => {
      const input = getMockUpdateProductInput({
        id: 'product-123',
        data: { price: 200 },
      });

      const result = await useCase.execute(input);

      expect(result.price).toBe(200);
    });

    it('should update product categoryIds', async () => {
      const newCategory = new Category({
        id: 'category-456',
        name: 'New Category',
        description: null,
        parentId: null,
      });
      await categoryRepository.create(newCategory);

      const input = getMockUpdateProductInput({
        id: 'product-123',
        data: { categoryIds: ['category-123', 'category-456'] },
      });

      const result = await useCase.execute(input);

      expect(result.categoryIds).toEqual(['category-123', 'category-456']);
    });

    it('should throw NotFoundError when product does not exist', async () => {
      const input = getMockUpdateProductInput({
        id: 'non-existent',
        data: { name: 'New Name' },
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(NotFoundError);
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Product not found',
      );
    });

    it('should throw NotFoundError when category does not exist', async () => {
      const input = getMockUpdateProductInput({
        id: 'product-123',
        data: { categoryIds: ['non-existent-category'] },
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(NotFoundError);
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Category with id non-existent-category not found',
      );
    });

    it('should throw ValidationError when name is empty', async () => {
      const input = getMockUpdateProductInput({
        id: 'product-123',
        data: { name: '' },
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw ValidationError when price is negative', async () => {
      const input = getMockUpdateProductInput({
        id: 'product-123',
        data: { price: -10 },
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw ValidationError when categoryIds is empty', async () => {
      const input = getMockUpdateProductInput({
        id: 'product-123',
        data: { categoryIds: [] },
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
