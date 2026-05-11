import type { ProductResponseDto, CategoryResponseDto } from '@/api/generated/model'

export const db = {
  products: new Map<string, ProductResponseDto>(),
  categories: new Map<string, CategoryResponseDto>(),
  nextProductId: 1,
  nextCategoryId: 1,

  reset() {
    this.products.clear()
    this.categories.clear()
    this.nextProductId = 1
    this.nextCategoryId = 1
  },
}
