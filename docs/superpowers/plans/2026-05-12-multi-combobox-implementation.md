# Multi-Combobox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace category checkboxes in the product form with a multi-select autocomplete component with infinite scroll pagination.

**Architecture:** A standalone `MultiCombobox` component using shadcn/ui `Popover` + `Command` (cmdk) for the autocomplete dropdown, `Badge` for selected items rendered inside the trigger, and `useInfiniteQuery` for paginated category fetching. The component is added to `front-end/src/components/ui/` following the existing shadcn v4 data-slot pattern.

**Tech Stack:** React, cmdk, Radix UI Popover (via radix-ui meta-package), shadcn/ui, TanStack React Query, Tailwind CSS v4

---

### Task 1: Install dependencies

**Files:**
- Modify: `front-end/package.json`

- [ ] **Step 1: Install cmdk**

Run:
```bash
pnpm add cmdk
```

- [ ] **Step 2: Verify it installed**

Run:
```bash
ls node_modules/cmdk
```

Expected: directory listing with `package.json`, `dist/`, etc.

- [ ] **Step 3: Commit**

```bash
git add package.json && git commit -m "chore: add cmdk dependency"
```

---

### Task 2: Create Popover component

**Files:**
- Create: `front-end/src/components/ui/popover.tsx`

- [ ] **Step 1: Write popover.tsx**

```tsx
"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  )
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/popover.tsx && git commit -m "feat: add popover ui component"
```

---

### Task 3: Create Command component

**Files:**
- Create: `front-end/src/components/ui/command.tsx`

- [ ] **Step 1: Write command.tsx**

```tsx
"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      className="flex items-center border-b px-3"
      cmdk-input-wrapper=""
    >
      <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] overflow-y-auto overflow-x-hidden",
        className,
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/command.tsx && git commit -m "feat: add command ui component"
```

---

### Task 4: Create MultiCombobox component

**Files:**
- Create: `front-end/src/components/ui/multi-combobox.tsx`

- [ ] **Step 1: Write multi-combobox.tsx**

```tsx
"use client"

import * as React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { CheckIcon, XIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { categoryControllerFindAll } from "@/api/generated/category/category"
import type { CategoryControllerFindAll200 } from "@/api/generated/model"

interface MultiComboboxProps {
  selected: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
}

export function MultiCombobox({
  selected,
  onChange,
  placeholder = "Selecionar categorias...",
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<CategoryControllerFindAll200>({
    queryKey: ["categories", "search", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await categoryControllerFindAll({
        page: pageParam as number,
        perPage: 20,
        query: search || undefined,
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined
      const { page, pageCount } = lastPage.pagination
      if (page && pageCount && page < pageCount) return page + 1
      return undefined
    },
    initialPageParam: 1,
  })

  const categories = React.useMemo(
    () => data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [data],
  )

  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const selectedNames = React.useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]))
    return selected.map((id) => ({ id, name: map.get(id) ?? id }))
  }, [categories, selected])

  const handleToggle = (categoryId: string) => {
    onChange(
      selected.includes(categoryId)
        ? selected.filter((id) => id !== categoryId)
        : [...selected, categoryId],
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-9 w-full justify-between px-3 py-1.5"
        >
          <div className="flex flex-wrap items-center gap-1">
            {selectedNames.map((item) => (
              <Badge key={item.id} variant="secondary" className="gap-1">
                {item.name}
                <button
                  type="button"
                  className="ml-0.5 cursor-pointer rounded-full outline-none hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggle(item.id)
                  }}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
            <span
              className={cn(
                "text-sm text-muted-foreground",
                selected.length > 0 && "sr-only",
              )}
            >
              {placeholder}
            </span>
          </div>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar categorias..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={() => handleToggle(category.id)}
                >
                  <div
                    className={cn(
                      "mr-2 flex size-4 items-center justify-center rounded-sm border",
                      selected.includes(category.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input",
                    )}
                  >
                    {selected.includes(category.id) && (
                      <CheckIcon className="size-3" />
                    )}
                  </div>
                  {category.name}
                </CommandItem>
              ))}
              <div ref={sentinelRef} className="h-px" />
              {isFetchingNextPage && (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  Carregando mais...
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/multi-combobox.tsx && git commit -m "feat: add multi-combobox component with infinite scroll"
```

---

### Task 5: Integrate MultiCombobox into ProductForm

**Files:**
- Modify: `front-end/src/features/products/components/ProductForm.tsx`

- [ ] **Step 1: Update ProductForm.tsx**

