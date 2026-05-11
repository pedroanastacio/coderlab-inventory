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
