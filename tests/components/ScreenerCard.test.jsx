import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScreenerCard from '../../src/components/ScreenerCard.jsx'

const minimalProps = {
  name: 'ATS Parser',
  score: 78,
  deductions: ['Missing Projects section.'],
  suggestion: 'Add a Projects heading.',
}

describe('ScreenerCard', () => {
  it('renders screener name', () => {
    render(<ScreenerCard {...minimalProps} />)
    expect(screen.getByText('ATS Parser')).toBeTruthy()
  })

  it('renders deduction text', () => {
    render(<ScreenerCard {...minimalProps} />)
    expect(screen.getByText('Missing Projects section.')).toBeTruthy()
  })

  it('renders suggestion text', () => {
    render(<ScreenerCard {...minimalProps} />)
    expect(screen.getByText(/Add a Projects heading/)).toBeTruthy()
  })

  it('renders without delta when delta is null', () => {
    render(<ScreenerCard {...minimalProps} delta={null} />)
    // No delta badge should appear
    expect(screen.queryByText(/^\+\d/)).toBeNull()
    expect(screen.queryByText(/^-\d/)).toBeNull()
  })

  it('renders positive delta badge', () => {
    render(<ScreenerCard {...minimalProps} delta={7} />)
    expect(screen.getByText(/\+7/)).toBeTruthy()
  })

  it('renders negative delta badge', () => {
    render(<ScreenerCard {...minimalProps} delta={-3} />)
    expect(screen.getByText(/-3/)).toBeTruthy()
  })

  it('renders zero delta badge', () => {
    render(<ScreenerCard {...minimalProps} delta={0} />)
    expect(screen.getByText(/— 0/)).toBeTruthy()
  })
})
