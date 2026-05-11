# Frontend Design — Coderlab Inventory

## Tech Stack

- React 19 + TypeScript + Vite
- React Router v7
- TanStack Query v5 (`suspense: true`)
- TanStack Table v8
- Tailwind CSS v4 + shadcn/ui (New York, Neutral)
- Orval (geração de API client + TanStack Query hooks)
- Axios
- Lucide React (ícones)
- Sonner (toasts)

## Rotas

| Path                   | Page               | Description                |
|------------------------|--------------------|----------------------------|
| `/`                    | Redirect → `/products` |                      |
| `/products`            | `ProductListPage`  | Tabela com filtro, paginação |
| `/products/new`        | `ProductFormPage`  | Criação                    |
| `/products/:id/edit`   | `ProductFormPage`  | Edição                     |
| `/categories`          | `CategoryListPage` | Tabela                     |
| `/categories/new`      | `CategoryFormPage` | Criação                    |
| `/categories/:id/edit` | `CategoryFormPage` | Edição                     |

## Estrutura de Diretórios

```
front-end/src/
├── api/generated/             # Orval output (gitignored)
│   ├── product/
│   ├── category/
│   └── model/
├── features/
│   ├── products/
│   │   ├── components/         # ProductTable (TanStack Table), ProductForm
│   │   └── pages/              # ProductListPage, ProductFormPage
│   └── categories/
│       ├── components/         # CategoryTable (TanStack Table), CategoryForm
│       └── pages/              # CategoryListPage, CategoryFormPage
├── components/
│   ├── ui/                     # shadcn primitives (button, table, dialog, etc.)
│   └── layout/                 # AppLayout, Header
├── lib/
│   ├── utils.ts                # cn()
│   └── api-client.ts           # Axios instance para Orval
├── routes/
│   └── index.tsx               # React Router config com Suspense + ErrorBoundary
├── App.tsx
└── main.tsx                    # QueryClientProvider + RouterProvider
```

## Data Flow

1. Backend expõe OpenAPI spec em `GET /api-json` (via `SwaggerModule.setup()`)
2. Orval lê de `http://localhost:3000/api-json` e gera:
   - Schemas TypeScript em `src/api/generated/model/`
   - Axios client em `src/api/generated/{product,category}/`
   - TanStack Query hooks em `src/api/generated/{product,category}/`
3. Features consomem hooks gerados diretamente
4. Mutations invalidam queries no `onSuccess`

## Suspense + Error Boundaries

- `QueryClient` config: `defaultOptions.queries.suspense = true`, `defaultOptions.queries.throwOnError = true`
- Cada list page é: `ErrorBoundary > Suspense fallback={<PageSkeleton />} > Page`
- Formulários de edição carregam dados via Suspense
- Mutations (create/update/delete) tratam loading/error localmente (botão disabled, toast com Sonner)
- Error boundaries das listagens não capturam erros de mutation

## Componentes

### ProductListPage
- Search input com debounce (300ms)
- TanStack Table: Nome, Preço (formatado), Categorias, Ações (editar/deletar)
- Paginação com shadcn Pagination
- Diálogo de confirmação para exclusão (shadcn Dialog)
- Skeleton durante loading

### ProductFormPage
- Reutiliza `ProductForm` para criação e edição
- Detecta modo por presença de `:id` na URL
- Campos: Nome (input), Descrição (textarea), Preço (input number), Categorias (multi-select com checkboxes)
- Validação client-side (required, preço >= 0)
- Toast + redirect no sucesso

### CategoryListPage / CategoryFormPage
- Análogo a products
- CategoryForm com select de Categoria Pai (carrega categorias existentes via query)

### Layout
- Header fixo no topo com nav links: Produtos | Categorias
- Container responsivo (max-w-7xl mx-auto)
- Sem sidebar

## Backend Change

Adicionar 1 linha em `back-end/src/main.ts`:
```ts
SwaggerModule.setup('api', app, document);
```
Isso expõe `/api-json` com o raw OpenAPI spec para o Orval consumir (além da Swagger UI em `/api`).

## Setup Command Order

1. Scaffold: `pnpm create vite front-end --template react-ts`
2. Instalar dependências
3. Configurar Tailwind v4: `pnpm add tailwindcss @tailwindcss/vite`, adicionar plugin no vite.config.ts
4. shadcn init + add componentes
5. Backend: adicionar `SwaggerModule.setup()` no `main.ts`
6. Criar `orval.config.ts` + script `generate:api` no package.json
7. Subir backend + executar `pnpm generate:api`
8. Criar estrutura de pastas
9. Implementar: layout → rotas → features (products → categories)
10. Testar integração
