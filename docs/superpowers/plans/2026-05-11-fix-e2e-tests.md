# Fix E2E Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5/6 failing Playwright E2E tests by making them self-sufficient and fixing selector bugs.

**Architecture:** Tests need to create their own data via API calls in `beforeAll` hooks instead of assuming pre-seeded data. One test has a case-sensitive CSS selector bug. Product tests need to select category checkboxes because `categoryIds` is required by the form validation.

**Tech Stack:** Playwright, NestJS backend (port 3000), PostgreSQL

---

## Root Cause Analysis

| Test | Failure | Root Cause |
|------|---------|------------|
| Products - creates a product | `toBeVisible` timeout (10s) | Form validation blocks submit — `categoryIds` required but not selected. YAML snapshot shows `"Selecione pelo menos uma categoria"`. |
| Products - edits a product | `toBeVisible` timeout (10s) | Same — no category selected. Also assumes existing product to edit. |
| Products - searches by name | `page.fill` timeout (30s) | CSS selector `input[placeholder*="buscar"]` is case-sensitive; doesn't match `"Buscar por nome..."` (capital B). |
| Categories - creates a category | `toBeVisible` timeout (10s) | API POST /category fails (backend not running or no seed data). Form submits but `onError` prevents redirect. |
| Categories - edits a category | `toBeVisible` timeout (10s) | Same — API call fails. Also assumes existing category to edit. |
| Categories - validation error | **PASSES** | Only uses client-side validation, no API call. |

## Files to Modify

- `front-end/e2e/products.spec.ts` — rewrite to be self-sufficient, fix search selector, add category selection
- `front-end/e2e/categories.spec.ts` — rewrite to be self-sufficient (create seed data via API)
- `front-end/.gitignore` — add `playwright-report/` and `test-results/`

No backend changes needed. All endpoints are public (no auth).

---

### Task 1: Add Playwright report dirs to .gitignore

**Files:**
- Modify: `front-end/.gitignore`

- [ ] **Step 1: Add entries**

```
playwright-report/
test-results/
```

- [ ] **Step 2: Commit**

---

### Task 2: Fix products search selector

**Files:**
- Modify: `front-end/e2e/products.spec.ts:27`

- [ ] **Step 1: Replace case-sensitive CSS selector with `getByPlaceholder`**

```ts
// BEFORE (line 27):
await page.fill('input[placeholder*="buscar"]', `E2E Product ${uniqueId}`)

// AFTER:
await page.getByPlaceholder('Buscar por nome...').fill(`E2E Product ${uniqueId}`)
```

- [ ] **Step 2: Commit**

---

### Task 3: Rewrite categories.spec.ts to be self-sufficient

**Files:**
- Modify: `front-end/e2e/categories.spec.ts`

**Context:** The backend runs on `http://localhost:3000` (configured in `front-end/src/lib/axios-setup.ts`). All endpoints are public. `POST /category` accepts `{ name: string, description?: string, parentId?: string }`.

- [ ] **Step 1: Rewrite categories.spec.ts**

Complete file content:

```ts
import { test, expect } from '@playwright/test'

test.describe('Categories', () => {
  const uniqueId = Date.now()

  test.beforeAll(async ({ request }) => {
    const res = await request.post('http://localhost:3000/category', {
      data: { name: `E2E Category Seed ${uniqueId}` },
    })
    if (!res.ok()) {
      console.error(`Failed to seed category: ${res.status()} ${await res.text()}`)
    }
  })

  test('creates a category', async ({ page }) => {
    await page.goto('/categories')
    await page.click('text=Nova Categoria')
    await page.fill('input#name', `E2E Category ${uniqueId}`)
    await page.click('button:has-text("Criar")')
    await expect(page.getByText(`E2E Category ${uniqueId}`)).toBeVisible({ timeout: 10000 })
  })

  test('edits a category', async ({ page }) => {
    await page.goto('/categories')
    const editButton = page.locator('a[href*="edit"]').first()
    await editButton.click()
    await page.waitForSelector('input#name')
    await page.fill('input#name', `E2E Category ${uniqueId} Updated`)
    await page.click('button:has-text("Atualizar")')
    await expect(page.getByText(`E2E Category ${uniqueId} Updated`)).toBeVisible({ timeout: 10000 })
  })

  test('shows validation error on empty form', async ({ page }) => {
    await page.goto('/categories/new')
    await page.click('button:has-text("Criar")')
    await expect(page.getByText('Nome é obrigatório')).toBeVisible({ timeout: 5000 })
  })
})
```

- [ ] **Step 2: Run categories tests**

Run: `pnpm exec playwright test e2e/categories.spec.ts --reporter=line`
Expected: All 3 tests pass

- [ ] **Step 3: Commit**

---

### Task 4: Rewrite products.spec.ts to be self-sufficient

**Files:**
- Modify: `front-end/e2e/products.spec.ts`

**Context:** Products require `categoryIds` (array of UUIDs) to be created. The form has checkboxes for categories.

- [ ] **Step 1: Rewrite products.spec.ts**

```ts
import { test, expect } from '@playwright/test'

test.describe('Products', () => {
  const uniqueId = Date.now()
  let categoryId: string

  test.beforeAll(async ({ request }) => {
    const catRes = await request.post('http://localhost:3000/category', {
      data: { name: `E2E Product Test Category ${uniqueId}` },
    })
    if (!catRes.ok()) {
      console.error(`Failed to seed category: ${catRes.status()} ${await catRes.text()}`)
      return
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
      console.error(`Failed to seed product: ${prodRes.status()} ${await prodRes.text()}`)
    }
  })

  test('creates a product', async ({ page }) => {
    await page.goto('/products')
    await page.click('text=Novo Produto')
    await page.fill('input#name', `E2E Product ${uniqueId}`)
    await page.fill('input#price', '250')
    await page.check(`input[type="checkbox"]`)
    await page.click('button:has-text("Criar")')
    await expect(page.getByText(`E2E Product ${uniqueId}`)).toBeVisible({ timeout: 10000 })
  })

  test('edits a product', async ({ page }) => {
    await page.goto('/products')
    const editButton = page.locator('a[href*="edit"]').first()
    await editButton.click()
    await page.waitForSelector('input#name')
    await page.fill('input#name', `E2E Product ${uniqueId} Updated`)
    await page.click('button:has-text("Atualizar")')
    await expect(page.getByText(`E2E Product ${uniqueId} Updated`)).toBeVisible({ timeout: 10000 })
  })

  test('searches products by name', async ({ page }) => {
    await page.goto('/products')
    await page.getByPlaceholder('Buscar por nome...').fill(`E2E Product ${uniqueId}`)
    await page.waitForTimeout(500)
    await expect(page.getByText(`E2E Product ${uniqueId}`)).toBeVisible({ timeout: 5000 })
  })
})
```

- [ ] **Step 2: Run products tests**

Run: `pnpm exec playwright test e2e/products.spec.ts --reporter=line`
Expected: All 3 tests pass

- [ ] **Step 3: Run full E2E suite**

Run: `pnpm test:e2e`
Expected: All 6 tests pass

- [ ] **Step 4: Commit**

---

## Prerequisites for Running

1. **Backend + database running:**
   ```bash
   docker-compose up --build
   ```

2. **System dependencies for Playwright Chromium (if not already installed):**
   ```bash
   npx playwright install-deps chromium
   ```

3. **Run all E2E tests:**
   ```bash
   cd front-end
   pnpm test:e2e
   ```
