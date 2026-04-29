import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { SortOrder } from '../src/shared/types';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';
import { setupTestApp } from './helpers/setup-app';

interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedProductResponse {
  data: ProductResponse[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
  };
}

const getMockCreateProductBody = (
  overrides?: Partial<{
    name: string;
    description: string | null;
    price: number;
    categoryIds: string[];
  }>,
) => {
  return {
    name: 'Test Product',
    description: 'A test product',
    price: 99.9,
    categoryIds: ['placeholder'],
    ...overrides,
  };
};

describe('ProductController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await prisma.categoryOnProduct.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    await prisma.categoryOnProduct.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await app.close();
  });

  describe('POST /product', () => {
    it('should create a product with valid data', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const response = await request(app.getHttpServer())
        .post('/product')
        .send(getMockCreateProductBody({ categoryIds: [category.id] }))
        .expect(201);

      const body = response.body as ProductResponse;
      expect(body).toMatchObject({
        name: 'Test Product',
        description: 'A test product',
        price: 99.9,
        categoryIds: [category.id],
      });
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    it('should create a product with null description', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const response = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            description: null,
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const body = response.body as ProductResponse;
      expect(body.description).toBeNull();
    });

    it('should create a product with multiple categories', async () => {
      const cat1Response = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const cat2Response = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Accessories' })
        .expect(201);

      const cat1 = cat1Response.body as { id: string };
      const cat2 = cat2Response.body as { id: string };

      const response = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            categoryIds: [cat1.id, cat2.id],
          }),
        )
        .expect(201);

      const body = response.body as ProductResponse;
      expect(body.categoryIds).toHaveLength(2);
      expect(body.categoryIds).toContain(cat1.id);
      expect(body.categoryIds).toContain(cat2.id);
    });

    it('should return 400 when name is missing', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };
      const bodyWithoutName = {
        description: 'A test product',
        price: 99.9,
        categoryIds: [category.id],
      };

      await request(app.getHttpServer())
        .post('/product')
        .send(bodyWithoutName)
        .expect(400);
    });

    it('should return 400 when name is empty', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({ name: '', categoryIds: [category.id] }),
        )
        .expect(400);
    });

    it('should return 400 when price is negative', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({ price: -10, categoryIds: [category.id] }),
        )
        .expect(400);
    });

    it('should return 400 when categoryIds is empty', async () => {
      await request(app.getHttpServer())
        .post('/product')
        .send(getMockCreateProductBody({ categoryIds: [] }))
        .expect(400);
    });

    it('should return 400 when categoryIds contains invalid UUID', async () => {
      await request(app.getHttpServer())
        .post('/product')
        .send(getMockCreateProductBody({ categoryIds: ['not-a-valid-uuid'] }))
        .expect(400);
    });

    it('should return 404 when category does not exist', async () => {
      await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            categoryIds: ['a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'],
          }),
        )
        .expect(404);
    });
  });

  describe('GET /product/:id', () => {
    it('should return a product with valid id', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createResponse = await request(app.getHttpServer())
        .post('/product')
        .send(getMockCreateProductBody({ categoryIds: [category.id] }))
        .expect(201);

      const productId = (createResponse.body as { id: string }).id;

      const response = await request(app.getHttpServer())
        .get(`/product/${productId}`)
        .expect(200);

      const body = response.body as ProductResponse;
      expect(body.id).toBe(productId);
      expect(body.name).toBe('Test Product');
      expect(body.price).toBe(99.9);
    });

    it('should return 404 when product does not exist', async () => {
      await request(app.getHttpServer())
        .get('/product/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d')
        .expect(404);
    });

    it('should return 400 when id is invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/product/invalid-uuid')
        .expect(400);
    });
  });

  describe('GET /product', () => {
    beforeEach(async () => {
      const catResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const cat = catResponse.body as { id: string };

      await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Apple',
            price: 100,
            categoryIds: [cat.id],
          }),
        );

      await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Banana',
            price: 200,
            categoryIds: [cat.id],
          }),
        );

      await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Carrot',
            price: 50,
            description: 'Vegetables',
            categoryIds: [cat.id],
          }),
        );
    });

    it('should return paginated results', async () => {
      const response = await request(app.getHttpServer())
        .get('/product')
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toMatchObject({
        page: 1,
        perPage: 10,
      });
      expect(body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by query (name)', async () => {
      const response = await request(app.getHttpServer())
        .get('/product?query=Apple')
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBe(1);
      expect(body.data[0].name).toBe('Apple');
    });

    it('should filter by query (description)', async () => {
      const response = await request(app.getHttpServer())
        .get('/product?query=Vegetables')
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      expect(body.data.length).toBe(1);
      expect(body.data[0].name).toBe('Carrot');
    });

    it('should filter by categoryIds', async () => {
      const catResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Food' })
        .expect(201);

      const cat = catResponse.body as { id: string };

      await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Specific Product',
            price: 50,
            categoryIds: [cat.id],
          }),
        );

      const response = await request(app.getHttpServer())
        .get(`/product?categoryIds=${cat.id}`)
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      expect(body.data.length).toBe(1);
      expect(body.data[0].name).toBe('Specific Product');
    });

    it('should sort by name ascending', async () => {
      const response = await request(app.getHttpServer())
        .get(`/product?sortBy=name&sortOrder=${SortOrder.ASC}`)
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      const names = body.data.map((p) => p.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should sort by name descending', async () => {
      const response = await request(app.getHttpServer())
        .get(`/product?sortBy=name&sortOrder=${SortOrder.DESC}`)
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      const names = body.data.map((p) => p.name);
      const sorted = [...names].sort().reverse();
      expect(names).toEqual(sorted);
    });

    it('should sort by price ascending', async () => {
      const response = await request(app.getHttpServer())
        .get(`/product?sortBy=price&sortOrder=${SortOrder.ASC}`)
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      const prices = body.data.map((p) => p.price);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });

    it('should paginate with page and perPage', async () => {
      const response = await request(app.getHttpServer())
        .get('/product?page=1&perPage=2')
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      expect(body.data.length).toBeLessThanOrEqual(2);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.perPage).toBe(2);
      expect(body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('should return empty data when no matches', async () => {
      const response = await request(app.getHttpServer())
        .get('/product?query=NonExistent')
        .expect(200);

      const body = response.body as PaginatedProductResponse;
      expect(body.data).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe('PATCH /product/:id', () => {
    it('should update product with valid data', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createdResponse = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Original',
            description: 'Original desc',
            price: 100,
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const created = createdResponse.body as ProductResponse;

      const response = await request(app.getHttpServer())
        .patch(`/product/${created.id}`)
        .send({
          name: 'Updated',
          description: 'Updated desc',
          price: 200,
        })
        .expect(200);

      const body = response.body as ProductResponse;
      expect(body).toMatchObject({
        id: created.id,
        name: 'Updated',
        description: 'Updated desc',
        price: 200,
      });
    });

    it('should partially update (only name)', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createdResponse = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Original',
            price: 100,
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const created = createdResponse.body as ProductResponse;

      const response = await request(app.getHttpServer())
        .patch(`/product/${created.id}`)
        .send({ name: 'New Name' })
        .expect(200);

      const body = response.body as ProductResponse;
      expect(body).toMatchObject({
        name: 'New Name',
        price: 100,
      });
    });

    it('should partially update (only price)', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createdResponse = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Original',
            price: 100,
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const created = createdResponse.body as ProductResponse;

      const response = await request(app.getHttpServer())
        .patch(`/product/${created.id}`)
        .send({ price: 250 })
        .expect(200);

      const body = response.body as ProductResponse;
      expect(body).toMatchObject({
        name: 'Original',
        price: 250,
      });
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .patch('/product/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Test' })
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .patch('/product/invalid-uuid')
        .send({ name: 'Test' })
        .expect(400);
    });

    it('should return 400 when name is empty', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createdResponse = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Original',
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const created = createdResponse.body as ProductResponse;

      await request(app.getHttpServer())
        .patch(`/product/${created.id}`)
        .send({ name: '' })
        .expect(400);
    });

    it('should return 400 when price is negative', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createdResponse = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Original',
            price: 100,
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const created = createdResponse.body as ProductResponse;

      await request(app.getHttpServer())
        .patch(`/product/${created.id}`)
        .send({ price: -10 })
        .expect(400);
    });

    it('should return 400 when categoryIds is empty', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createdResponse = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Original',
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const created = createdResponse.body as ProductResponse;

      await request(app.getHttpServer())
        .patch(`/product/${created.id}`)
        .send({ categoryIds: [] })
        .expect(400);
    });

    it('should return 400 when categoryIds contains invalid UUID', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createdResponse = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Original',
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const created = createdResponse.body as ProductResponse;

      await request(app.getHttpServer())
        .patch(`/product/${created.id}`)
        .send({ categoryIds: ['not-a-valid-uuid'] })
        .expect(400);
    });

    it('should return 404 when category does not exist', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const category = categoryResponse.body as { id: string };

      const createdResponse = await request(app.getHttpServer())
        .post('/product')
        .send(
          getMockCreateProductBody({
            name: 'Original',
            categoryIds: [category.id],
          }),
        )
        .expect(201);

      const created = createdResponse.body as ProductResponse;

      await request(app.getHttpServer())
        .patch(`/product/${created.id}`)
        .send({ categoryIds: ['a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'] })
        .expect(404);
    });
  });
});
