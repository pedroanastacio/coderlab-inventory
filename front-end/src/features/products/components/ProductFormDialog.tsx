import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import type { ProductResponseDto } from '@/api/generated/model';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct?: ProductResponseDto;
}

export function ProductFormDialog({ open, onOpenChange, editProduct }: ProductFormDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <ProductForm
          key={editProduct?.id ?? 'create'}
          product={editProduct}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
