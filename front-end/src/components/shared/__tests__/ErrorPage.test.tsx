import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { ErrorPage } from '../ErrorPage'

describe('ErrorPage', () => {
  it('renders heading', () => {
    renderWithProviders(<ErrorPage />)
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('shows error message when provided', () => {
    renderWithProviders(<ErrorPage error={new Error('Custom error')} />)
    expect(screen.getByText('Custom error')).toBeInTheDocument()
  })

  it('shows default message when no error', () => {
    renderWithProviders(<ErrorPage />)
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument()
  })

  it('renders try again button', () => {
    renderWithProviders(<ErrorPage />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
