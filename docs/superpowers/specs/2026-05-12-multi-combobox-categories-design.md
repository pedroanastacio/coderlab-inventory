# Multi-Combobox para Seleção de Categorias

## Resumo
Substituir os checkboxes de categorias no formulário de produtos por um componente
multi-select com autocomplete e infinite scroll.

## Componente: MultiCombobox
- Localização: `front-end/src/components/ui/multi-combobox.tsx`
- Base: shadcn `Command` (cmdk) + `Badge`
- Estrutura:
  - Trigger container com `flex-wrap`: `Badge` dos selecionados + `<input>` de busca
  - Cada badge tem botão `X` para remover a categoria
  - Dropdown: `Popover` com `Command` + `CommandInput` + `CommandList` + `CommandItem`
  - Último item da lista: sentinela com `IntersectionObserver` para infinite scroll

## Data Flow
- `useInfiniteQuery` com query key `['categories', searchTerm]`
- Chama `GET /category?page=N&perPage=20&query=searchTerm`
- `getNextPageParam` baseado em `data.meta.totalPages`
- Debounce de 300ms no `CommandInput` antes de atualizar searchTerm
- Resultados achatados: `pages.flatMap(p => p.data)`

## Props
```ts
interface MultiComboboxProps {
  selected: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
}
```

## Integração no ProductForm
- Substituir bloco de checkboxes por `<MultiCombobox>`
- Remover `useCategoryControllerFindAll({})`
- `selectedCategories` (string[]) e validação permanecem inalterados

## Sem alterações no backend
