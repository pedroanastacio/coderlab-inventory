import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error?: Error;
}

export function ErrorPage({ error }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm">
        {error?.message ?? 'An unexpected error occurred.'}
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try again
      </Button>
    </div>
  );
}
