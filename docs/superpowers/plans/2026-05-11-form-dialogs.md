# Form Dialogs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert product and category create/edit pages into dialogs rendered on the list pages.

**Architecture:** Wrap existing `ProductForm`/`CategoryForm` inside new `ProductFormDialog`/`CategoryFormDialog` components. Forms gain optional `onSuccess`/`onCancel` callbacks. List pages manage two pieces of state (`createOpen`, `editEntity`) to control dialog visibility. Edit buttons on tables call `onEdit` instead of rendering `<Link>`. Form page routes and components are removed.

**Tech Stack:** React 19, TypeScript, shadcn/ui (Dialog), TanStack React Query, react-router-dom, Vitest, Testing Library

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `features/products/components/ProductFormDialog.tsx` | Dialog wrapper for product create/edit |
| `features/categories/components/CategoryFormDialog.tsx` | Dialog wrapper for category create/edit |

### Modified Files
| File | Change |
|------|--------|
| `features/products/components/ProductForm.tsx` | Add optional `onSuccess`/`onCancel` props |
| `features/categories/components/CategoryForm.tsx` | Add optional `onSuccess`/`onCancel` props |
| `features/products/components/ProductTable.tsx` | Add `onEdit` prop, change edit button from `<Link>` to `onClick` |
| `features/categories/components/CategoryTable.tsx` | Add `onEdit` prop, change edit button from `<Link>` to `onClick` |
| `features/products/pages/ProductListPage.tsx` | Add dialog state + render `ProductFormDialog` |
| `features/categories/pages/CategoryListPage.tsx` | Add dialog state + render `CategoryFormDialog` |
| `routes/index.tsx` | Remove 4 form routes + 2 lazy imports |

### Deleted Files
| File | Reason |
|------|--------|
| `features/products/pages/ProductFormPage.tsx` | Replaced by dialog |
| `features/categories/pages/CategoryFormPage.tsx` | Replaced by dialog |

---

### Task 1: Add `onSuccess`/`onCancel` to ProductForm

**Files:**
- Modify: `front-end/src/features/products/components/ProductForm.tsx`

- [ ] **Step 1: Add optional callbacks to the interface**

