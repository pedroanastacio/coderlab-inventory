import { FindAllProductsUseCase } from './find-all-products.use-case';
import { InMemoryProductRepository } from '../../../infra/database/in-memory/repositories/in-memory-product.repository';
import { Product } from '../../../domain/entities/product/product.entity';
import { SortOrder } from '../../../shared/types/sort-params.types';

const getMockFindAllProductsInput = (
  overrides?: Partial<{
    filters: { query?: string; categoryIds?: string[] };
    pagination: { page: number; perPage: number };
    sort: { sortBy: string; sortOrder: SortOrder };
  }>,
) => {
  return {
    filters: {
      query: undefined,
      categoryIds: undefined,
      ...overrides?.filters,
    },
    pagination: { page: 1, perPage: 10, ...overrides?.pagination },
    sort: {
      sortBy: 'createdAt' as const,
      sortOrder: SortOrder.ASC,
      ...overrides?.sort,
    },
  };
};

const createProductInMemory = async (
  repository: InMemoryProductRepository,
  data: {
    name: string;
    description?: string | null;
    price: number;
    categoryIds?: string[];
  },
) => {
  const product = new Product({
    name: data.name,
    description: data.description,
    price: data.price,
    categoryIds: data.categoryIds || ['default-category-id'],
  });
  return repository.create(product);
};

describe('FindAllProductsUseCase', () => {
  let repository: InMemoryProductRepository;
  let useCase: FindAllProductsUseCase;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
    useCase = new FindAllProductsUseCase(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('execute', () => {
    it('should return empty result when no products exist', async () => {
      const input = getMockFindAllProductsInput();

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should return all products when they exist', async () => {
      await createProductInMemory(repository, {
        name: 'Product A',
        price: 100,
      });
      await createProductInMemory(repository, {
        name: 'Product B',
        price: 200,
      });
      await createProductInMemory(repository, {
        name: 'Product C',
        price: 300,
      });

      const input = getMockFindAllProductsInput();
      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
    });

    it('should filter products by query in name', async () => {
      await createProductInMemory(repository, {
        name: 'Laptop Pro',
        price: 1500,
      });
      await createProductInMemory(repository, { name: 'Phone X', price: 999 });
      await createProductInMemory(repository, {
        name: 'Tablet Mini',
        price: 499,
      });

      const input = getMockFindAllProductsInput({
        filters: { query: 'phone' },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Phone X');
    });

    it('should filter products by query in description', async () => {
      await createProductInMemory(repository, {
        name: 'Laptop',
        description: 'High performance computer',
        price: 1500,
      });
      await createProductInMemory(repository, {
        name: 'Mouse',
        description: 'Wireless mouse',
        price: 50,
      });

      const input = getMockFindAllProductsInput({
        filters: { query: 'wireless' },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Mouse');
    });

    it('should filter products by categoryId', async () => {
      const categoryId = 'cat-123';

      await createProductInMemory(repository, {
        name: 'Product A',
        price: 100,
        categoryIds: [categoryId],
      });
      await createProductInMemory(repository, {
        name: 'Product B',
        price: 200,
        categoryIds: [categoryId],
      });
      await createProductInMemory(repository, {
        name: 'Product C',
        price: 300,
        categoryIds: ['other-cat'],
      });

      const input = getMockFindAllProductsInput({
        filters: { categoryIds: [categoryId] },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((p) => p.categoryIds.includes(categoryId))).toBe(
        true,
      );
    });

    it('should paginate results correctly', async () => {
      for (let i = 1; i <= 15; i++) {
        await createProductInMemory(repository, {
          name: `Product ${i}`,
          price: 100 * i,
        });
      }

      const input = getMockFindAllProductsInput({
        pagination: { page: 1, perPage: 5 },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(5);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.pageCount).toBe(3);
    });

    it('should sort results by sortBy and sortOrder', async () => {
      await createProductInMemory(repository, { name: 'Zebra', price: 300 });
      await createProductInMemory(repository, { name: 'Apple', price: 100 });
      await createProductInMemory(repository, { name: 'Banana', price: 200 });

      const inputAsc = getMockFindAllProductsInput({
        sort: { sortBy: 'name', sortOrder: SortOrder.ASC },
      });
      const resultAsc = await useCase.execute(inputAsc);

      expect(resultAsc.data[0].name).toBe('Apple');
      expect(resultAsc.data[1].name).toBe('Banana');
      expect(resultAsc.data[2].name).toBe('Zebra');

      const inputDesc = getMockFindAllProductsInput({
        sort: { sortBy: 'name', sortOrder: SortOrder.DESC },
      });
      const resultDesc = await useCase.execute(inputDesc);

      expect(resultDesc.data[0].name).toBe('Zebra');
      expect(resultDesc.data[1].name).toBe('Banana');
      expect(resultDesc.data[2].name).toBe('Apple');
    });

    it('should return empty when page exceeds total pages', async () => {
      for (let i = 1; i <= 10; i++) {
        await createProductInMemory(repository, {
          name: `Product ${i}`,
          price: 100 * i,
        });
      }

      const input = getMockFindAllProductsInput({
        pagination: { page: 3, perPage: 5 },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.pageCount).toBe(2);
    });

    it('should combine query and categoryId filters', async () => {
      const categoryId = 'cat-123';

      await createProductInMemory(repository, {
        name: 'Laptop Pro',
        price: 1500,
        categoryIds: [categoryId],
      });
      await createProductInMemory(repository, {
        name: 'Laptop Air',
        price: 999,
        categoryIds: [categoryId],
      });
      await createProductInMemory(repository, {
        name: 'Phone X',
        price: 899,
        categoryIds: ['other-cat'],
      });

      const input = getMockFindAllProductsInput({
        filters: { query: 'laptop', categoryIds: [categoryId] },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(2);
      expect(
        result.data.every((p) => p.name.toLowerCase().includes('laptop')),
      ).toBe(true);
    });

    it('should return correct pagination metadata', async () => {
      await createProductInMemory(repository, {
        name: 'Product A',
        price: 100,
      });
      await createProductInMemory(repository, {
        name: 'Product B',
        price: 200,
      });

      const input = getMockFindAllProductsInput({
        pagination: { page: 1, perPage: 10 },
      });

      const result = await useCase.execute(input);

      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        perPage: 10,
        pageCount: 1,
      });
    });

    it('should sort by price ascending', async () => {
      await createProductInMemory(repository, { name: 'P3', price: 300 });
      await createProductInMemory(repository, { name: 'P1', price: 100 });
      await createProductInMemory(repository, { name: 'P2', price: 200 });

      const inputAsc = getMockFindAllProductsInput({
        sort: { sortBy: 'price', sortOrder: SortOrder.ASC },
      });
      const resultAsc = await useCase.execute(inputAsc);

      expect(resultAsc.data[0].price).toBe(100);
      expect(resultAsc.data[1].price).toBe(200);
      expect(resultAsc.data[2].price).toBe(300);
    });
  });
});
