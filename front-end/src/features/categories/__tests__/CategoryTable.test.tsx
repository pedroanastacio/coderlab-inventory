import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { buildCategory } from '@/test/factories/category'
import { CategoryTable } from '../components/CategoryTable'

const mockCategories = [
  buildCategory({ id: '1', name: 'Tech', description: 'Tech stuff' }),
  buildCategory({ id: '2', name: 'No Desc', description: null }),
]

describe('CategoryTable', () => {
  it('renders categories', () => {
    renderWithProviders(
      <CategoryTable data={mockCategories} page={1} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('Tech stuff')).toBeInTheDocument()
  })

  it('shows dash for missing description', () => {
    renderWithProviders(
      <CategoryTable data={[mockCategories[1]]} page={1} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    renderWithProviders(
      <CategoryTable data={[]} page={1} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText(/nenhuma categoria encontrada/i)).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <CategoryTable data={[mockCategories[0]]} page={1} onPageChange={vi.fn()} onEdit={onEdit} />,
    )
    await user.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(mockCategories[0])
  })
})
