import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryTable } from '../components/CategoryTable';
import { useCategoryControllerFindAll } from '@/api/generated/category/category';

export default function CategoryListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useCategoryControllerFindAll({
    query: search || undefined,
    page,
    perPage: 10,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Link to="/categories/new">
          <Button><Plus className="mr-2 h-4 w-4" />Nova Categoria</Button>
        </Link>
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
      />
    </div>
  );
}
