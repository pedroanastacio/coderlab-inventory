import { NotFoundError } from '../../../domain/errors/not-found.error';
import { DeleteProductUseCase } from './delete-product.use-case';
import { InMemoryProductRepository } from '../../../infra/database/in-memory/repositories/in-memory-product.repository';
import { InMemoryCategoryRepository } from '../../../infra/database/in-memory/repositories/in-memory-category.repository';
import { Product } from '../../../domain/entities/product/product.entity';
import { Category } from '../../../domain/entities/category/category.entity';

const getMockDeleteProductInput = (
  overrides?: Partial<{
    id: string;
  }>,
) => {
  return {
    id: 'product-123',
    ...overrides,
  };
};

const createProductInMemory = async (
  repository: InMemoryProductRepository,
  data: {
    id?: string;
    name: string;
    description?: string | null;
    price: number;
    categoryIds: string[];
  },
) => {
  const product = new Product(data);
  return repository.create(product);
};

describe('DeleteProductUseCase', () => {
  let productRepository: InMemoryProductRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let useCase: DeleteProductUseCase;

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    categoryRepository = new InMemoryCategoryRepository();

    const category = new Category({
      id: 'category-123',
      name: 'Test Category',
      description: null,
      parentId: null,
    });
    await categoryRepository.create(category);

    useCase = new DeleteProductUseCase(productRepository);

    await createProductInMemory(productRepository, {
      id: 'product-123',
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      categoryIds: ['category-123'],
    });
  });

  afterEach(() => {
    productRepository.clear();
    categoryRepository.clear();
  });

  describe('execute', () => {
    it('should delete product when exists', async () => {
      const input = getMockDeleteProductInput({ id: 'product-123' });

      await useCase.execute(input);

      const deletedProduct = await productRepository.findById('product-123');
      expect(deletedProduct).toBeNull();
    });

    it('should throw NotFoundError when product does not exist', async () => {
      const input = getMockDeleteProductInput({ id: 'non-existent' });

      await expect(() => useCase.execute(input)).rejects.toThrow(NotFoundError);
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Product not found',
      );
    });
  });
});
