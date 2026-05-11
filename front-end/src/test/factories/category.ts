import type { CategoryResponseDto } from '@/api/generated/model'

let counter = 1
export function buildCategory(overrides?: Partial<CategoryResponseDto>): CategoryResponseDto {
  const id = String(counter++)
  return {
    id,
    name: `Category ${id}`,
    description: `Description for category ${id}`,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}
