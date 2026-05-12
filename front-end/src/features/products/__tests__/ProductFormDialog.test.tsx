import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildCategory } from '@/test/factories/category'
import { buildProduct } from '@/test/factories/product'
import { ProductFormDialog } from '../components/ProductFormDialog'

async function selectCategory(user: ReturnType<typeof userEvent.setup>, name: string) {
  const trigger = screen.getByRole('combobox')
  await user.click(trigger)
  const option = await screen.findByText(name)
  await user.click(option)
  await user.keyboard('{Escape}')
}

describe('ProductFormDialog', () => {
  beforeEach(() => {
    db.reset()
    db.categories.set('1', buildCategory({ id: '1', name: 'Electronics' }))
    db.categories.set('2', buildCategory({ id: '2', name: 'Books' }))
  })

  it('renders create dialog with empty form', () => {
    renderWithProviders(
      <ProductFormDialog open onOpenChange={vi.fn()} />,
    )
    expect(screen.getByRole('dialog', { name: /novo produto/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nome/i)).toHaveValue('')
  })

  it('renders edit dialog with prefilled data', async () => {
    const product = buildProduct({ id: '1', name: 'Edit Me', price: 100, categoryIds: ['1'] })
    db.products.set('1', product)
    renderWithProviders(
      <ProductFormDialog open onOpenChange={vi.fn()} editProduct={product} />,
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
      <ProductFormDialog open onOpenChange={onOpenChange} />,
    )
    await user.type(screen.getByLabelText(/nome/i), 'New Product')
    await user.type(screen.getByLabelText(/preço/i), '150')
    await selectCategory(user, 'Electronics')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('closes dialog on successful edit', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    const product = buildProduct({ id: '1', name: 'Old Name', price: 50, categoryIds: ['1'] })
    db.products.set('1', product)
    renderWithProviders(
      <ProductFormDialog open onOpenChange={onOpenChange} editProduct={product} />,
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
      <ProductFormDialog open={false} onOpenChange={vi.fn()} />,
    )
    expect(screen.queryByText(/novo produto/i)).not.toBeInTheDocument()
  })
})
