import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { db } from '@/test/mocks/db'
import { buildProduct } from '@/test/factories/product'
import { DeleteProductDialog } from '../components/DeleteProductDialog'

describe('DeleteProductDialog', () => {
  beforeEach(() => {
    db.reset()
    db.products.set('1', buildProduct({ id: '1', name: 'To Delete' }))
  })

  it('opens dialog on trigger click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteProductDialog productId="1" productName="To Delete" />)
    await user.click(screen.getByRole('button', { name: /excluir/i }))
    expect(screen.getByText(/tem certeza/i)).toBeInTheDocument()
  })

  it('calls delete mutation on confirm', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteProductDialog productId="1" productName="To Delete" />)
    await user.click(screen.getByRole('button', { name: /excluir/i }))
    const confirmButton = screen.getByRole('button', { name: /^excluir$/i })
    await user.click(confirmButton)
    await waitFor(() => {
      expect(db.products.has('1')).toBe(false)
    })
  })

  it('closes dialog on cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteProductDialog productId="1" productName="To Delete" />)
    await user.click(screen.getByRole('button', { name: /excluir/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByText(/tem certeza/i)).not.toBeInTheDocument()
  })
})
