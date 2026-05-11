# Fix E2E Tests: Dialog Selectors Migration

**Goal:** Fix 3 broken selectors in Playwright E2E tests caused by migrating form pages to dialogs.

**Root Cause:** Two structural changes broke the tests:
1. Edit buttons were `<a href="/products/:id/edit">Link</a>` → now `<button aria-label="Editar produto">Button</button>`
2. Form route `/categories/new` was deleted → creation is now a dialog

## Analysis

### Concept 1: Edit Button Selector — `a[href]` → `button[aria-label]`

**Approach A: `getByRole('button', { name: 'Editar produto' })`**
- Accessible, standard Playwright API, matches real user interaction
- Recommended over `locator('button[aria-label="Editar produto"]')` or DOM traversal

**Approach B: `locator('button[aria-label="Editar produto"]')`**
- More coupled to exact attribute, less accessible

**Approach C: DOM traversal from icon**
- Fragile, over-engineered

### Concept 2: Validation Test Without `/categories/new` Route

**Approach A: Open dialog from list page**
- Tests real user flow: `goto('/categories')` → `click('Nova Categoria')` → submit empty → assert error
- Only viable option since route no longer exists

**Approach B: Navigate directly** — impossible, route returns 404

### Concept 3: Dialog Open/Close Timing

No explicit waits needed. Playwright auto-waits for element visibility. `toBeVisible` with 10s timeout handles dialog close animation.

## Files to Modify

- `front-end/e2e/products.spec.ts` — 1 edit selector
- `front-end/e2e/categories.spec.ts` — 1 edit selector + 1 validation route

## Tasks

### Task 1: Fix products edit selector

**File:** `front-end/e2e/products.spec.ts`

- [ ] **Step 1: Replace `a[href*="edit"]` with `getByRole`**

```ts
// BEFORE:
const editButton = page.locator('a[href*="edit"]').first()

// AFTER:
const editButton = page.getByRole('button', { name: 'Editar produto' }).first()
```

- [ ] **Step 2: Run products tests**

```bash
cd front-end && npx playwright test e2e/products.spec.ts --reporter=line
```

Expected: All 3 tests pass

### Task 2: Fix categories edit selector

**File:** `front-end/e2e/categories.spec.ts`

- [ ] **Step 1: Replace `a[href*="edit"]` with `getByRole`**

```ts
// BEFORE:
const editButton = page.locator('a[href*="edit"]').first()

// AFTER:
const editButton = page.getByRole('button', { name: 'Editar categoria' }).first()
```

### Task 3: Fix categories validation test route

**File:** `front-end/e2e/categories.spec.ts`

- [ ] **Step 1: Replace `goto('/categories/new')` with dialog open**

```ts
// BEFORE:
await page.goto('/categories/new')

// AFTER:
await page.goto('/categories')
await page.click('text=Nova Categoria')
```

- [ ] **Step 2: Run full e2e suite**

```bash
cd front-end && npx playwright test
```

Expected: All 6 tests pass

### Task 4: Commit

```bash
git add front-end/e2e/
git commit -m "fix: update e2e tests for dialog-based forms"
```

## Prerequisites

1. Backend + database running: `docker-compose up --build`
2. Playwright browsers: `npx playwright install chromium`
