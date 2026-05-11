import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/products', label: 'Produtos' },
  { to: '/categories', label: 'Categorias' },
];

export function Header() {
  const { pathname } = useLocation();

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto flex items-center gap-6 h-14 px-4">
        <Link to="/" className="font-bold text-lg">Coderlab Inventory</Link>
        <nav className="flex gap-4">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname.startsWith(to) ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
