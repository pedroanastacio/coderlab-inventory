# Substituir Coluna Descrição por Categoria Pai — Plano de Implementação

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax.

**Goal:** Remover coluna "Descrição" da tabela de categorias e adicionar coluna "Categoria Pai" com fallback `"-"` para categorias raiz

**Architecture:** Adicionar `parent?: Category | null` à entidade de domínio. Prisma repository faz `include: { parent: true }`. InMemory repository resolve pai do array interno. DTO retorna `CategoryParentDto` sem campo `parent` (evita recursão). Frontend troca a coluna e consome `row.parent?.name`.

**Tech Stack:** NestJS, Prisma, React, TanStack Table

---

### Task 1: Adicionar `parent` à entidade `Category`

**Files:**
- Modify: `back-end/src/domain/entities/category/category.entity.ts`

- [ ] **Adicionar `parent` ao `CategoryProps` e à classe**

No `CategoryProps`:
```typescript
parent?: Category | null;
```

Na classe `Category`, após `_parentId`:
```typescript
private _parent?: Category | null;
```

No construtor, após `this._parentId`:
```typescript
this._parent = props.parent ?? null;
```

Getter, após `get parentId()`:
```typescript
get parent() {
  return this._parent;
}
```

- [ ] **Commit**

```bash
git add back-end/src/domain/entities/category/category.entity.ts
git commit -m "feat: add parent field to Category entity"
```

---

### Task 2: Atualizar PrismaCategoryMapper

**Files:**
- Modify: `back-end/src/infra/database/prisma/mappers/category.mapper.ts`

- [ ] **Modificar `toDomain` para aceitar e mapear `parent`**

```typescript
import { Category as PrismaCategory } from '../../../../generated/prisma/client';
import { Category } from '../../../../domain/entities/category/category.entity';

type PrismaCategoryWithParent = PrismaCategory & {
  parent?: PrismaCategory | null;
};

export class PrismaCategoryMapper {
  static toDomain(data: PrismaCategoryWithParent): Category {
    return new Category({
      id: data.id,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      parent: data.parent
        ? new Category({
            id: data.parent.id,
            name: data.parent.name,
            description: data.parent.description,
            parentId: data.parent.parentId,
            deletedAt: data.parent.deletedAt,
            createdAt: data.parent.createdAt,
            updatedAt: data.parent.updatedAt,
          })
        : null,
      deletedAt: data.deletedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toPersistence(category: Category): PrismaCategory {
    return {
      id: category.id,
      name: category.name,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
      deletedAt: category.deletedAt ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
```

- [ ] **Commit**

```bash
git add back-end/src/infra/database/prisma/mappers/category.mapper.ts
git commit -m "feat: map parent relation in PrismaCategoryMapper"
```

---

### Task 3: Adicionar `include: { parent: true }` no PrismaRepository

**Files:**
- Modify: `back-end/src/infra/database/prisma/repositories/prisma-category.repository.ts`

- [ ] **`findById` — adicionar `include`**

```typescript
async findById(id: string): Promise<Category | null> {
  const data = await this.prisma.category.findUnique({
    where: { id },
    include: { parent: true },
  });

  if (!data || data.deletedAt) {
    return null;
  }

  return PrismaCategoryMapper.toDomain(data);
}
```

- [ ] **`findAll` — adicionar `include`**

```typescript
const data = await this.prisma.category.findMany({
  where: whereClause,
  skip: (pagination.page - 1) * pagination.perPage,
  take: pagination.perPage,
  orderBy: {
    [sort.sortBy]: sort.sortOrder,
  },
  include: { parent: true },
});
```

- [ ] **Commit**

```bash
git add back-end/src/infra/database/prisma/repositories/prisma-category.repository.ts
git commit -m "feat: include parent relation in Prisma category queries"
```

---

### Task 4: Resolver `parent` no InMemoryCategoryRepository

**Files:**
- Modify: `back-end/src/infra/database/in-memory/repositories/in-memory-category.repository.ts`

- [ ] **`findById` — resolver pai do array**

```typescript
async findById(id: string): Promise<Category | null> {
  const cat = this.categories.find((c) => c.id === id && !c.deletedAt);
  if (!cat) return null;

  const parent = cat.parentId
    ? this.categories.find((c) => c.id === cat.parentId && !c.deletedAt) ?? null
    : null;

  return Promise.resolve(
    new Category({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      parentId: cat.parentId,
      parent,
      deletedAt: cat.deletedAt,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }),
  );
}
```

- [ ] **`findAll` — mapear cada resultado resolvendo pai**

```typescript
const data = result.slice(start, start + pagination.perPage).map((cat) => {
  const parent = cat.parentId
    ? this.categories.find((c) => c.id === cat.parentId && !c.deletedAt) ?? null
    : null;

  return new Category({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    parentId: cat.parentId,
    parent,
    deletedAt: cat.deletedAt,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  });
});
```

- [ ] **Commit**

