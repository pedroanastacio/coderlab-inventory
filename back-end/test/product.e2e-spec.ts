import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
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
});
