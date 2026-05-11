import { useParams } from 'react-router-dom';
import { useCategoryControllerFindById } from '@/api/generated/category/category';
import { CategoryForm } from '../components/CategoryForm';

function CategoryEditPage({ id }: { id: string }) {
  const { data } = useCategoryControllerFindById(id);
  return <CategoryForm key={id} category={data?.data} />;
}

export default function CategoryFormPage() {
  const { id } = useParams();

  if (id) {
    return <CategoryEditPage id={id} />;
  }

  return <CategoryForm />;
}
