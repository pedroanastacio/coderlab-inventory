import { Product, ProductProps } from './product.entity';
import { ValidationError } from '../../errors/validation.error';

describe('Product', () => {
  const getMockProductProps = (
    overrides?: Partial<ProductProps>,
  ): ProductProps => {
    return {
      name: 'Test Product',
      description: 'A test product',
      price: 100,
      categoryIds: ['cat-123'],
      ...overrides,
    };
  };

  describe('Constructor', () => {
    it('should create product with valid props', () => {
      const props = getMockProductProps();
      const product = new Product(props);

      expect(product.id).toBeDefined();
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('A test product');
      expect(product.price).toBe(100);
      expect(product.categoryIds).toEqual(['cat-123']);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should auto-generate ID when not provided', () => {
      const props = getMockProductProps();
      const product = new Product(props);

      expect(product.id).toBeDefined();
      expect(typeof product.id).toBe('string');
    });

    it('should use provided ID when passed', () => {
      const props = getMockProductProps({ id: 'custom-id-123' });
      const product = new Product(props);

      expect(product.id).toBe('custom-id-123');
    });

    it('should default description to null when undefined', () => {
      const props = getMockProductProps({ description: undefined });
      const product = new Product(props);

      expect(product.description).toBeNull();
    });

    it('should preserve description when provided', () => {
      const props = getMockProductProps({ description: 'Custom description' });
      const product = new Product(props);

      expect(product.description).toBe('Custom description');
    });

    it('should default createdAt and updatedAt to new Date when not provided', () => {
      const before = new Date();
      const props = getMockProductProps();
      const product = new Product(props);
      const after = new Date();

      expect(product.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(product.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(product.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided dates when passed', () => {
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');
      const props = getMockProductProps({ createdAt, updatedAt });
      const product = new Product(props);

      expect(product.createdAt).toEqual(createdAt);
      expect(product.updatedAt).toEqual(updatedAt);
    });
  });

  describe('Constructor Validation', () => {
    it('should throw ValidationError when name is empty', () => {
      const props = getMockProductProps({ name: '' });

      expect(() => new Product(props)).toThrow(ValidationError);
      expect(() => new Product(props)).toThrow('Product name is required');
    });

    it('should throw ValidationError when name is only whitespace', () => {
      const props = getMockProductProps({ name: '   ' });

      expect(() => new Product(props)).toThrow(ValidationError);
      expect(() => new Product(props)).toThrow('Product name is required');
    });

    it('should throw ValidationError when name is undefined', () => {
      const props = getMockProductProps({
        name: undefined as unknown as string,
      });

      expect(() => new Product(props)).toThrow(ValidationError);
      expect(() => new Product(props)).toThrow('Product name is required');
    });

    it('should throw ValidationError when price is negative', () => {
      const props = getMockProductProps({ price: -10 });

      expect(() => new Product(props)).toThrow(ValidationError);
      expect(() => new Product(props)).toThrow(
        'Product price cannot be negative',
      );
    });

    it('should throw ValidationError when categoryIds is empty array', () => {
      const props = getMockProductProps({ categoryIds: [] });

      expect(() => new Product(props)).toThrow(ValidationError);
      expect(() => new Product(props)).toThrow(
        'Product must belong to at least one category',
      );
    });

    it('should throw ValidationError when categoryIds is undefined', () => {
      const props = getMockProductProps({
        categoryIds: undefined as unknown as string[],
      });

      expect(() => new Product(props)).toThrow(ValidationError);
      expect(() => new Product(props)).toThrow(
        'Product must belong to at least one category',
      );
    });
  });

  describe('Update', () => {
    let product: Product;

    beforeEach(() => {
      product = new Product(getMockProductProps());
    });

    it('should update name when provided', () => {
      product.update({ name: 'New Name' });

      expect(product.name).toBe('New Name');
    });

    it('should throw ValidationError when updating with invalid name', () => {
      expect(() => product.update({ name: '' })).toThrow(ValidationError);
      expect(() => product.update({ name: '' })).toThrow(
        'Product name is required',
      );
    });

    it('should update description when provided', () => {
      product.update({ description: 'New Description' });

      expect(product.description).toBe('New Description');
    });

    it('should update description to null when provided', () => {
      product.update({ description: null });

      expect(product.description).toBeNull();
    });

    it('should update price when provided', () => {
      product.update({ price: 200 });

      expect(product.price).toBe(200);
    });

    it('should throw ValidationError when updating with negative price', () => {
      expect(() => product.update({ price: -50 })).toThrow(ValidationError);
      expect(() => product.update({ price: -50 })).toThrow(
        'Product price cannot be negative',
      );
    });

    it('should update categoryIds when provided', () => {
      product.update({ categoryIds: ['cat-456'] });

      expect(product.categoryIds).toEqual(['cat-456']);
    });

    it('should throw ValidationError when updating with empty categoryIds', () => {
      expect(() => product.update({ categoryIds: [] })).toThrow(
        ValidationError,
      );
      expect(() => product.update({ categoryIds: [] })).toThrow(
        'Product must belong to at least one category',
      );
    });

    it('should only update provided fields (partial update)', () => {
      const originalPrice = product.price;
      const originalCategoryIds = product.categoryIds;

      product.update({ name: 'Partial Update' });

      expect(product.name).toBe('Partial Update');
      expect(product.price).toBe(originalPrice);
      expect(product.categoryIds).toEqual(originalCategoryIds);
    });
  });
});
