import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toaster } from 'sonner';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto p-4">
        <Outlet />
      </main>
      <Toaster richColors />
    </div>
  );
}
