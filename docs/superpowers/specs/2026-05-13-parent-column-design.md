# Spec: Substituir coluna Descrição por Categoria Pai na Tabela

**Data:** 2026-05-13

## 1. Objetivo

Remover coluna "Descrição" da tabela de listagem de categorias e adicionar coluna "Categoria Pai" exibindo o nome da categoria pai. Caso não haja pai, exibir `"-"`.

## 2. Escopo

- **Frontend (tabela):** Remove coluna `description`, adiciona coluna `parent` com `row.parent?.name ?? '-'`
- **Backend (entidade):** Adiciona campo `parent?: Category | null` à entidade `Category` (apenas 1 nível, sem recursão)
- **Backend (Prisma repository):** Adiciona `include: { parent: true }` em `findAll` e `findById`
- **Backend (InMemory repository):** Resolve o pai a partir do array interno nos retornos de `findAll`, `findById` e `delete`
- **Backend (DTO/Response):** Cria `CategoryParentDto` e adiciona campo `parent` ao `CategoryResponseDto`
- **Testes (back-end):** Adiciona/corrige asserts para validar o campo `parent`
- **Testes (front-end):** Atualiza `CategoryTable.test.tsx` e factory `buildCategory`
- **Banco de dados:** Nenhuma alteração
- **Formulário CRUD:** Nenhuma alteração

## 3. Arquivos modificados

### 3.1 Backend — Entidade

**`back-end/src/domain/entities/category/category.entity.ts`**

- Adicionar `parent?: Category | null` ao `CategoryProps`
- Adicionar campo privado `_parent?: Category | null` com default `null`
- Adicionar getter `get parent()`

### 3.2 Backend — PrismaMapper

**`back-end/src/infra/database/prisma/mappers/category.mapper.ts`**

- `toDomain`: aceitar `data.parent`, mapear para nova `Category` sem resolver seu próprio `parent`
- `toPersistence`: propagar `parent: undefined` (não persiste)

### 3.3 Backend — PrismaRepository

**`back-end/src/infra/database/prisma/repositories/prisma-category.repository.ts`**

- `findAll`: `findMany({ ..., include: { parent: true } })`
- `findById`: `findUnique({ ..., include: { parent: true } })`

### 3.4 Backend — InMemoryRepository

**`back-end/src/infra/database/in-memory/repositories/in-memory-category.repository.ts`**

- `findById`: após encontrar a categoria, se `parentId` existir, buscar o pai no array
- `findAll`: após o slice, mapear cada categoria resolvendo o pai
- `delete`: sem alteração (não precisa de `parent`)

### 3.5 Backend — DTOs

**`back-end/src/infra/http/dtos/category/category-response.dto.ts`**

- Criar `CategoryParentDto` com: `id`, `name`, `description?`, `parentId?`, `createdAt`, `updatedAt` (sem campo `parent` — evita recursão)
- Adicionar ao `CategoryResponseDto`: `parent?: CategoryParentDto | null`

### 3.6 Backend — HTTP Mapper

**`back-end/src/infra/http/mappers/category-mapper.dto.ts`**

Mapear `data.parent` para `CategoryParentDto` no `toDto`.

### 3.7 Frontend — Tabela

**`front-end/src/features/categories/components/CategoryTable.tsx`**

- Remover coluna `description`
- Adicionar coluna `parent` com `(row) => row.parent?.name ?? '-'`

### 3.8 Frontend — Testes

**`front-end/src/features/categories/__tests__/CategoryTable.test.tsx`**

- Substituir `description` por `parent` nos dados mock
- Atualizar asserts para validar nome do pai e fallback `"-"`

**`front-end/src/test/factories/category.ts`**

- Adicionar `parent: null` ao objeto padrão

### 3.9 Frontend — Mocks de API

**`front-end/src/test/mocks/handlers.ts`**

- `POST */category`: incluir `parent: null` no objeto criado

### 3.10 Backend — Testes de entidade

**`back-end/src/domain/entities/category/category.entity.spec.ts`**

- `should default parent to null when not provided`
- `should accept parent object when provided`

### 3.11 Backend — Testes de use case

**`back-end/src/application/use-cases/category/find-all-categories.use-case.spec.ts`**

- Novo teste: `should include parent on categories when parentId is set`

**`back-end/src/application/use-cases/category/find-category-by-id.use-case.spec.ts`**

- Assert extra no teste existente: `expect(result.parent).toBeNull()`
- Novo teste: `should include parent when category has parentId`

## 4. Fluxo de dados

```
CategoryTable exibe coluna "Categoria Pai"
  │
  ▼
GET /category → Controller.findAll()
  │
  ▼
FindAllCategoriesUseCase → PrismaRepository.findAll()
  │
  ▼
Prisma: .findMany({ include: { parent: true } })
  │
  ▼
PrismaCategoryMapper.toDomain() → Category { parent: Category }
  │
  ▼
CategoryMapper.toDto() → CategoryResponseDto { parent: CategoryParentDto }
  │
  ▼
Response JSON → { data: [{ ..., parent: { id, name, ... } }] }
  │
  ▼
Frontend: row.parent?.name ?? '-'
```

## 5. Tratamento de casos

| Cenário | Comportamento |
|---|---|
| Categoria com `parentId` e pai existe no banco | `parent: { id, name, ... }` |
| Categoria com `parentId` mas pai foi soft-deletado | `parent: null` (Prisma filtra `deletedAt` pelo escopo da query) |
| Categoria raiz (sem `parentId`) | `parent: null` |
| Na InMemoryRepository | Resolve pai sincronamente do array |

## 6. Regeneração de tipos

Após as mudanças no backend, executar no front-end:
```bash
cd front-end && pnpm generate:api
```
