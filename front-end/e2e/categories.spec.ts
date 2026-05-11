import { test, expect } from '@playwright/test'

test.describe('Categories', () => {
  const uniqueId = Date.now()

  test('creates a category', async ({ page }) => {
    await page.goto('/categories')
    await page.click('text=Nova Categoria')
    await page.fill('input#name', `E2E Category ${uniqueId}`)
    await page.click('button:has-text("Criar")')
    await expect(page.locator(`text=E2E Category ${uniqueId}`)).toBeVisible({ timeout: 10000 })
  })

  test('edits a category', async ({ page }) => {
    await page.goto('/categories')
    const editButton = page.locator('a[href*="edit"]').first()
    await editButton.click()
    await page.waitForSelector('input#name')
    await page.fill('input#name', `E2E Category ${uniqueId} Updated`)
    await page.click('button:has-text("Atualizar")')
    await expect(page.locator('text=E2E Category Updated')).toBeVisible({ timeout: 10000 })
  })

  test('shows validation error on empty form', async ({ page }) => {
    await page.goto('/categories/new')
    await page.click('button:has-text("Criar")')
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible({ timeout: 5000 })
  })
})
