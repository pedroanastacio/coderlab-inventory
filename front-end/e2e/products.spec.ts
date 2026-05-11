import { test, expect } from '@playwright/test'

test.describe('Products', () => {
  const uniqueId = Date.now()

  test('creates a product', async ({ page }) => {
    await page.goto('/products')
    await page.click('text=Novo Produto')
    await page.fill('input#name', `E2E Product ${uniqueId}`)
    await page.fill('input#price', '250')
    await page.click('button:has-text("Criar")')
    await expect(page.locator(`text=E2E Product ${uniqueId}`)).toBeVisible({ timeout: 10000 })
  })

  test('edits a product', async ({ page }) => {
    await page.goto('/products')
    const editButton = page.locator('a[href*="edit"]').first()
    await editButton.click()
    await page.waitForSelector('input#name')
    await page.fill('input#name', `E2E Product ${uniqueId} Updated`)
    await page.click('button:has-text("Atualizar")')
    await expect(page.locator('text=E2E Product Updated')).toBeVisible({ timeout: 10000 })
  })

  test('searches products by name', async ({ page }) => {
    await page.goto('/products')
    await page.fill('input[placeholder*="buscar"]', `E2E Product ${uniqueId}`)
    await page.waitForTimeout(500)
    await expect(page.locator(`text=E2E Product ${uniqueId}`)).toBeVisible({ timeout: 5000 })
  })
})
