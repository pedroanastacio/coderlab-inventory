import { Category, CategoryProps } from './category.entity';
import { ValidationError } from '../errors/validation.error';

describe('Category', () => {
  const getMockCategoryProps = (
    overrides?: Partial<CategoryProps>,
  ): CategoryProps => {
    return {
      name: 'Electronics',
      description: null,
      parentId: null,
      ...overrides,
    };
  };

  describe('Constructor', () => {
    it('should create category with valid name', () => {
      const props = getMockCategoryProps();
      const category = new Category(props);

      expect(category.id).toBeDefined();
      expect(category.name).toBe('Electronics');
      expect(category.description).toBeNull();
      expect(category.parentId).toBeNull();
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when name is empty', () => {
      const props = getMockCategoryProps({ name: '' });

      expect(() => new Category(props)).toThrow(ValidationError);
      expect(() => new Category(props)).toThrow('Category name is required');
    });

    it('should throw error when name is undefined', () => {
      const props = getMockCategoryProps({
        name: undefined as unknown as string,
      });

      expect(() => new Category(props)).toThrow(ValidationError);
      expect(() => new Category(props)).toThrow('Category name is required');
    });

    it('should throw error when parentId equals id', () => {
      const fixedId = 'category-123';
      const props = getMockCategoryProps({
        id: fixedId,
        parentId: fixedId,
      });

      expect(() => new Category(props)).toThrow(ValidationError);
      expect(() => new Category(props)).toThrow(
        'Category cannot be related to itself',
      );
    });

    it('should default description to null when undefined', () => {
      const props = getMockCategoryProps({ description: undefined });
      const category = new Category(props);

      expect(category.description).toBeNull();
    });

    it('should default parentId to null when undefined', () => {
      const props = getMockCategoryProps({ parentId: undefined });
      const category = new Category(props);

      expect(category.parentId).toBeNull();
    });

    it('should use provided id when passed', () => {
      const props = getMockCategoryProps({ id: 'custom-id' });
      const category = new Category(props);

      expect(category.id).toBe('custom-id');
    });

    it('should use provided dates when passed', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      const props = getMockCategoryProps({ createdAt, updatedAt });
      const category = new Category(props);

      expect(category.createdAt).toEqual(createdAt);
      expect(category.updatedAt).toEqual(updatedAt);
    });
  });

  describe('validateHierarchy', () => {
    it('should throw error when parentId equals category id', () => {
      const category = new Category(
        getMockCategoryProps({ id: 'cat-123', name: 'Test' }),
      );

      expect(() => category.validateHierarchy('cat-123')).toThrow(
        ValidationError,
      );
      expect(() => category.validateHierarchy('cat-123')).toThrow(
        'Category cannot be related to itself',
      );
    });

    it('should not throw when parentId is different from id', () => {
      const category = new Category(
        getMockCategoryProps({ id: 'cat-123', name: 'Test' }),
      );

      expect(() => category.validateHierarchy('parent-456')).not.toThrow();
    });
  });
});
