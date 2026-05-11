import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page} de {pageCount}
      </span>
      <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} aria-label="Próxima página">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
