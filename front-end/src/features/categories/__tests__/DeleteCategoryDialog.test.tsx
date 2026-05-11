import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildCategory } from '@/test/factories/category'
import { DeleteCategoryDialog } from '../components/DeleteCategoryDialog'

describe('DeleteCategoryDialog', () => {
  beforeEach(() => {
    db.reset()
    db.categories.set('1', buildCategory({ id: '1', name: 'To Delete' }))
  })

  it('opens dialog on trigger click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteCategoryDialog categoryId="1" categoryName="To Delete" />)
    await user.click(screen.getByRole('button', { name: /excluir/i }))
    expect(screen.getByText(/tem certeza/i)).toBeInTheDocument()
  })

  it('deletes category on confirm', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteCategoryDialog categoryId="1" categoryName="To Delete" />)
    await user.click(screen.getByRole('button', { name: /excluir/i }))
    await user.click(screen.getByRole('button', { name: /^excluir$/i }))
    await waitFor(() => {
      expect(db.categories.has('1')).toBe(false)
    })
  })

  it('closes dialog on cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteCategoryDialog categoryId="1" categoryName="To Delete" />)
    await user.click(screen.getByRole('button', { name: /excluir/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByText(/tem certeza/i)).not.toBeInTheDocument()
  })
})
