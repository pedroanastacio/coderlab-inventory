/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { SortOrder } from '../src/shared/types';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';
import { setupTestApp } from './helpers/setup-app';

interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedCategoryResponse {
  data: CategoryResponse[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}

describe('CategoryController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    await prisma.category.deleteMany();
    await app.close();
  });

  describe('POST /category', () => {
    it('should create a category with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Electronics' })
        .expect(201);

      const body = response.body as CategoryResponse;
      expect(body).toMatchObject({
        name: 'Electronics',
        description: null,
        parentId: null,
      });
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    it('should create a category with description and parentId', async () => {
      const parentResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Parent Category' })
        .expect(201);

      const parent = parentResponse.body as CategoryResponse;

      const response = await request(app.getHttpServer())
        .post('/category')
        .send({
          name: 'Sub Category',
          description: 'A sub category',
          parentId: parent.id,
        })
        .expect(201);

      const body = response.body as CategoryResponse;
      expect(body).toMatchObject({
        name: 'Sub Category',
        description: 'A sub category',
        parentId: parent.id,
      });
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .send({ description: 'No name' })
        .expect(400);
    });

    it('should return 400 when name is empty', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .send({ name: '' })
        .expect(400);
    });

    it('should return 400 when parentId is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Test', parentId: 'invalid-uuid' })
        .expect(400);
    });

    it('should return 404 when parentId does not exist', async () => {
      await request(app.getHttpServer())
        .post('/category')
        .send({
          name: 'Test',
          parentId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });
  });

  describe('GET /category/:id', () => {
    it('should return category for valid ID', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'To Find', description: 'Found it' })
        .expect(201);

      const created = createdResponse.body as CategoryResponse;

      const response = await request(app.getHttpServer())
        .get(`/category/${created.id}`)
        .expect(200);

      const body = response.body as CategoryResponse;
      expect(body).toMatchObject({
        id: created.id,
        name: 'To Find',
        description: 'Found it',
      });
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .get('/category/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/category/invalid-uuid')
        .expect(400);
    });
  });

  describe('GET /category', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Apple', description: 'Fruits' });

      await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Banana', description: 'Fruits' });

      await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Carrot', description: 'Vegetables' });
    });

    it('should return paginated results', async () => {
      const response = await request(app.getHttpServer())
        .get('/category')
        .expect(200);

      const body = response.body as PaginatedCategoryResponse;
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toMatchObject({
        page: 1,
        perPage: 10,
      });
      expect(body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by query (name)', async () => {
      const response = await request(app.getHttpServer())
        .get('/category?query=Apple')
        .expect(200);

      const body = response.body as PaginatedCategoryResponse;
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBe(1);
      expect(body.data[0].name).toBe('Apple');
    });

    it('should filter by query (description)', async () => {
      const response = await request(app.getHttpServer())
        .get('/category?query=Fruits')
        .expect(200);

      const body = response.body as PaginatedCategoryResponse;
      expect(body.data.length).toBe(2);
    });

    it('should filter by parentId', async () => {
      const parentResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Parent' })
        .expect(201);

      const parent = parentResponse.body as CategoryResponse;

      await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Child', parentId: parent.id });

      const response = await request(app.getHttpServer())
        .get(`/category?parentId=${parent.id}`)
        .expect(200);

      const body = response.body as PaginatedCategoryResponse;
      expect(body.data.length).toBe(1);
      expect(body.data[0].parentId).toBe(parent.id);
    });

    it('should sort by name ascending', async () => {
      const response = await request(app.getHttpServer())
        .get(`/category?sortBy=name&sortOrder=${SortOrder.ASC}`)
        .expect(200);

      const body = response.body as PaginatedCategoryResponse;
      const names = body.data.map((c) => c.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should sort by name descending', async () => {
      const response = await request(app.getHttpServer())
        .get(`/category?sortBy=name&sortOrder=${SortOrder.DESC}`)
        .expect(200);

      const body = response.body as PaginatedCategoryResponse;
      const names = body.data.map((c) => c.name);
      const sorted = [...names].sort().reverse();
      expect(names).toEqual(sorted);
    });

    it('should paginate with page and perPage', async () => {
      const response = await request(app.getHttpServer())
        .get('/category?page=1&perPage=2')
        .expect(200);

      const body = response.body as PaginatedCategoryResponse;
      expect(body.data.length).toBeLessThanOrEqual(2);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.perPage).toBe(2);
      expect(body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('should return empty data when no matches', async () => {
      const response = await request(app.getHttpServer())
        .get('/category?query=NonExistent')
        .expect(200);

      const body = response.body as PaginatedCategoryResponse;
      expect(body.data).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe('PATCH /category/:id', () => {
    it('should update category with valid data', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Original', description: 'Original desc' })
        .expect(201);

      const created = createdResponse.body as CategoryResponse;

      const response = await request(app.getHttpServer())
        .patch(`/category/${created.id}`)
        .send({ name: 'Updated', description: 'Updated desc' })
        .expect(200);

      const body = response.body as CategoryResponse;
      expect(body).toMatchObject({
        id: created.id,
        name: 'Updated',
        description: 'Updated desc',
      });
    });

    it('should partially update (only name)', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Partial', description: 'Keep this' })
        .expect(201);

      const created = createdResponse.body as CategoryResponse;

      const response = await request(app.getHttpServer())
        .patch(`/category/${created.id}`)
        .send({ name: 'New Name' })
        .expect(200);

      const body = response.body as CategoryResponse;
      expect(body).toMatchObject({
        name: 'New Name',
        description: 'Keep this',
      });
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .patch('/category/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Test' })
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .patch('/category/invalid-uuid')
        .send({ name: 'Test' })
        .expect(400);
    });

    it('should return 404 if new parentId does not exist', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Child' })
        .expect(201);

      const created = createdResponse.body as CategoryResponse;

      await request(app.getHttpServer())
        .patch(`/category/${created.id}`)
        .send({ parentId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });

    it('should prevent setting own ID as parentId', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'Self Parent' })
        .expect(201);

      const created = createdResponse.body as CategoryResponse;

      await request(app.getHttpServer())
        .patch(`/category/${created.id}`)
        .send({ parentId: created.id })
        .expect(400);
    });
  });

  describe('DELETE /category/:id', () => {
    it('should delete existing category', async () => {
      const createdResponse = await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'To Delete' })
        .expect(201);

      const created = createdResponse.body as CategoryResponse;

      await request(app.getHttpServer())
        .delete(`/category/${created.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/category/${created.id}`)
        .expect(404);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .delete('/category/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .delete('/category/invalid-uuid')
        .expect(400);
    });
  });
});
