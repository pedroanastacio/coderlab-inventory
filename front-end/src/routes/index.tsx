import { Suspense, lazy, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { ErrorPage } from '@/components/shared/ErrorPage';

const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage'));
const ProductFormPage = lazy(() => import('@/features/products/pages/ProductFormPage'));
const CategoryListPage = lazy(() => import('@/features/categories/pages/CategoryListPage'));
const CategoryFormPage = lazy(() => import('@/features/categories/pages/CategoryFormPage'));

class ErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="/products" element={
            <ErrorBoundary fallback={<ErrorPage />}>
              <Suspense fallback={<PageSkeleton />}>
                <ProductListPage />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={
            <Suspense fallback={<PageSkeleton />}>
              <ProductFormPage />
            </Suspense>
          } />
          <Route path="/categories" element={
            <ErrorBoundary fallback={<ErrorPage />}>
              <Suspense fallback={<PageSkeleton />}>
                <CategoryListPage />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/categories/new" element={<CategoryFormPage />} />
          <Route path="/categories/:id/edit" element={
            <Suspense fallback={<PageSkeleton />}>
              <CategoryFormPage />
            </Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
