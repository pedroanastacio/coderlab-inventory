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
