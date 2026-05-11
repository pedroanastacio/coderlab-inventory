import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useCategoryControllerDelete } from '@/api/generated/category/category';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryDialog({ categoryId, categoryName }: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useCategoryControllerDelete();

  const handleDelete = () => {
    mutation.mutate(
      { id: categoryId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/category'] });
          toast.success('Categoria excluída com sucesso');
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message ?? 'Erro ao excluir categoria');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Excluir categoria"><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Categoria</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong>{categoryName}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={mutation.isPending}>
            {mutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
