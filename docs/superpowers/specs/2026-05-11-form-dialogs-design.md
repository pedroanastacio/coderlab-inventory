# Form Dialogs — Products & Categories

## Problem

Product and category creation/editing currently happen on separate pages with dedicated routes (`/products/new`, `/products/:id/edit`, `/categories/new`, `/categories/:id/edit`). After form submission, users are redirected to the list page. This adds unnecessary navigation steps and page loads.

## Goal

Replace the form pages with dialogs rendered on top of the list pages. The dialogs must close on successful submission and stay open (showing error toast) on failure. Remove the dedicated form routes.

---

## Architecture

### Component Tree (After)

```
ProductListPage
├── ProductTable (with onEdit callback)
├── [New] ProductFormDialog (create + edit)
│   └── ProductForm (with onSuccess/onCancel)
└── DeleteProductDialog (existing)

CategoryListPage
├── CategoryTable (with onEdit callback)
├── [New] CategoryFormDialog (create + edit)
│   └── CategoryForm (with onSuccess/onCancel)
└── DeleteCategoryDialog (existing)
```

### State Management

Each list page uses two separate pieces of state to control the dialogs:

```tsx
const [createOpen, setCreateOpen] = useState(false);
const [editEntity, setEditEntity] = useState<ProductResponseDto | null>(null);
```

- "Novo" button → `setCreateOpen(true)`
- Edit (pencil) → `setEditEntity(product)`
- Close dialog → `setCreateOpen(false)` or `setEditEntity(null)`

### New Components

**ProductFormDialog** — wraps `<Dialog>` from shadcn. Receives `open`/`onOpenChange` for create mode, or `productId` for edit mode. Handles data fetching for edit by calling `useProductControllerFindById`. Renders `ProductForm` inside `<DialogContent>`. On success: calls `onOpenChange(false)`. On error: dialog stays open, toast handles the error feedback.

**CategoryFormDialog** — identical pattern for categories.

### Modified Components

**ProductForm** — gains two optional props:
- `onSuccess?: () => void` — overrides default `navigate('/products')` on mutation success
- `onCancel?: () => void` — overrides default `navigate('/products')` on cancel button

When these props are not provided, the form falls back to the current `useNavigate()` behavior.

**CategoryForm** — same pattern.

**ProductTable** — gains `onEdit: (product: ProductResponseDto) => void` prop. Edit button calls `onEdit` instead of rendering `<Link>`. The `Pencil` icon button stays visually identical.

**CategoryTable** — same pattern.

### Removed Files

- `features/products/pages/ProductFormPage.tsx`
- `features/categories/pages/CategoryFormPage.tsx`

### Route Changes

Remove from `routes/index.tsx`:
```tsx
<Route path="/products/new" element={<ProductFormPage />} />
<Route path="/products/:id/edit" element={...} />
<Route path="/categories/new" element={<CategoryFormPage />} />
<Route path="/categories/:id/edit" element={...} />
```

Remove lazy imports for `ProductFormPage` and `CategoryFormPage`.

---

## Behavior

### Create Flow

1. User clicks "Novo Produto" → `setCreateOpen(true)` → dialog opens with empty form
2. User fills form and submits
3. **Success:** dialog closes, list query invalidated, success toast
4. **Error:** dialog stays open, error toast with message
5. Cancel / X button → dialog closes, no side effects

### Edit Flow

1. User clicks pencil icon → `setEditEntity(product)` → dialog opens, fetches full product data
2. Dialog shows spinner/Skeleton while data loads
3. Form renders with prefilled values
4. Same submit/error/cancel behavior as create

### Key Behaviors

- Dialog uses controlled pattern (`open`/`onOpenChange`)
- `key={productId}` on form component forces remount on product change and reset on close
- Form validation runs client-side before submit (unchanged from current behavior)
- Error toasts use `sonner` (already configured)

---

## Testing

### Tests to Update
- `ProductTable.test.tsx` — edit button changes from `<Link>` assertion to `onEdit` callback assertion
- `CategoryTable.test.tsx` — same

### Tests to Remove
- `ProductFormPage` tests (if any) — the page is deleted

### Tests that Continue Working
- `ProductForm.test.tsx` — props are optional, existing tests unaffected
- `CategoryForm.test.tsx` — same
- `DeleteProductDialog.test.tsx` — unchanged

### New Tests
- `ProductFormDialog` — test create mode: renders form, calls onSuccess, closes dialog; test edit mode: fetches product, prefills form, closes on success; test error: stays open, shows toast
- `CategoryFormDialog` — same

---

## Files Changed

| File | Change |
|------|--------|
| `routes/index.tsx` | Remove 4 form routes + lazy imports |
| `features/products/pages/ProductListPage.tsx` | Add dialog state + render dialogs |
| `features/products/components/ProductForm.tsx` | Add `onSuccess`/`onCancel` props |
| `features/products/components/ProductTable.tsx` | Add `onEdit` prop, change edit button |
| `features/products/pages/ProductFormPage.tsx` | **Delete** |
| `features/categories/pages/CategoryListPage.tsx` | Add dialog state + render dialogs |
| `features/categories/components/CategoryForm.tsx` | Add `onSuccess`/`onCancel` props |
| `features/categories/components/CategoryTable.tsx` | Add `onEdit` prop, change edit button |
| `features/categories/pages/CategoryFormPage.tsx` | **Delete** |

### New Files

| File | Purpose |
|------|---------|
| `features/products/components/ProductFormDialog.tsx` | Dialog wrapper for product create and edit |
| `features/categories/components/CategoryFormDialog.tsx` | Dialog wrapper for category create and edit |
