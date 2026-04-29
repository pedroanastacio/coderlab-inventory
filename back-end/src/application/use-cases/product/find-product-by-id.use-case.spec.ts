import { NotFoundError } from '../../../domain/errors/not-found.error';
import { FindProductByIdUseCase } from './find-product-by-id.use-case';
import { InMemoryProductRepository } from '../../../infra/database/in-memory/repositories/in-memory-product.repository';
import { InMemoryCategoryRepository } from '../../../infra/database/in-memory/repositories/in-memory-category.repository';
import { Product } from '../../../domain/entities/product/product.entity';

const getMockProduct = (
  overrides?: Partial<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    categoryIds: string[];
  }>,
) => {
  return new Product({
    id: 'product-123',
    name: 'Test Product',
    description: 'A test product',
    price: 100,
    categoryIds: ['cat-123'],
    ...overrides,
  });
};

describe('FindProductByIdUseCase', () => {
  let productRepository: InMemoryProductRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let useCase: FindProductByIdUseCase;

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    categoryRepository = new InMemoryCategoryRepository();
    useCase = new FindProductByIdUseCase(productRepository);

    await productRepository.create(getMockProduct());
  });

  afterEach(() => {
    productRepository.clear();
    categoryRepository.clear();
  });

  describe('execute', () => {
    it('should return product when found', async () => {
      const result = await useCase.execute({ id: 'product-123' });

      expect(result.id).toBe('product-123');
      expect(result.name).toBe('Test Product');
      expect(result.price).toBe(100);
    });

    it('should throw NotFoundError when product not found', async () => {
      await expect(() =>
        useCase.execute({ id: 'non-existent' }),
      ).rejects.toThrow(NotFoundError);
      await expect(() =>
        useCase.execute({ id: 'non-existent' }),
      ).rejects.toThrow('Product with id non-existent not found');
    });
  });
});
