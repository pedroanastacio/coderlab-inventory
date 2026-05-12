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
            {selected.map((id) => {
              const cat = categories.find((c) => c.id === id)
              return cat ? (
                <Badge key={cat.id} variant="secondary" className="gap-1">
                  {cat.name}
                  <button
                    type="button"
                    className="ml-0.5 cursor-pointer rounded-full outline-none hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggle(cat.id)
                    }}
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ) : null
            })}
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
