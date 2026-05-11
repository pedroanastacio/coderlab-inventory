import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildCategory } from '@/test/factories/category'
import { buildProduct } from '@/test/factories/product'
import { ProductForm } from '../components/ProductForm'

describe('ProductForm', () => {
  beforeEach(() => {
    db.reset()
    db.categories.set('1', buildCategory({ id: '1', name: 'Electronics' }))
    db.categories.set('2', buildCategory({ id: '2', name: 'Books' }))
  })

  it('renders create mode with empty fields', () => {
    renderWithProviders(<ProductForm />)
    expect(screen.getByLabelText(/nome/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductForm />)
    await user.click(screen.getByRole('button', { name: /criar/i }))
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
  })

  it('shows validation error for negative price', async () => {
    const user = userEvent.setup()
    const product = buildProduct({ id: '1', name: 'Test', price: -10, categoryIds: ['1'] })
    db.products.set('1', product)

    renderWithProviders(<ProductForm product={product} />)
    await user.click(screen.getByRole('button', { name: /atualizar/i }))
    expect(screen.getByText(/preço não pode ser negativo/i)).toBeInTheDocument()
  })

  it('submits form and creates product', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductForm />, { initialEntries: ['/products/new'] })

    await user.type(screen.getByLabelText(/nome/i), 'New Product')
    await user.type(screen.getByLabelText(/preço/i), '150')
    await user.click(screen.getByText('Electronics'))
    await user.click(screen.getByRole('button', { name: /criar/i }))

    await waitFor(() => {
      const products = Array.from(db.products.values())
      expect(products.length).toBe(1)
      expect(products[0].name).toBe('New Product')
    })
  })

  it('renders edit mode with pre-filled data', () => {
    const product = buildProduct({ id: '1', name: 'Existing', price: 50, categoryIds: ['1'] })
    db.products.set('1', product)

    renderWithProviders(<ProductForm product={product} />)
    expect(screen.getByLabelText(/nome/i)).toHaveValue('Existing')
    expect(screen.getByLabelText(/preço/i)).toHaveValue(50)
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })

  it('submits edit and updates product', async () => {
    const user = userEvent.setup()
    const product = buildProduct({ id: '1', name: 'Old Name', price: 50, categoryIds: ['1'] })
    db.products.set('1', product)

    renderWithProviders(<ProductForm product={product} />)
    await user.clear(screen.getByLabelText(/nome/i))
    await user.type(screen.getByLabelText(/nome/i), 'Updated Name')
    await user.click(screen.getByRole('button', { name: /atualizar/i }))

    await waitFor(() => {
      expect(db.products.get('1')!.name).toBe('Updated Name')
    })
  })
})
