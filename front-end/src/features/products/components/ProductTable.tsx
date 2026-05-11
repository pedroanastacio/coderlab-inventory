import { useMemo } from 'react';

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
import { DeleteProductDialog } from './DeleteProductDialog';
import type { ProductResponseDto } from '@/api/generated/model';
import type { PaginatedResponseDtoPagination } from '@/api/generated/model';

const columnHelper = createColumnHelper<ProductResponseDto>();

interface ProductTableProps {
  data: ProductResponseDto[];
  pagination?: PaginatedResponseDtoPagination;
  page: number;
  onPageChange: (page: number) => void;
  onEdit?: (product: ProductResponseDto) => void;
}

export function ProductTable({ data, pagination, page, onPageChange, onEdit }: ProductTableProps) {
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Nome',
    }),
    columnHelper.accessor('price', {
      header: 'Preço',
      cell: (info) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Editar produto"
            onClick={() => onEdit?.(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteProductDialog productId={row.original.id} productName={row.original.name} />
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
                  Nenhum produto encontrado
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
