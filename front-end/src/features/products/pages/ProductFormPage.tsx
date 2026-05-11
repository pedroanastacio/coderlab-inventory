import { useParams } from 'react-router-dom';
import { useProductControllerFindById } from '@/api/generated/product/product';
import { ProductForm } from '../components/ProductForm';

function ProductEditPage({ id }: { id: string }) {
  const { data } = useProductControllerFindById(id);
  return <ProductForm key={id} product={data?.data} />;
}

export default function ProductFormPage() {
  const { id } = useParams();

  if (id) {
    return <ProductEditPage id={id} />;
  }

  return <ProductForm />;
}
