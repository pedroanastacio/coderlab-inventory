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
import { useProductControllerDelete } from '@/api/generated/product/product';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteProductDialogProps {
  productId: string;
  productName: string;
}

export function DeleteProductDialog({ productId, productName }: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useProductControllerDelete();

  const handleDelete = () => {
    mutation.mutate(
      { id: productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/product'] });
          toast.success('Produto excluído com sucesso');
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message ?? 'Erro ao excluir produto');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Excluir produto"><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Produto</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong>{productName}</strong>? Esta ação não pode ser desfeita.
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
