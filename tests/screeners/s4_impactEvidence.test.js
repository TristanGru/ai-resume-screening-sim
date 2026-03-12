import { describe, it, expect } from 'vitest'
import { s4_impactEvidence } from '../../src/screeners/s4_impactEvidence.js'

const STRONG_RESUME = `Jane Smith
Experience
- Developed REST API, reducing latency by 40%
- Built data pipeline processing 500,000 rows daily
- Optimized SQL queries, improving performance by 30%
- Delivered 3 features per sprint across 6-month project
- Implemented automated testing, achieving 85% coverage
- Led migration to cloud infrastructure saving $50,000/year`

const WEAK_RESUME = `Bob Williams
Experience
- Responsible for various tasks at the company
- Helped with team meetings and coordination
- Worked on database maintenance
- Assisted with reporting needs`

const SPARSE_RESUME = `Jane Smith
I have worked at companies doing various work.`

describe('s4_impactEvidence', () => {
  it('strong resume with numbers and action verbs scores high', () => {
    const result = s4_impactEvidence(STRONG_RESUME)
    expect(result.screenerID).toBe('s4')
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it('weak phrases reduce score', () => {
    const result = s4_impactEvidence(WEAK_RESUME)
    expect(result.score).toBeLessThan(60)
    const mentionsWeak = result.deductions.some((d) =>
      d.toLowerCase().includes('weak') || d.toLowerCase().includes('responsible')
    )
    expect(mentionsWeak).toBe(true)
  })

  it('sparse resume with no numbers scores low', () => {
    const result = s4_impactEvidence(SPARSE_RESUME)
    expect(result.score).toBeLessThan(70)
  })

  it('score is always 0–100', () => {
    const result = s4_impactEvidence('')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('returns valid ScreenerResult shape', () => {
    const result = s4_impactEvidence(SPARSE_RESUME)
    expect(result.screenerID).toBe('s4')
    expect(result.name).toBeTruthy()
    expect(Array.isArray(result.deductions)).toBe(true)
    expect(result.suggestion).toBeTruthy()
  })
})
