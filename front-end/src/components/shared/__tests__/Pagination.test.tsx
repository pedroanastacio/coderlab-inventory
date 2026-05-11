import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('renders page info', () => {
    renderWithProviders(
      <Pagination page={1} pageCount={5} onPageChange={vi.fn()} />,
    )
    expect(screen.getByText(/página 1 de 5/i)).toBeInTheDocument()
  })

  it('returns null when pageCount is 1 or less', () => {
    renderWithProviders(
      <Pagination page={1} pageCount={1} onPageChange={vi.fn()} />,
    )
    expect(screen.queryByText(/página/i)).not.toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    renderWithProviders(
      <Pagination page={1} pageCount={5} onPageChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /página anterior/i })).toBeDisabled()
  })

  it('disables next button on last page', () => {
    renderWithProviders(
      <Pagination page={5} pageCount={5} onPageChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /próxima página/i })).toBeDisabled()
  })

  it('calls onPageChange with next page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithProviders(
      <Pagination page={1} pageCount={5} onPageChange={onPageChange} />,
    )
    await user.click(screen.getByRole('button', { name: /próxima página/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with previous page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithProviders(
      <Pagination page={3} pageCount={5} onPageChange={onPageChange} />,
    )
    await user.click(screen.getByRole('button', { name: /página anterior/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
