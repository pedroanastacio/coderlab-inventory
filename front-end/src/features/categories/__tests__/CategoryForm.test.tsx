import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildCategory } from '@/test/factories/category'
import { CategoryForm } from '../components/CategoryForm'

describe('CategoryForm', () => {
  beforeEach(() => {
    db.reset()
    db.categories.set('seed-1', buildCategory({ id: 'seed-1', name: 'Parent Cat' }))
  })

  it('renders create mode', () => {
    renderWithProviders(<CategoryForm />)
    expect(screen.getByLabelText(/nome/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument()
  })

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryForm />)
    await user.click(screen.getByRole('button', { name: /criar/i }))
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
  })

  it('submits and creates category', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryForm />)
    await user.type(screen.getByLabelText(/nome/i), 'New Category')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    await waitFor(() => {
      const categories = Array.from(db.categories.values())
      expect(categories.length).toBe(2)
      expect(categories.some(c => c.name === 'New Category')).toBe(true)
    })
  })

  it('renders edit mode with pre-filled data', () => {
    const category = buildCategory({ id: '2', name: 'Edit Me', description: 'Desc' })
    db.categories.set('2', category)

    renderWithProviders(<CategoryForm category={category} />)
    expect(screen.getByLabelText(/nome/i)).toHaveValue('Edit Me')
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })

  it('submits edit and updates category', async () => {
    const user = userEvent.setup()
    const category = buildCategory({ id: '2', name: 'Old Name' })
    db.categories.set('2', category)

    renderWithProviders(<CategoryForm category={category} />)
    await user.clear(screen.getByLabelText(/nome/i))
    await user.type(screen.getByLabelText(/nome/i), 'Updated Name')
    await user.click(screen.getByRole('button', { name: /atualizar/i }))

    await waitFor(() => {
      expect(db.categories.get('2')!.name).toBe('Updated Name')
    })
  })
})
