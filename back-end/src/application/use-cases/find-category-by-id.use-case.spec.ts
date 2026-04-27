import { NotFoundException } from '@nestjs/common';
import { FindCategoryByIdUseCase } from './find-category-by-id.use-case';
import { InMemoryCategoryRepository } from '../../infra/database/in-memory/repositories/in-memory-category.repository';
import { Category } from '../../domain/entities/category.entity';

const getMockCategory = (
  overrides?: Partial<{
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
  }>,
) => {
  return new Category({
    id: 'category-123',
    name: 'Electronics',
    description: null,
    parentId: null,
    ...overrides,
  });
};

describe('FindCategoryByIdUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: FindCategoryByIdUseCase;

  beforeEach(async () => {
    repository = new InMemoryCategoryRepository();
    useCase = new FindCategoryByIdUseCase(repository);

    await repository.create(getMockCategory());
  });

  afterEach(() => {
    repository.clear();
  });

  describe('execute', () => {
    it('should return category when found', async () => {
      const result = await useCase.execute({ id: 'category-123' });

      expect(result.id).toBe('category-123');
      expect(result.name).toBe('Electronics');
    });

    it('should throw NotFoundException when category not found', async () => {
      await expect(() =>
        useCase.execute({ id: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
      await expect(() =>
        useCase.execute({ id: 'non-existent' }),
      ).rejects.toThrow('Category with id non-existent not found');
    });
  });
});
