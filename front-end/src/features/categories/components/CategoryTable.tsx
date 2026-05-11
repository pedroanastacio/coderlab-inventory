import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Pagination } from '@/components/shared/Pagination';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import type { CategoryResponseDto } from '@/api/generated/model';
import type { PaginatedResponseDtoPagination } from '@/api/generated/model';

const columnHelper = createColumnHelper<CategoryResponseDto>();

interface CategoryTableProps {
  data: CategoryResponseDto[];
  pagination?: PaginatedResponseDtoPagination;
  page: number;
  onPageChange: (page: number) => void;
}

export function CategoryTable({ data, pagination, page, onPageChange }: CategoryTableProps) {
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Nome',
    }),
    columnHelper.accessor('description', {
      header: 'Descrição',
      cell: (info) => info.getValue() ?? '-',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link to={`/categories/${row.original.id}/edit`}>
            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
          </Link>
          <DeleteCategoryDialog categoryId={row.original.id} categoryName={row.original.name} />
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  Nenhuma categoria encontrada
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <Pagination page={page} pageCount={pagination.pageCount ?? 1} onPageChange={onPageChange} />
      )}
    </div>
  );
}
