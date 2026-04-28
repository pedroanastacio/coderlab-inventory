import { NotFoundError } from '../../../domain/errors/not-found.error';
import { DeleteCategoryUseCase } from './delete-category.use-case';
import { InMemoryCategoryRepository } from '../../../infra/database/in-memory/repositories/in-memory-category.repository';
import { Category } from '../../../domain/entities/category.entity';

const getMockDeleteCategoryInput = (
  overrides?: Partial<{
    id: string;
  }>,
) => {
  return {
    id: 'category-123',
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

describe('DeleteCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: DeleteCategoryUseCase;

  beforeEach(async () => {
    repository = new InMemoryCategoryRepository();
    useCase = new DeleteCategoryUseCase(repository);

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
    it('should delete category when exists', async () => {
      const input = getMockDeleteCategoryInput({ id: 'category-123' });

      await useCase.execute(input);

      const deletedCategory = await repository.findById('category-123');
      expect(deletedCategory).toBeNull();
    });

    it('should throw NotFoundError when category does not exist', async () => {
      const input = getMockDeleteCategoryInput({ id: 'non-existent' });

      await expect(() => useCase.execute(input)).rejects.toThrow(NotFoundError);
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Category not found',
      );
    });
  });
});
