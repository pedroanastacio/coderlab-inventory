import type { ProductResponseDto } from '@/api/generated/model'

let counter = 1
export function buildProduct(overrides?: Partial<ProductResponseDto>): ProductResponseDto {
  const id = String(counter++)
  return {
    id,
    name: `Product ${id}`,
    description: `Description for product ${id}`,
    price: 99.9,
    categoryIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}