```bash
git add back-end/src/infra/database/in-memory/repositories/in-memory-category.repository.ts
git commit -m "feat: resolve parent in InMemoryCategoryRepository"
```

---

### Task 5: Criar `CategoryParentDto` e adicionar ao response

**Files:**
- Modify: `back-end/src/infra/http/dtos/category/category-response.dto.ts`

- [ ] **Adicionar imports e `CategoryParentDto`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryParentDto {
  @IsUUID()
  @ApiProperty({ type: 'string', format: 'uuid' })
  id!: string;

  @IsString()
  @ApiProperty({ type: 'string' })
  name!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', nullable: true, required: false })
  description?: string | null;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ type: 'string', format: 'uuid', nullable: true, required: false })
  parentId?: string | null;

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;

  @IsDateString()
  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: Date;
}
```

- [ ] **Adicionar `parent` ao `CategoryResponseDto`**

```typescript
@ValidateNested()
@Type(() => CategoryParentDto)
@ApiProperty({ type: CategoryParentDto, nullable: true, required: false })
parent?: CategoryParentDto | null;
```

- [ ] **Commit**

```bash
git add back-end/src/infra/http/dtos/category/category-response.dto.ts
git commit -m "feat: add CategoryParentDto and parent field to response"
```

---

### Task 6: Mapear `parent` no CategoryMapper HTTP

**Files:**
- Modify: `back-end/src/infra/http/mappers/category-mapper.dto.ts`

- [ ] **Adicionar `parent` ao `toDto`**

```typescript
import { Category } from '../../../domain/entities/category/category.entity';
import { CategoryResponseDto, CategoryParentDto } from '../dtos/category/category-response.dto';

