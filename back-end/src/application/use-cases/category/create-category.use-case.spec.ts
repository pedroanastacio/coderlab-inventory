import { NotFoundError } from '../../../domain/errors/not-found.error';
import { CreateCategoryUseCase } from './create-category.use-case';
import { InMemoryCategoryRepository } from '../../../infra/database/in-memory/repositories/in-memory-category.repository';

const getMockCreateCategoryInput = (
  overrides?: Partial<{
    name: string;
    description: string | null;
    parentId: string | null;
  }>,
) => {
  return {
    name: 'Electronics',
    description: null,
    parentId: null,
    ...overrides,
  };
};

describe('CreateCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('execute', () => {
    it('should create category with valid input', async () => {
      const input = getMockCreateCategoryInput();

      const result = await useCase.execute(input);

      expect(result.name).toBe('Electronics');
      expect(result.description).toBeNull();
      expect(result.parentId).toBeNull();
      expect(result.id).toBeDefined();
    });

    it('should create category with description', async () => {
      const description = 'Electronic devices and accessories';

      const input = getMockCreateCategoryInput({
        name: 'Electronics',
        description,
      });

      const result = await useCase.execute(input);

      expect(result.description).toBe(description);
    });

    it('should throw NotFoundError when parent does not exist', async () => {
      const input = getMockCreateCategoryInput({
        name: 'Smartphones',
        parentId: 'non-existent-parent',
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(NotFoundError);
      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Parent category not found',
      );
    });

    it('should create category with valid parent', async () => {
      const parentInput = getMockCreateCategoryInput({ name: 'Electronics' });
      const parentCategory = await useCase.execute(parentInput);

      const input = getMockCreateCategoryInput({
        name: 'Smartphones',
        parentId: parentCategory.id,
      });

      const result = await useCase.execute(input);

      expect(result.parentId).toBe(parentCategory.id);
    });
  });
});
