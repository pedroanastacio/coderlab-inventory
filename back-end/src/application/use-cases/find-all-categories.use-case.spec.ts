import { FindAllCategoriesUseCase } from './find-all-categories.use-case';
import { InMemoryCategoryRepository } from '../../infra/database/in-memory/repositories/in-memory-category.repository';
import { Category } from '../../domain/entities/category.entity';
import { SortOrder } from '../../shared/types/sort-params.types';

const getMockFindAllCategoriesInput = (
  overrides?: Partial<{
    filters: { query?: string; parentId?: string };
    pagination: { page: number; perPage: number };
    sort: { sortBy: string; sortOrder: SortOrder };
  }>,
) => {
  return {
    filters: { query: undefined, parentId: undefined, ...overrides?.filters },
    pagination: { page: 1, perPage: 10, ...overrides?.pagination },
    sort: {
      sortBy: 'name' as const,
      sortOrder: SortOrder.ASC,
      ...overrides?.sort,
    },
  };
};

const createCategoryInMemory = async (
  repository: InMemoryCategoryRepository,
  data: { name: string; description?: string | null; parentId?: string | null },
) => {
  const category = new Category(data);
  return repository.create(category);
};

describe('FindAllCategoriesUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: FindAllCategoriesUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new FindAllCategoriesUseCase(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('execute', () => {
    it('should return empty result when no categories exist', async () => {
      const input = getMockFindAllCategoriesInput();

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should return all categories when they exist', async () => {
      await createCategoryInMemory(repository, { name: 'Electronics' });
      await createCategoryInMemory(repository, { name: 'Clothing' });
      await createCategoryInMemory(repository, { name: 'Books' });

      const input = getMockFindAllCategoriesInput();
      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
    });

    it('should filter categories by query in name', async () => {
      await createCategoryInMemory(repository, { name: 'Electronics' });
      await createCategoryInMemory(repository, { name: 'Smartphones' });
      await createCategoryInMemory(repository, { name: 'Laptops' });

      const input = getMockFindAllCategoriesInput({
        filters: { query: 'phone' },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Smartphones');
    });

    it('should filter categories by parentId', async () => {
      const parent = await createCategoryInMemory(repository, {
        name: 'Electronics',
      });
      await createCategoryInMemory(repository, {
        name: 'Smartphones',
        parentId: parent.id,
      });
      await createCategoryInMemory(repository, {
        name: 'Laptops',
        parentId: parent.id,
      });
      await createCategoryInMemory(repository, { name: 'Clothing' });

      const input = getMockFindAllCategoriesInput({
        filters: { parentId: parent.id },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((c) => c.parentId === parent.id)).toBe(true);
    });

    it('should paginate results correctly', async () => {
      for (let i = 1; i <= 15; i++) {
        await createCategoryInMemory(repository, { name: `Category ${i}` });
      }

      const input = getMockFindAllCategoriesInput({
        pagination: { page: 1, perPage: 5 },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(5);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.pageCount).toBe(3);
    });

    it('should sort results by sortBy and sortOrder', async () => {
      await createCategoryInMemory(repository, { name: 'Zebra' });
      await createCategoryInMemory(repository, { name: 'Apple' });
      await createCategoryInMemory(repository, { name: 'Banana' });

      const inputAsc = getMockFindAllCategoriesInput({
        sort: { sortBy: 'name', sortOrder: SortOrder.ASC },
      });
      const resultAsc = await useCase.execute(inputAsc);

      expect(resultAsc.data[0].name).toBe('Apple');
      expect(resultAsc.data[1].name).toBe('Banana');
      expect(resultAsc.data[2].name).toBe('Zebra');

      const inputDesc = getMockFindAllCategoriesInput({
        sort: { sortBy: 'name', sortOrder: SortOrder.DESC },
      });
      const resultDesc = await useCase.execute(inputDesc);

      expect(resultDesc.data[0].name).toBe('Zebra');
      expect(resultDesc.data[1].name).toBe('Banana');
      expect(resultDesc.data[2].name).toBe('Apple');
    });

    it('should return empty when page exceeds total pages', async () => {
      for (let i = 1; i <= 10; i++) {
        await createCategoryInMemory(repository, { name: `Category ${i}` });
      }

      const input = getMockFindAllCategoriesInput({
        pagination: { page: 3, perPage: 5 },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.pageCount).toBe(2);
    });

    it('should combine query and parentId filters', async () => {
      const parent = await createCategoryInMemory(repository, {
        name: 'Electronics',
      });
      const otherParent = await createCategoryInMemory(repository, {
        name: 'Clothing',
      });
      await createCategoryInMemory(repository, {
        name: 'Smartphones',
        parentId: parent.id,
      });
      await createCategoryInMemory(repository, {
        name: 'Smart TVs',
        parentId: parent.id,
      });
      await createCategoryInMemory(repository, {
        name: 'Jackets',
        parentId: otherParent.id,
      });

      const input = getMockFindAllCategoriesInput({
        filters: { query: 'smart', parentId: parent.id },
      });

      const result = await useCase.execute(input);

      expect(result.data).toHaveLength(2);
      expect(
        result.data.every((c) => c.name.toLowerCase().includes('smart')),
      ).toBe(true);
    });

    it('should return correct pagination metadata', async () => {
      await createCategoryInMemory(repository, { name: 'Electronics' });
      await createCategoryInMemory(repository, { name: 'Clothing' });

      const input = getMockFindAllCategoriesInput({
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
  });
});