export class CategoryMapper {
  static toDto(data: Category): CategoryResponseDto {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      parent: data.parent
        ? {
            id: data.parent.id,
            name: data.parent.name,
            description: data.parent.description,
            parentId: data.parent.parentId,
            createdAt: data.parent.createdAt,
            updatedAt: data.parent.updatedAt,
          }
        : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
```

- [ ] **Commit**

```bash
git add back-end/src/infra/http/mappers/category-mapper.dto.ts
git commit -m "feat: map parent in CategoryMapper toDto"
```

---

### Task 7: Atualizar testes da entidade Category

**Files:**
- Modify: `back-end/src/domain/entities/category/category.entity.spec.ts`

- [ ] **Adicionar 2 testes no describe `Constructor`**

```typescript
it('should default parent to null when not provided', () => {
  const props = getMockCategoryProps();
  const category = new Category(props);

  expect(category.parent).toBeNull();
});

it('should accept parent object when provided', () => {
  const parent = new Category(getMockCategoryProps({ id: 'parent-1', name: 'Parent' }));
  const category = new Category(
    getMockCategoryProps({ name: 'Child', parentId: parent.id, parent }),
  );

  expect(category.parent).toBeDefined();
  expect(category.parent!.id).toBe('parent-1');
  expect(category.parent!.name).toBe('Parent');
});
```

- [ ] **Rodar testes**

Run: `cd back-end && npx jest src/domain/entities/category/category.entity.spec.ts`
Expected: PASS

- [ ] **Commit**

```bash
git add back-end/src/domain/entities/category/category.entity.spec.ts
git commit -m "test: add parent entity tests"
```

---

### Task 8: Atualizar testes de use case — findAll

**Files:**
- Modify: `back-end/src/application/use-cases/category/find-all-categories.use-case.spec.ts`

- [ ] **Adicionar teste `should include parent on categories when parentId is set`**

```typescript
it('should include parent on categories when parentId is set', async () => {
  const parent = await createCategoryInMemory(repository, { name: 'Electronics' });
  const child = await createCategoryInMemory(repository, {
    name: 'Smartphones',
    parentId: parent.id,
  });

  const input = getMockFindAllCategoriesInput();
  const result = await useCase.execute(input);

  const childResult = result.data.find((c) => c.id === child.id);
  expect(childResult?.parent).toBeDefined();
  expect(childResult?.parent?.name).toBe('Electronics');
  expect(childResult?.parent?.id).toBe(parent.id);
});
```

- [ ] **Rodar testes**

Run: `cd back-end && npx jest src/application/use-cases/category/find-all-categories.use-case.spec.ts`
Expected: PASS

- [ ] **Commit**

```bash
git add back-end/src/application/use-cases/category/find-all-categories.use-case.spec.ts
git commit -m "test: add parent resolution test for findAll"
```

---

### Task 9: Atualizar testes de use case — findById

**Files:**
- Modify: `back-end/src/application/use-cases/category/find-category-by-id.use-case.spec.ts`

- [ ] **Adicionar assert no teste `should return category when found`**

```typescript
it('should return category when found', async () => {
  const result = await useCase.execute({ id: 'category-123' });

  expect(result.id).toBe('category-123');
  expect(result.name).toBe('Electronics');
  expect(result.parent).toBeNull();
});
```

- [ ] **Adicionar novo teste**

```typescript
it('should include parent when category has parentId', async () => {
  const parent = await repository.create(
    new Category({ id: 'parent-1', name: 'Parent' }),
  );

  await repository.create(
    new Category({ id: 'child-1', name: 'Child', parentId: parent.id }),
  );

  const result = await useCase.execute({ id: 'child-1' });

  expect(result.parent).toBeDefined();
  expect(result.parent?.name).toBe('Parent');
  expect(result.parent?.id).toBe('parent-1');
});
```

- [ ] **Rodar testes**

Run: `cd back-end && npx jest src/application/use-cases/category/find-category-by-id.use-case.spec.ts`
Expected: PASS

- [ ] **Commit**

```bash
git add back-end/src/application/use-cases/category/find-category-by-id.use-case.spec.ts
git commit -m "test: add parent resolution test for findById"
```

---

### Task 10: Regenerar tipos gerados da API no front-end

**Files:**
- None (tipo gerado via orval)

- [ ] **Rodar `generate:api`**

```bash
cd /home/pedroh/www/personal/wt-category-table/front-end
pnpm generate:api
```

Expected: Atualiza `src/api/generated/model/index.ts` com `CategoryParentDto` e `parent` field no `CategoryResponseDto`.

- [ ] **Commit**

```bash
git add front-end/src/api
git commit -m "chore: regenerate API types for parent field"
```

---

### Task 11: Atualizar `CategoryTable` — trocar colunas

**Files:**
- Modify: `front-end/src/features/categories/components/CategoryTable.tsx`

- [ ] **Substituir coluna `description` por `parent`**

No array `columns`, remover:
```typescript
columnHelper.accessor('description', {
  header: 'Descrição',
  cell: (info) => info.getValue() ?? '-',
}),
```

Adicionar no lugar:
```typescript
columnHelper.accessor((row) => row.parent?.name ?? '-', {
  id: 'parent',
  header: 'Categoria Pai',
  cell: (info) => info.getValue(),
}),
```

- [ ] **Rodar typecheck**

```bash
cd front-end && npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add front-end/src/features/categories/components/CategoryTable.tsx
git commit -m "feat: replace description column with parent category column"
```

---

### Task 12: Atualizar factory `buildCategory`

**Files:**
- Modify: `front-end/src/test/factories/category.ts`

- [ ] **Adicionar `parent: null` ao objeto padrão**

```typescript
import type { CategoryResponseDto } from '@/api/generated/model'

let counter = 1
export function buildCategory(overrides?: Partial<CategoryResponseDto>): CategoryResponseDto {
  const id = String(counter++)
  return {
    id,
    name: `Category ${id}`,
    description: `Description for category ${id}`,
    parentId: null,
    parent: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}
```

- [ ] **Commit**

```bash
git add front-end/src/test/factories/category.ts
git commit -m "test: add parent null default to buildCategory factory"
```

---

### Task 13: Atualizar mocks de API (handlers)

**Files:**
- Modify: `front-end/src/test/mocks/handlers.ts`

- [ ] **Adicionar `parent: null` na criação via POST**

No `POST */category`, adicionar `parent: null` no objeto:
```typescript
const category: CategoryResponseDto = {
  id,
  name: body.name as string,
  description: (body.description as string | null) ?? null,
  parentId: (body.parentId as string | null) ?? null,
  parent: null,
  createdAt: now,
  updatedAt: now,
}
```

- [ ] **Commit**

```bash
git add front-end/src/test/mocks/handlers.ts
git commit -m "test: add parent null to mock category creation"
```

---

### Task 14: Atualizar testes do `CategoryTable`

**Files:**
- Modify: `front-end/src/features/categories/__tests__/CategoryTable.test.tsx`

- [ ] **Atualizar dados mock e asserts**

```typescript
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { buildCategory } from '@/test/factories/category'
import { CategoryTable } from '../components/CategoryTable'

const mockCategories = [
  buildCategory({
    id: '1',
    name: 'Tech',
    parent: {
      id: 'p1',
      name: 'Root',
      description: null,
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }),
  buildCategory({ id: '2', name: 'Orphan', parent: null }),
]

describe('CategoryTable', () => {
  it('renders categories and parent name', () => {
    renderWithProviders(
      <CategoryTable data={mockCategories} page={1} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('Root')).toBeInTheDocument()
  })

  it('shows dash for missing parent', () => {
    renderWithProviders(
      <CategoryTable data={[mockCategories[1]]} page={1} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    renderWithProviders(
      <CategoryTable data={[]} page={1} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText(/nenhuma categoria encontrada/i)).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <CategoryTable data={[mockCategories[0]]} page={1} onPageChange={vi.fn()} onEdit={onEdit} />,
    )
    await user.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(mockCategories[0])
  })
})
```

- [ ] **Rodar testes**

Run: `cd front-end && npx vitest src/features/categories/__tests__/CategoryTable.test.tsx`
Expected: PASS

- [ ] **Commit**

```bash
git add front-end/src/features/categories/__tests__/CategoryTable.test.tsx
git commit -m "test: update CategoryTable tests for parent column"
```
