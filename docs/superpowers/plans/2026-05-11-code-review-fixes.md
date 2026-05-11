# Code Review Fixes — Frontend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all issues identified in code review (Important + Minor) to align with the spec's Suspense loading strategy, prevent excessive API calls, improve UX on empty states, and clean up dependencies.

**Architecture:** Each fix is isolated to 1-3 files with no cross-cutting changes. All fixes are backward-compatible.

**Tech Stack:** React 19, TanStack Query v5, Radix UI Select, shadcn/ui

---

### Task 1: Fix QueryClient Suspense + throwOnError config

**Files:**
- Modify: `front-end/src/main.tsx:7-14`

- [ ] **Step 1: Add suspense and throwOnError to QueryClient defaults**

Read and update `front-end/src/main.tsx`. The `queryClient` currently has no `suspense` or `throwOnError` options. The spec requires Suspense for data loading and ErrorBoundary for errors. Update the `defaultOptions.queries` to include both:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      throwOnError: true,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

- [ ] **Step 2: Verify build passes**

```bash
cd front-end && pnpm build
```

Expected: clean build with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add front-end/src/main.tsx
git commit -m "fix: enable Suspense and throwOnError in QueryClient config"
```

---

### Task 2: Add debounce to search inputs

**Files:**
- Create: `front-end/src/hooks/useDebounce.ts`
- Modify: `front-end/src/features/products/pages/ProductListPage.tsx:8-30`
- Modify: `front-end/src/features/categories/pages/CategoryListPage.tsx:8-30`

- [ ] **Step 1: Create useDebounce hook**

`front-end/src/hooks/useDebounce.ts`:

```ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

- [ ] **Step 2: Update ProductListPage to use debounce**

Read and update `front-end/src/features/products/pages/ProductListPage.tsx`:

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductTable } from '../components/ProductTable';
import { useProductControllerFindAll } from '@/api/generated/product/product';
import { useDebounce } from '@/hooks/useDebounce';

export default function ProductListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
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
        <Link to="/products/new">
          <Button><Plus className="mr-2 h-4 w-4" />Novo Produto</Button>
        </Link>
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
      />
    </div>
  );
}
```

- [ ] **Step 3: Update CategoryListPage to use debounce**

Read and update `front-end/src/features/categories/pages/CategoryListPage.tsx` with the same pattern — add `useDebounce` import, replace direct `search` in query params with `debouncedSearch`.

- [ ] **Step 4: Verify build passes**

```bash
cd front-end && pnpm build
```

Expected: clean build.

- [ ] **Step 5: Commit**

```bash
git add front-end/src/hooks/useDebounce.ts front-end/src/features/products/pages/ProductListPage.tsx front-end/src/features/categories/pages/CategoryListPage.tsx
git commit -m "fix: add 300ms debounce to search inputs"
```

---

### Task 3: Add empty state to tables

**Files:**
- Modify: `front-end/src/features/products/components/ProductTable.tsx:78-87`
- Modify: `front-end/src/features/categories/components/CategoryTable.tsx:78-87`

- [ ] **Step 1: Update ProductTable empty state**

Read and update `front-end/src/features/products/components/ProductTable.tsx`. Replace the empty `TableBody` section with a "Nenhum resultado encontrado" row when `data.length === 0`:

```tsx
<TableBody>
  {table.getRowModel().rows.length === 0 ? (
    <TableRow>
      <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
        Nenhum produto encontrado
      </TableCell>
    </TableRow>
  ) : (
    table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  )}
</TableBody>
```

- [ ] **Step 2: Update CategoryTable empty state**

Read and update `front-end/src/features/categories/components/CategoryTable.tsx` with the same pattern, showing "Nenhuma categoria encontrada".

- [ ] **Step 3: Verify build passes**

```bash
cd front-end && pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add front-end/src/features/products/components/ProductTable.tsx front-end/src/features/categories/components/CategoryTable.tsx
git commit -m "fix: add empty state rows to product and category tables"
```

---

### Task 4: Move shadcn to devDependencies

**Files:**
- Modify: `front-end/package.json:26`

- [ ] **Step 1: Move shadcn package to devDependencies**

Read and update `front-end/package.json`. Move `"shadcn": "^4.7.0"` from `dependencies` to `devDependencies`:

```json
"devDependencies": {
    "shadcn": "^4.7.0",
    ...
}
```

Remove it from the `dependencies` object.

- [ ] **Step 2: Run install to update lockfile**

```bash
cd front-end && pnpm install
```

Expected: clean install with no changes to node_modules (package was already installed).

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add front-end/package.json front-end/pnpm-lock.yaml
git commit -m "chore: move shadcn CLI from runtime to devDependencies"
```

---

### Task 5: Fix parent category select sentinel value

**Files:**
- Modify: `front-end/src/features/categories/components/CategoryForm.tsx:105-112`

- [ ] **Step 1: Fix the sentinel value for "Nenhuma" parent**

Read and update `front-end/src/features/categories/components/CategoryForm.tsx`:

Change:
```tsx
<SelectItem value="">Nenhuma (categoria raiz)</SelectItem>
```
To:
```tsx
<SelectItem value="none">Nenhuma (categoria raiz)</SelectItem>
```

In `handleSubmit`, update the `parentId` assignment:
```tsx
parentId: parentId === 'none' ? undefined : parentId,
```

- [ ] **Step 2: Verify build passes**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add front-end/src/features/categories/components/CategoryForm.tsx
git commit -m "fix: use sentinel value for parent category select 'none' option"
```

---

### Task 6: Rename api-client to reflect side-effect nature

**Files:**
- Rename: `front-end/src/lib/api-client.ts` → `front-end/src/lib/axios-setup.ts`
- Modify: `front-end/src/main.tsx`

- [ ] **Step 1: Rename file and update content**

```bash
mv front-end/src/lib/api-client.ts front-end/src/lib/axios-setup.ts
```

Update `front-end/src/lib/axios-setup.ts`:

```ts
// Sets up global axios defaults for the Orval-generated API client.
// Orval uses axios.default.post/get/... directly, so this module
// configures the base URL and content type globally.
// Import this module once in main.tsx for the setup to take effect.

import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
```

- [ ] **Step 2: Import the setup module in main.tsx**

Add import at top of `front-end/src/main.tsx`:

```tsx
import './lib/axios-setup';
```

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add front-end/src/lib/axios-setup.ts front-end/src/lib/api-client.ts front-end/src/main.tsx
git commit -m "refactor: rename api-client to axios-setup and add explicit import in main"
```
