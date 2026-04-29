import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { CreateProductUseCase } from './create-product.use-case';
import { InMemoryProductRepository } from '../../../infra/database/in-memory/repositories/in-memory-product.repository';
import { InMemoryCategoryRepository } from '../../../infra/database/in-memory/repositories/in-memory-category.repository';
import { Category } from '../../../domain/entities/category/category.entity';

const getMockCreateProductInput = (
  overrides?: Partial<{
    name: string;
    description: string | null;
    price: number;
    categoryIds: string[];
  }>,
) => {
  return {
    name: 'Test Product',
    description: 'A test product description',
    price: 100,
    categoryIds: ['cat-123'],
    ...overrides,
  };
};

describe('CreateProductUseCase', () => {
  let productRepository: InMemoryProductRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    productRepository = new InMemoryProductRepository();
    categoryRepository = new InMemoryCategoryRepository();
    useCase = new CreateProductUseCase(productRepository, categoryRepository);
  });

  afterEach(() => {
    productRepository.clear();
    categoryRepository.clear();
  });

  describe('execute', () => {
    it('should create product with valid input', async () => {
      const category = new Category({
        name: 'Electronics',
        description: null,
        parentId: null,
      });
      await categoryRepository.create(category);

      const input = getMockCreateProductInput({
        categoryIds: [category.id],
      });

      const result = await useCase.execute(input);

      expect(result.name).toBe('Test Product');
      expect(result.description).toBe('A test product description');
      expect(result.price).toBe(100);
      expect(result.categoryIds).toEqual([category.id]);
      expect(result.id).toBeDefined();
    });

    it('should create product with null description', async () => {
      const category = new Category({
        name: 'Electronics',
        description: null,
        parentId: null,
      });
      await categoryRepository.create(category);

      const input = getMockCreateProductInput({
        description: null,
        categoryIds: [category.id],
      });

      const result = await useCase.execute(input);

      expect(result.description).toBeNull();
    });

    it('should throw NotFoundError when category does not exist', async () => {
      const input = getMockCreateProductInput({
        categoryIds: ['non-existent-category'],
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(NotFoundError);
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Category with id non-existent-category not found',
      );
    });

    it('should create product with multiple categories', async () => {
      const category1 = new Category({
        name: 'Electronics',
        description: null,
        parentId: null,
      });
      const category2 = new Category({
        name: 'Smartphones',
        description: null,
        parentId: null,
      });
      await categoryRepository.create(category1);
      await categoryRepository.create(category2);

      const input = getMockCreateProductInput({
        categoryIds: [category1.id, category2.id],
      });

      const result = await useCase.execute(input);

      expect(result.categoryIds).toEqual([category1.id, category2.id]);
    });

    it('should throw ValidationError when price is negative', async () => {
      const category = new Category({
        name: 'Electronics',
        description: null,
        parentId: null,
      });
      await categoryRepository.create(category);

      const input = getMockCreateProductInput({
        price: -10,
        categoryIds: [category.id],
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(
        ValidationError,
      );
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Product price cannot be negative',
      );
    });
  });
});
