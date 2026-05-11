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
