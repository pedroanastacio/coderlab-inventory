import { http, HttpResponse } from 'msw'
import { db } from './db'
import type { ProductResponseDto, CategoryResponseDto } from '@/api/generated/model'

function paginate<T>(items: T[], page: number, perPage: number) {
  const start = (page - 1) * perPage
  const paginated = items.slice(start, start + perPage)
  return {
    data: paginated,
    pagination: {
      page,
      perPage,
      total: items.length,
      pageCount: Math.ceil(items.length / perPage),
    },
  }
}

export const handlers = [
  // ── Products ──
  http.get('*/product', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('query')?.toLowerCase() || ''
    const page = Number(url.searchParams.get('page')) || 1
    const perPage = Number(url.searchParams.get('perPage')) || 10
    const all = Array.from(db.products.values())
    const filtered = query
      ? all.filter((p) => p.name.toLowerCase().includes(query))
      : all
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  http.get('*/product/:id', ({ params }) => {
    const product = db.products.get(params.id as string)
    if (!product) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(product)
  }),

  http.post('*/product', async ({ request }) => {
    const body = (await request.json()) as any
    const id = String(db.nextProductId++)
    const now = new Date().toISOString()
    const product: ProductResponseDto = {
      id,
      name: body.name,
      description: body.description ?? null,
      price: body.price,
      categoryIds: body.categoryIds ?? [],
      createdAt: now,
      updatedAt: now,
    }
    db.products.set(id, product)
    return HttpResponse.json(product, { status: 201 })
  }),

  http.patch('*/product/:id', async ({ params, request }) => {
    const body = (await request.json()) as any
    const existing = db.products.get(params.id as string)
    if (!existing) return new HttpResponse(null, { status: 404 })
    const updated: ProductResponseDto = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    }
    db.products.set(params.id as string, updated)
    return HttpResponse.json(updated)
  }),

  http.delete('*/product/:id', ({ params }) => {
    db.products.delete(params.id as string)
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Categories ──
  http.get('*/category', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('query')?.toLowerCase() || ''
    const page = Number(url.searchParams.get('page')) || 1
    const perPage = Number(url.searchParams.get('perPage')) || 10
    const all = Array.from(db.categories.values())
    const filtered = query
      ? all.filter((c) => c.name.toLowerCase().includes(query))
      : all
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  http.get('*/category/:id', ({ params }) => {
    const category = db.categories.get(params.id as string)
    if (!category) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(category)
  }),

  http.post('*/category', async ({ request }) => {
    const body = (await request.json()) as any
    const id = String(db.nextCategoryId++)
    const now = new Date().toISOString()
    const category: CategoryResponseDto = {
      id,
      name: body.name,
      description: body.description ?? null,
      parentId: body.parentId ?? null,
      createdAt: now,
      updatedAt: now,
    }
    db.categories.set(id, category)
    return HttpResponse.json(category, { status: 201 })
  }),

  http.patch('*/category/:id', async ({ params, request }) => {
    const body = (await request.json()) as any
    const existing = db.categories.get(params.id as string)
    if (!existing) return new HttpResponse(null, { status: 404 })
    const updated: CategoryResponseDto = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    }
    db.categories.set(params.id as string, updated)
    return HttpResponse.json(updated)
  }),

  http.delete('*/category/:id', ({ params }) => {
    db.categories.delete(params.id as string)
    return new HttpResponse(null, { status: 204 })
  }),
]
