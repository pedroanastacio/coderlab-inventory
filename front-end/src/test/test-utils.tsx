import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { Toaster } from 'sonner'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

interface WrapperOptions {
  initialEntries?: string[]
}

function createWrapper(options: WrapperOptions = {}) {
  const queryClient = createTestQueryClient()
  const { initialEntries = ['/'] } = options

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
          <Toaster />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

export function renderWithProviders(
  ui: ReactElement,
  options?: WrapperOptions & Omit<RenderOptions, 'wrapper'>,
) {
  const { initialEntries, ...renderOptions } = options || {}
  return {
    ...render(ui, { wrapper: createWrapper({ initialEntries }), ...renderOptions }),
  }
}
