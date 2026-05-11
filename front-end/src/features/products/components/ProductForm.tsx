import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductControllerCreate, useProductControllerUpdate } from '@/api/generated/product/product';
import { useCategoryControllerFindAll } from '@/api/generated/category/category';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ProductResponseDto } from '@/api/generated/model';

interface ProductFormProps {
  product?: ProductResponseDto;
}

export function ProductForm({ product }: ProductFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(product?.categoryIds ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useProductControllerCreate();
  const updateMutation = useProductControllerUpdate();
  const { data: categoriesData } = useCategoryControllerFindAll({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (price < 0) newErrors.price = 'Preço não pode ser negativo';
    if (selectedCategories.length === 0) newErrors.categories = 'Selecione pelo menos uma categoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      description: description || undefined,
      price,
      categoryIds: selectedCategories,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: product!.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/product'] });
            toast.success('Produto atualizado com sucesso');
            navigate('/products');
          },
          onError: (error) => toast.error(error.message ?? 'Erro ao atualizar produto'),
        },
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/product'] });
            toast.success('Produto criado com sucesso');
            navigate('/products');
          },
          onError: (error) => toast.error(error.message ?? 'Erro ao criar produto'),
        },
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const categories = (categoriesData?.data?.data ?? []) as Array<{ id: string; name: string }>;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço</Label>
            <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
          </div>
          <div className="space-y-2">
            <Label>Categorias</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => {
                      setSelectedCategories((prev) =>
                        e.target.checked
                          ? [...prev, cat.id]
                          : prev.filter((id) => id !== cat.id),
                      );
                    }}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
            {errors.categories && <p className="text-sm text-destructive">{errors.categories}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate('/products')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