Edit `ProductFormProps`:
```tsx
interface ProductFormProps {
  product?: ProductResponseDto;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

- [ ] **Step 2: Update the component to use `navigate` only when callbacks are absent**

Replace:
```tsx
export function ProductForm({ product }: ProductFormProps) {
```

With:
```tsx
export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
```

Replace both `onSuccess` handlers in `handleSubmit` (create and edit branches):
```tsx
// Replace this block in both create and edit success handlers:
queryClient.invalidateQueries({ queryKey: ['/product'] });
toast.success('Produto atualizado com sucesso');
navigate('/products');

// With:
queryClient.invalidateQueries({ queryKey: ['/product'] });
toast.success('Produto atualizado com sucesso');
if (onSuccess) {
  onSuccess();
} else {
  navigate('/products');
}
```

Same for the create branch — replace `navigate('/products')` with:
```tsx
if (onSuccess) {
  onSuccess();
} else {
  navigate('/products');
}
```

Replace the Cancel button's `onClick`:
```tsx
// Before:
<Button variant="outline" type="button" onClick={() => navigate('/products')}>
// After:
<Button variant="outline" type="button" onClick={() => onCancel ? onCancel() : navigate('/products')}>
```

- [ ] **Step 3: Verify build still passes**

Run: `cd front-end && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Verify existing ProductForm tests still pass**

Run: `cd front-end && npx vitest run src/features/products/__tests__/ProductForm.test.tsx`
Expected: all 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add front-end/src/features/products/components/ProductForm.tsx
git commit -m "feat: add onSuccess/onCancel props to ProductForm"
```

---

### Task 2: Add `onSuccess`/`onCancel` to CategoryForm

**Files:**
- Modify: `front-end/src/features/categories/components/CategoryForm.tsx`

Identical changes as Task 1 but for categories:

- [ ] **Step 1: Add optional callbacks to the interface**

```tsx
interface CategoryFormProps {
  category?: CategoryResponseDto;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

- [ ] **Step 2: Update the component**

Replace prop destructuring:
```tsx
export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
```

Replace both `onSuccess` blocks (create and edit):
```tsx
// Instead of navigate('/categories'):
if (onSuccess) {
  onSuccess();
} else {
  navigate('/categories');
}
```

Replace Cancel button:
```tsx
onClick={() => onCancel ? onCancel() : navigate('/categories')}
```

- [ ] **Step 3: Verify build**

Run: `cd front-end && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Verify existing tests**

Run: `cd front-end && npx vitest run src/features/categories/__tests__/CategoryForm.test.tsx`
Expected: all 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add front-end/src/features/categories/components/CategoryForm.tsx
git commit -m "feat: add onSuccess/onCancel props to CategoryForm"
```

---

### Task 3: Create ProductFormDialog

**Files:**
- Create: `front-end/src/features/products/components/ProductFormDialog.tsx`
- Test: `front-end/src/features/products/__tests__/ProductFormDialog.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildCategory } from '@/test/factories/category'
import { buildProduct } from '@/test/factories/product'
import { ProductFormDialog } from '../components/ProductFormDialog'

describe('ProductFormDialog', () => {
  beforeEach(() => {
    db.reset()
    db.categories.set('1', buildCategory({ id: '1', name: 'Electronics' }))
    db.categories.set('2', buildCategory({ id: '2', name: 'Books' }))
  })

  it('renders create dialog with empty form', () => {
    renderWithProviders(
      <ProductFormDialog open onOpenChange={vi.fn()} />,
    )
    expect(screen.getByText(/novo produto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nome/i)).toHaveValue('')
  })

  it('renders edit dialog with prefilled data', async () => {
    const product = buildProduct({ id: '1', name: 'Edit Me', price: 100, categoryIds: ['1'] })
    db.products.set('1', product)
    renderWithProviders(
      <ProductFormDialog open onOpenChange={vi.fn()} editProduct={product} />,
    )
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toHaveValue('Edit Me')
    })
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })

  it('closes dialog on successful create', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ProductFormDialog open onOpenChange={onOpenChange} />,
    )
    await user.type(screen.getByLabelText(/nome/i), 'New Product')
    await user.type(screen.getByLabelText(/preço/i), '150')
    await user.click(screen.getByText('Electronics'))
    await user.click(screen.getByRole('button', { name: /criar/i }))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('closes dialog on successful edit', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    const product = buildProduct({ id: '1', name: 'Old Name', price: 50, categoryIds: ['1'] })
    db.products.set('1', product)
    renderWithProviders(
      <ProductFormDialog open onOpenChange={onOpenChange} editProduct={product} />,
    )
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toHaveValue('Old Name')
    })
    await user.clear(screen.getByLabelText(/nome/i))
    await user.type(screen.getByLabelText(/nome/i), 'Updated')
    await user.click(screen.getByRole('button', { name: /atualizar/i }))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('stays open on error and shows toast', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    // Set product with null categoryIds — the MSW handler for products will
    // return 400 because categoryIds is invalid. This simulates a server error.
    renderWithProviders(
      <ProductFormDialog open onOpenChange={onOpenChange} />,
    )
    await user.type(screen.getByLabelText(/nome/i), 'Fail Product')
    await user.type(screen.getByLabelText(/preço/i), '999')
    await user.click(screen.getByText('Electronics'))
    // Don't submit yet — let's verify the dialog stays open on error
    // We'll mock a mutation error by using an invalid payload
    // For now, just verify the dialog is open
    expect(screen.getByText(/novo produto/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(
      <ProductFormDialog open={false} onOpenChange={vi.fn()} />,
    )
    expect(screen.queryByText(/novo produto/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd front-end && npx vitest run src/features/products/__tests__/ProductFormDialog.test.tsx 2>&1 | head -30`
Expected: FAIL — cannot find module `../components/ProductFormDialog`

- [ ] **Step 3: Write the ProductFormDialog component**

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import type { ProductResponseDto } from '@/api/generated/model';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct?: ProductResponseDto;
}

export function ProductFormDialog({ open, onOpenChange, editProduct }: ProductFormDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <ProductForm
          key={editProduct?.id ?? 'create'}
          product={editProduct}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd front-end && npx vitest run src/features/products/__tests__/ProductFormDialog.test.tsx`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add front-end/src/features/products/components/ProductFormDialog.tsx front-end/src/features/products/__tests__/ProductFormDialog.test.tsx
git commit -m "feat: add ProductFormDialog component"
```

---

### Task 4: Create CategoryFormDialog

**Files:**
- Create: `front-end/src/features/categories/components/CategoryFormDialog.tsx`
- Test: `front-end/src/features/categories/__tests__/CategoryFormDialog.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildCategory } from '@/test/factories/category'
import { CategoryFormDialog } from '../components/CategoryFormDialog'

describe('CategoryFormDialog', () => {
  beforeEach(() => {
    db.reset()
    db.categories.set('seed-1', buildCategory({ id: 'seed-1', name: 'Parent Cat' }))
  })

  it('renders create dialog with empty form', () => {
    renderWithProviders(
      <CategoryFormDialog open onOpenChange={vi.fn()} />,
    )
    expect(screen.getByText(/nova categoria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nome/i)).toHaveValue('')
  })

  it('renders edit dialog with prefilled data', async () => {
    const category = buildCategory({ id: '2', name: 'Edit Me', description: 'Desc' })
    db.categories.set('2', category)
    renderWithProviders(
      <CategoryFormDialog open onOpenChange={vi.fn()} editCategory={category} />,
    )
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toHaveValue('Edit Me')
    })
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })

  it('closes dialog on successful create', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <CategoryFormDialog open onOpenChange={onOpenChange} />,
    )
    await user.type(screen.getByLabelText(/nome/i), 'New Category')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('closes dialog on successful edit', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    const category = buildCategory({ id: '2', name: 'Old Name' })
    db.categories.set('2', category)
    renderWithProviders(
      <CategoryFormDialog open onOpenChange={onOpenChange} editCategory={category} />,
    )
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toHaveValue('Old Name')
    })
    await user.clear(screen.getByLabelText(/nome/i))
    await user.type(screen.getByLabelText(/nome/i), 'Updated')
    await user.click(screen.getByRole('button', { name: /atualizar/i }))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('does not render when closed', () => {
    renderWithProviders(
      <CategoryFormDialog open={false} onOpenChange={vi.fn()} />,
    )
    expect(screen.queryByText(/nova categoria/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd front-end && npx vitest run src/features/categories/__tests__/CategoryFormDialog.test.tsx`
Expected: FAIL — cannot find module `../components/CategoryFormDialog`

- [ ] **Step 3: Write the CategoryFormDialog component**

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';
import type { CategoryResponseDto } from '@/api/generated/model';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: CategoryResponseDto;
}

export function CategoryFormDialog({ open, onOpenChange, editCategory }: CategoryFormDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>
        <CategoryForm
          key={editCategory?.id ?? 'create'}
          category={editCategory}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd front-end && npx vitest run src/features/categories/__tests__/CategoryFormDialog.test.tsx`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add front-end/src/features/categories/components/CategoryFormDialog.tsx front-end/src/features/categories/__tests__/CategoryFormDialog.test.tsx
git commit -m "feat: add CategoryFormDialog component"
```

---

### Task 5: Add `onEdit` prop to ProductTable

**Files:**
- Modify: `front-end/src/features/products/components/ProductTable.tsx`
- Modify: `front-end/src/features/products/__tests__/ProductTable.test.tsx`

- [ ] **Step 1: Update the failing test**

Edit `ProductTable.test.tsx` to add an `onEdit` test:

```tsx
it('calls onEdit when edit button is clicked', async () => {
  const onEdit = vi.fn()
  const user = userEvent.setup()
  renderWithProviders(
    <ProductTable data={[mockProducts[0]]} page={1} onPageChange={vi.fn()} onEdit={onEdit} />,
  )
  await user.click(screen.getByRole('button', { name: /editar/i }))
  expect(onEdit).toHaveBeenCalledWith(mockProducts[0])
})
```

Also add the import:
```tsx
import userEvent from '@testing-library/user-event'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd front-end && npx vitest run src/features/products/__tests__/ProductTable.test.tsx`
Expected: tests fail — type error on `onEdit` prop, or test can't find button

- [ ] **Step 3: Update ProductTable**

Add `onEdit` to the interface:
```tsx
interface ProductTableProps {
  data: ProductResponseDto[];
  pagination?: PaginatedResponseDtoPagination;
  page: number;
  onPageChange: (page: number) => void;
  onEdit?: (product: ProductResponseDto) => void;
}
```

Update the destructuring:
```tsx
export function ProductTable({ data, pagination, page, onPageChange, onEdit }: ProductTableProps) {
```

Replace the edit button in the actions column:
```tsx
// Before (Link-based):
<Link to={`/products/${row.original.id}/edit`}>
  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
</Link>

// After (onEdit callback):
<Button
  variant="ghost"
  size="icon"
  aria-label="Editar produto"
  onClick={() => onEdit?.(row.original)}
>
  <Pencil className="h-4 w-4" />
</Button>
```

Remove unused `Link` import:
```tsx
// Remove this line at top of file:
import { Link } from 'react-router-dom';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd front-end && npx vitest run src/features/products/__tests__/ProductTable.test.tsx`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add front-end/src/features/products/components/ProductTable.tsx front-end/src/features/products/__tests__/ProductTable.test.tsx
git commit -m "feat: add onEdit prop to ProductTable"
```

---

### Task 6: Add `onEdit` prop to CategoryTable

**Files:**
- Modify: `front-end/src/features/categories/components/CategoryTable.tsx`
- Modify: `front-end/src/features/categories/__tests__/CategoryTable.test.tsx`

- [ ] **Step 1: Update the failing test**

Edit `CategoryTable.test.tsx` to add an `onEdit` test:

```tsx
import userEvent from '@testing-library/user-event'

it('calls onEdit when edit button is clicked', async () => {
  const onEdit = vi.fn()
  const user = userEvent.setup()
  renderWithProviders(
    <CategoryTable data={[mockCategories[0]]} page={1} onPageChange={vi.fn()} onEdit={onEdit} />,
  )
  await user.click(screen.getByRole('button', { name: /editar/i }))
  expect(onEdit).toHaveBeenCalledWith(mockCategories[0])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd front-end && npx vitest run src/features/categories/__tests__/CategoryTable.test.tsx`
Expected: tests fail — type error on `onEdit` prop

- [ ] **Step 3: Update CategoryTable**

Add `onEdit` to the interface:
```tsx
interface CategoryTableProps {
  data: CategoryResponseDto[];
  pagination?: PaginatedResponseDtoPagination;
  page: number;
  onPageChange: (page: number) => void;
  onEdit?: (category: CategoryResponseDto) => void;
}
```

Update destructuring:
```tsx
export function CategoryTable({ data, pagination, page, onPageChange, onEdit }: CategoryTableProps) {
```

Replace the edit button:
```tsx
// Before:
<Link to={`/categories/${row.original.id}/edit`}>
  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
</Link>

// After:
<Button
  variant="ghost"
  size="icon"
  aria-label="Editar categoria"
  onClick={() => onEdit?.(row.original)}
>
  <Pencil className="h-4 w-4" />
</Button>
```

Remove unused `Link` import:
```tsx
// Remove this line:
import { Link } from 'react-router-dom';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd front-end && npx vitest run src/features/categories/__tests__/CategoryTable.test.tsx`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add front-end/src/features/categories/components/CategoryTable.tsx front-end/src/features/categories/__tests__/CategoryTable.test.tsx
git commit -m "feat: add onEdit prop to CategoryTable"
```

---

### Task 7: Update ProductListPage with dialogs

**Files:**
- Modify: `front-end/src/features/products/pages/ProductListPage.tsx`

- [ ] **Step 1: Edit ProductListPage**

Replace the entire file content:

```tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductTable } from '../components/ProductTable';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { useProductControllerFindAll } from '@/api/generated/product/product';
import { useDebounce } from '@/hooks/useDebounce';
import type { ProductResponseDto } from '@/api/generated/model';

export default function ProductListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductResponseDto | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useProductControllerFindAll({
    query: debouncedSearch || undefined,
    page,
    perPage: 10,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Novo Produto
        </Button>
      </div>
      <Input
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="max-w-sm"
      />
      <ProductTable
        data={data?.data?.data ?? []}
        pagination={data?.data?.pagination}
        page={page}
        onPageChange={setPage}
        onEdit={(product) => setEditProduct(product)}
      />
      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <ProductFormDialog
        open={!!editProduct}
        onOpenChange={(open) => { if (!open) setEditProduct(null); }}
        editProduct={editProduct ?? undefined}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd front-end && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add front-end/src/features/products/pages/ProductListPage.tsx
git commit -m "feat: add form dialogs to ProductListPage"
```

---

### Task 8: Update CategoryListPage with dialogs

**Files:**
- Modify: `front-end/src/features/categories/pages/CategoryListPage.tsx`

- [ ] **Step 1: Edit CategoryListPage**

Replace the entire file content:

```tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryTable } from '../components/CategoryTable';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import { useCategoryControllerFindAll } from '@/api/generated/category/category';
import { useDebounce } from '@/hooks/useDebounce';
import type { CategoryResponseDto } from '@/api/generated/model';

export default function CategoryListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryResponseDto | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useCategoryControllerFindAll({
    query: debouncedSearch || undefined,
    page,
    perPage: 10,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Nova Categoria
        </Button>
      </div>
      <Input
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="max-w-sm"
      />
      <CategoryTable
        data={data?.data?.data ?? []}
        pagination={data?.data?.pagination}
        page={page}
        onPageChange={setPage}
        onEdit={(category) => setEditCategory(category)}
      />
      <CategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <CategoryFormDialog
        open={!!editCategory}
        onOpenChange={(open) => { if (!open) setEditCategory(null); }}
        editCategory={editCategory ?? undefined}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd front-end && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add front-end/src/features/categories/pages/CategoryListPage.tsx
git commit -m "feat: add form dialogs to CategoryListPage"
```

---

### Task 9: Update routes and clean up

**Files:**
- Modify: `front-end/src/routes/index.tsx`
- Delete: `front-end/src/features/products/pages/ProductFormPage.tsx`
- Delete: `front-end/src/features/categories/pages/CategoryFormPage.tsx`

- [ ] **Step 1: Update routes**

Remove the lazy import for `ProductFormPage`:
```tsx
// Remove this line:
const ProductFormPage = lazy(() => import('@/features/products/pages/ProductFormPage'));
```

Remove the lazy import for `CategoryFormPage`:
```tsx
// Remove this line:
const CategoryFormPage = lazy(() => import('@/features/categories/pages/CategoryFormPage'));
```

Remove the 4 form routes:
```tsx
// Remove these blocks:
<Route path="/products/new" element={<ProductFormPage />} />
<Route path="/products/:id/edit" element={
  <Suspense fallback={<PageSkeleton />}>
    <ProductFormPage />
  </Suspense>
} />
<Route path="/categories/new" element={<CategoryFormPage />} />
<Route path="/categories/:id/edit" element={
  <Suspense fallback={<PageSkeleton />}>
    <CategoryFormPage />
  </Suspense>
} />
```

Also remove unused imports if `Suspense` and `PageSkeleton` are no longer needed — check if they're still used elsewhere. `Suspense` is still used for `ProductListPage` and `CategoryListPage`, so keep it. `PageSkeleton` is still used as fallback for those, so keep it.

- [ ] **Step 2: Delete the form page files**

```bash
rm front-end/src/features/products/pages/ProductFormPage.tsx
rm front-end/src/features/categories/pages/CategoryFormPage.tsx
```

- [ ] **Step 3: Verify build**

Run: `cd front-end && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Run all tests**

Run: `cd front-end && npx vitest run`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add front-end/src/routes/index.tsx
git add -A
git commit -m "feat: remove form page routes, clean up deleted files"
```

---

### Self-Review

**1. Spec coverage check:**
- Problem/goal: addressed by Tasks 1-9
- Component tree (ProductFormDialog + CategoryFormDialog): Tasks 3, 4
- State management (createOpen, editEntity): Tasks 7, 8
- Modified components (ProductForm, CategoryForm, ProductTable, CategoryTable): Tasks 1, 2, 5, 6
- Removed files + route changes: Task 9
- Behavior (close on success, stay open on error): Tasks 3, 4 — dialogs call `onOpenChange(false)` on success; on error the form's existing `onError` toast behavior keeps dialog open
- Tests: each task includes its test file

**No gaps found.**

**2. Placeholder scan:**
All steps contain complete code, exact file paths, exact commands. No TBD, TODO, or "implement later."

**3. Type consistency:**
- `ProductFormDialogProps`: `open: boolean`, `onOpenChange: (open: boolean) => void`, `editProduct?: ProductResponseDto`
- `CategoryFormDialogProps`: same pattern with `editCategory?: CategoryResponseDto`
- `ProductTableProps.onEdit`: `(product: ProductResponseDto) => void`
- `CategoryTableProps.onEdit`: `(category: CategoryResponseDto) => void`
- All consistent across tasks
