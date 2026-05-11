import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCategoryControllerCreate, useCategoryControllerUpdate } from '@/api/generated/category/category';
import { useCategoryControllerFindAll } from '@/api/generated/category/category';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CategoryResponseDto } from '@/api/generated/model';

interface CategoryFormProps {
  category?: CategoryResponseDto;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [parentId, setParentId] = useState(category?.parentId ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCategoryControllerCreate();
  const updateMutation = useCategoryControllerUpdate();
  const { data: categoriesData } = useCategoryControllerFindAll({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (parentId === category?.id) newErrors.parentId = 'Uma categoria não pode ser pai dela mesma';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      description: description || undefined,
      parentId: parentId || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: category!.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/category'] });
            toast.success('Categoria atualizada com sucesso');
            navigate('/categories');
          },
          onError: (error) => toast.error(error.message ?? 'Erro ao atualizar categoria'),
        },
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/category'] });
            toast.success('Categoria criada com sucesso');
            navigate('/categories');
          },
          onError: (error) => toast.error(error.message ?? 'Erro ao criar categoria'),
        },
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const categories = categoriesData?.data?.data ?? [];

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</CardTitle>
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
            <Label htmlFor="parentId">Categoria Pai</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma (categoria raiz)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma (categoria raiz)</SelectItem>
                {categories
                  .filter((cat) => cat.id !== category?.id)
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.parentId && <p className="text-sm text-destructive">{errors.parentId}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate('/categories')}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