Replace the category checkboxes section and remove the unused import.

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductControllerCreate, useProductControllerUpdate } from '@/api/generated/product/product';
import { MultiCombobox } from '@/components/ui/multi-combobox';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ProductResponseDto } from '@/api/generated/model';
```

Remove the line:
```tsx
import { useCategoryControllerFindAll } from '@/api/generated/category/category';
```

Remove the line:
```tsx
const { data: categoriesData } = useCategoryControllerFindAll({});
```

Remove the line:
```tsx
const categories = (categoriesData?.data?.data ?? []) as Array<{ id: string; name: string }>;
```

Replace the categories section (lines 114-135) with:

```tsx
<div className="space-y-2">
  <Label>Categorias</Label>
  <MultiCombobox
    selected={selectedCategories}
    onChange={setSelectedCategories}
    placeholder="Buscar categorias..."
  />
  {errors.categories && <p className="text-sm text-destructive">{errors.categories}</p>}
</div>
```

- [ ] **Step 2: Run lint to check**

Run:
```bash
pnpm lint
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/products/components/ProductForm.tsx && git commit -m "feat: replace category checkboxes with multi-combobox"
```

---

### Task 6: Update ProductForm tests

**Files:**
- Modify: `front-end/src/features/products/__tests__/ProductForm.test.tsx`

- [ ] **Step 1: Update test imports**

The test currently clicks a label by text (`Electronics`), which worked with checkboxes. Now the interaction changes since MultiCombobox uses a different interaction pattern.

Update the test to select categories through the MultiCombobox popover:

```tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildCategory } from '@/test/factories/category'
import { buildProduct } from '@/test/factories/product'
import { ProductForm } from '../components/ProductForm'

async function selectCategory(user: ReturnType<typeof userEvent.setup>, name: string) {
  const trigger = screen.getByRole('combobox')
  await user.click(trigger)
  const option = await screen.findByText(name)
  await user.click(option)
  // Close the popover by pressing Escape
  await user.keyboard('{Escape}')
}

describe('ProductForm', () => {
  beforeEach(() => {
    db.reset()
    db.categories.set('1', buildCategory({ id: '1', name: 'Electronics' }))
    db.categories.set('2', buildCategory({ id: '2', name: 'Books' }))
  })

  it('renders create mode with empty fields', () => {
    renderWithProviders(<ProductForm />)
    expect(screen.getByLabelText(/nome/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductForm />)
    await user.click(screen.getByRole('button', { name: /criar/i }))
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
  })

  it('shows validation error for negative price', async () => {
    const user = userEvent.setup()
    const product = buildProduct({ id: '1', name: 'Test', price: -10, categoryIds: ['1'] })
    db.products.set('1', product)

    renderWithProviders(<ProductForm product={product} />)
    await user.click(screen.getByRole('button', { name: /atualizar/i }))
    expect(screen.getByText(/preço não pode ser negativo/i)).toBeInTheDocument()
  })

  it('submits form and creates product', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductForm />, { initialEntries: ['/products/new'] })

    await user.type(screen.getByLabelText(/nome/i), 'New Product')
    await user.type(screen.getByLabelText(/preço/i), '150')
    await selectCategory(user, 'Electronics')
    await user.click(screen.getByRole('button', { name: /criar/i }))

    await waitFor(() => {
      const products = Array.from(db.products.values())
      expect(products.length).toBe(1)
      expect(products[0].name).toBe('New Product')
    })
  })

  it('renders edit mode with pre-filled data', () => {
    const product = buildProduct({ id: '1', name: 'Existing', price: 50, categoryIds: ['1'] })
    db.products.set('1', product)

    renderWithProviders(<ProductForm product={product} />)
    expect(screen.getByLabelText(/nome/i)).toHaveValue('Existing')
    expect(screen.getByLabelText(/preço/i)).toHaveValue(50)
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })

  it('submits edit and updates product', async () => {
    const user = userEvent.setup()
    const product = buildProduct({ id: '1', name: 'Old Name', price: 50, categoryIds: ['1'] })
    db.products.set('1', product)

    renderWithProviders(<ProductForm product={product} />)
    await user.clear(screen.getByLabelText(/nome/i))
    await user.type(screen.getByLabelText(/nome/i), 'Updated Name')
    await user.click(screen.getByRole('button', { name: /atualizar/i }))

    await waitFor(() => {
      expect(db.products.get('1')!.name).toBe('Updated Name')
    })
  })
})
```

- [ ] **Step 2: Run tests**

Run:
```bash
pnpm test:run
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/products/__tests__/ProductForm.test.tsx && git commit -m "test: update product form tests for multi-combobox"
```

---

### Task 7: Verify lint + tests

- [ ] **Step 1: Run lint**

Run:
```bash
pnpm lint
```

Expected: No lint errors.

- [ ] **Step 2: Run tests**

Run:
```bash
pnpm test:run
```

Expected: All tests pass.
