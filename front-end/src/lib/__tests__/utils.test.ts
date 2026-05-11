import { cn } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    const showHidden = false
    const showVisible = true
    expect(cn('base', showHidden && 'hidden', showVisible && 'visible')).toBe('base visible')
  })

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})
