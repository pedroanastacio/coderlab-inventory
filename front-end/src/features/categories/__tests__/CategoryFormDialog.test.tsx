import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildCategory } from '@/test/factories/category'
import { CategoryFormDialog } from '../components/CategoryFormDialog'

describe('CategoryFormDialog', () => {
  beforeEach(() => {
    db.reset()
    db.categories.set('seed-1', buildCategory({ id: 'seed-1', name: 'Parent Cat' }))
  })

  it('renders create dialog with empty form', () => {
    renderWithProviders(
      <CategoryFormDialog open onOpenChange={vi.fn()} />,
    )
    expect(screen.getByRole('dialog', { name: /nova categoria/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nome/i)).toHaveValue('')
  })

  it('renders edit dialog with prefilled data', async () => {
    const category = buildCategory({ id: '2', name: 'Edit Me', description: 'Desc' })
    db.categories.set('2', category)
    renderWithProviders(
      <CategoryFormDialog open onOpenChange={vi.fn()} editCategory={category} />,
    )
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toHaveValue('Edit Me')
    })
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })

  it('closes dialog on successful create', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <CategoryFormDialog open onOpenChange={onOpenChange} />,
    )
    await user.type(screen.getByLabelText(/nome/i), 'New Category')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('closes dialog on successful edit', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    const category = buildCategory({ id: '2', name: 'Old Name' })
    db.categories.set('2', category)
    renderWithProviders(
      <CategoryFormDialog open onOpenChange={onOpenChange} editCategory={category} />,
    )
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toHaveValue('Old Name')
    })
    await user.clear(screen.getByLabelText(/nome/i))
    await user.type(screen.getByLabelText(/nome/i), 'Updated')
    await user.click(screen.getByRole('button', { name: /atualizar/i }))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('does not render when closed', () => {
    renderWithProviders(
      <CategoryFormDialog open={false} onOpenChange={vi.fn()} />,
    )
    expect(screen.queryByText(/nova categoria/i)).not.toBeInTheDocument()
  })
})
