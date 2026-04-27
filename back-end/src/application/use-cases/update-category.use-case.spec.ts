import { NotFoundError } from '../../domain/errors/not-found.error';
import { UpdateCategoryUseCase } from './update-category.use-case';
import { InMemoryCategoryRepository } from '../../infra/database/in-memory/repositories/in-memory-category.repository';
import { Category } from '../../domain/entities/category.entity';

const getMockUpdateCategoryInput = (
  overrides?: Partial<{
    id: string;
    data: {
      name?: string;
      description?: string | null;
      parentId?: string | null;
    };
  }>,
) => {
  return {
    id: 'category-123',
    data: {
      name: undefined,
      description: undefined,
      parentId: undefined,
      ...overrides?.data,
    },
    ...overrides,
  };
};

const createCategoryInMemory = async (
  repository: InMemoryCategoryRepository,
  data: {
    id?: string;
    name: string;
    description?: string | null;
    parentId?: string | null;
  },
) => {
  const category = new Category(data);
  return repository.create(category);
};

describe('UpdateCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: UpdateCategoryUseCase;

  beforeEach(async () => {
    repository = new InMemoryCategoryRepository();
    useCase = new UpdateCategoryUseCase(repository);

    await createCategoryInMemory(repository, {
      id: 'category-123',
      name: 'Electronics',
      description: null,
      parentId: null,
    });
  });

  afterEach(() => {
    repository.clear();
  });

  describe('execute', () => {
    it('should update category name', async () => {
      const input = getMockUpdateCategoryInput({
        id: 'category-123',
        data: { name: 'Updated Electronics' },
      });

      const result = await useCase.execute(input);

      expect(result.name).toBe('Updated Electronics');
    });

    it('should update category description', async () => {
      const input = getMockUpdateCategoryInput({
        id: 'category-123',
        data: { description: 'New description' },
      });

      const result = await useCase.execute(input);

      expect(result.description).toBe('New description');
    });

    it('should throw NotFoundError when category does not exist', async () => {
      const input = getMockUpdateCategoryInput({
        id: 'non-existent',
        data: { name: 'New Name' },
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(NotFoundError);
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should throw NotFoundError when parent does not exist', async () => {
      const input = getMockUpdateCategoryInput({
        id: 'category-123',
        data: { parentId: 'non-existent-parent' },
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(NotFoundError);
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Parent category not found',
      );
    });

    it('should update category with valid parent', async () => {
      const parent = await createCategoryInMemory(repository, {
        id: 'parent-category',
        name: 'Parent Category',
      });

      const input = getMockUpdateCategoryInput({
        id: 'category-123',
        data: { parentId: parent.id },
      });

      const result = await useCase.execute(input);

      expect(result.parentId).toBe(parent.id);
    });
  });
});
