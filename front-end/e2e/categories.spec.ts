import { test, expect, request as apiRequest } from '@playwright/test'

async function cleanupOldTestData() {
  const api = await apiRequest.newContext({ baseURL: 'http://localhost:3000' })
  const catRes = await api.get('/category?perPage=100')
  const catData = await catRes.json()
  const oldCategories = (catData?.data ?? []).filter(
    (c: { name: string }) => c.name.startsWith('E2E'),
  )
  for (const cat of oldCategories) {
    await api.delete(`/category/${cat.id}`)
  }
}

test.describe('Categories', () => {
  const uniqueId = Date.now()

  test.beforeAll(async ({ request }) => {
    await cleanupOldTestData()
    const res = await request.post('http://localhost:3000/category', {
      data: { name: `E2E Category Seed ${uniqueId}` },
    })
    if (!res.ok()) {
      throw new Error(`Failed to seed category: ${res.status()} ${await res.text()}`)
    }
  })

  test('creates a category', async ({ page }) => {
    await page.goto('/categories')
    await page.click('text=Nova Categoria')
    await page.fill('input#name', `E2E Category ${uniqueId}`)
    await page.click('button:has-text("Criar")')
    await expect(page.getByRole('row', { name: new RegExp(String(uniqueId)) }).first()).toBeVisible({ timeout: 10000 })
  })

  test('edits a category', async ({ page }) => {
    await page.goto('/categories')
    const editButton = page.getByRole('button', { name: 'Editar categoria' }).first()
    await editButton.click()
    await page.waitForSelector('input#name')
    await page.fill('input#name', `E2E Category ${uniqueId} Updated`)
    await page.click('button:has-text("Atualizar")')
    await expect(page.getByRole('row', { name: new RegExp(String(uniqueId)) }).first()).toBeVisible({ timeout: 10000 })
  })

  test('shows validation error on empty form', async ({ page }) => {
    await page.goto('/categories')
    await page.click('text=Nova Categoria')
    await page.click('button:has-text("Criar")')
    await expect(page.getByText('Nome é obrigatório')).toBeVisible({ timeout: 5000 })
  })
})
