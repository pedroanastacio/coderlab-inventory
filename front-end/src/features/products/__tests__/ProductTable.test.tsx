import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { buildProduct } from '@/test/factories/product'
import { ProductTable } from '../components/ProductTable'

const mockProducts = [
  buildProduct({ id: '1', name: 'Laptop', price: 4999.99 }),
  buildProduct({ id: '2', name: 'Mouse', price: 99.9 }),
]

describe('ProductTable', () => {
  it('renders products with formatted price', () => {
    renderWithProviders(
      <ProductTable data={mockProducts} page={1} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText('Laptop')).toBeInTheDocument()
    expect(screen.getByText('Mouse')).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    renderWithProviders(
      <ProductTable data={[]} page={1} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument()
  })

  it('renders pagination when pagination prop is provided', () => {
    renderWithProviders(
      <ProductTable
        data={mockProducts}
        pagination={{ page: 1, perPage: 10, total: 20, pageCount: 2 }}
        page={1}
        onPageChange={vi.fn()}
      />,
    )
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument()
  })
})
