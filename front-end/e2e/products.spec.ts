import { test, expect, request as apiRequest } from '@playwright/test'

async function cleanupOldTestData() {
  const api = await apiRequest.newContext({ baseURL: 'http://localhost:3000' })
  const prodRes = await api.get('/product?perPage=100')
  const prodData = await prodRes.json()
  const oldProducts = (prodData?.data ?? []).filter(
    (p: { name: string }) => p.name.startsWith('E2E'),
  )
  for (const prod of oldProducts) {
    await api.delete(`/product/${prod.id}`)
  }

  const catRes = await api.get('/category?perPage=100')
  const catData = await catRes.json()
  const oldCategories = (catData?.data ?? []).filter(
    (c: { name: string }) => c.name.startsWith('E2E'),
  )
  for (const cat of oldCategories) {
    await api.delete(`/category/${cat.id}`)
  }
}

test.describe('Products', () => {
  const uniqueId = Date.now()
  let categoryId: string

  test.beforeAll(async ({ request }) => {
    await cleanupOldTestData()
    const catRes = await request.post('http://localhost:3000/category', {
      data: { name: `E2E Product Test Category ${uniqueId}` },
    })
    if (!catRes.ok()) {
      throw new Error(`Failed to seed category: ${catRes.status()} ${await catRes.text()}`)
    }
    const catBody = await catRes.json()
    categoryId = catBody.id

    const prodRes = await request.post('http://localhost:3000/product', {
      data: {
        name: `E2E Product Seed ${uniqueId}`,
        price: 100,
        categoryIds: [categoryId],
      },
    })
    if (!prodRes.ok()) {
      throw new Error(`Failed to seed product: ${prodRes.status()} ${await prodRes.text()}`)
    }
  })

  test('creates a product', async ({ page }) => {
    await page.goto('/products')
    await page.click('text=Novo Produto')
    await page.fill('input#name', `E2E Product ${uniqueId}`)
    await page.fill('input#price', '250')
    await page.click('button[role="combobox"]')
    await page.click(`text=E2E Product Test Category ${uniqueId}`)
    await page.click('button:has-text("Criar")')
    await expect(page.getByRole('row', { name: new RegExp(String(uniqueId)) }).first()).toBeVisible({ timeout: 10000 })
  })

  test('edits a product', async ({ page }) => {
    await page.goto('/products')
    const editButton = page.getByRole('button', { name: 'Editar produto' }).first()
    await editButton.click()
    await page.waitForSelector('input#name')
    await page.fill('input#name', `E2E Product ${uniqueId} Updated`)
    await page.click('button:has-text("Atualizar")')
    await expect(page.getByRole('row', { name: new RegExp(String(uniqueId)) }).first()).toBeVisible({ timeout: 10000 })
  })

  test('searches products by name', async ({ page }) => {
    await page.goto('/products')
    await page.getByPlaceholder('Buscar por nome...').fill(String(uniqueId))
    await page.waitForTimeout(1000)
    await expect(page.getByRole('row', { name: new RegExp(String(uniqueId)) })).toBeVisible({ timeout: 5000 })
  })
})
