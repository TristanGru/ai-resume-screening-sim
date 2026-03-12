import { describe, it, expect } from 'vitest'
import { s1_atsParser } from '../../src/screeners/s1_atsParser.js'

const WELL_FORMED = `Jane Smith
Experience
- Built REST API using Python in Jan 2023
- Developed data pipelines
Education
B.S. Computer Science, May 2024
Skills
Python, SQL, React
Projects
• Resume parser tool`

const SPARSE = `Bob Williams
bob@email.com
I have worked at various companies doing various things.`

const NO_BULLETS = `Jane Smith
Experience
Built REST API in 2023
Education
B.S. Computer Science 2024
Skills
Python SQL
Projects
Resume tool`

describe('s1_atsParser', () => {
  it('well-formed resume scores high (≥ 80)', () => {
    const result = s1_atsParser(WELL_FORMED)
    expect(result.screenerID).toBe('s1')
    expect(result.name).toBe('ATS Parser')
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.deductions.length).toBeGreaterThanOrEqual(1)
    expect(result.suggestion).toBeTruthy()
  })

  it('sparse resume missing most sections scores low', () => {
    const result = s1_atsParser(SPARSE)
    expect(result.score).toBeLessThanOrEqual(50)
  })

  it('deducts for missing bullets', () => {
    const result = s1_atsParser(NO_BULLETS)
    const mentionsBullets = result.deductions.some((d) =>
      d.toLowerCase().includes('bullet')
    )
    expect(mentionsBullets).toBe(true)
  })

  it('score is always 0–100', () => {
    const result = s1_atsParser('')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('deductions is a non-empty array', () => {
    const result = s1_atsParser(WELL_FORMED)
    expect(Array.isArray(result.deductions)).toBe(true)
    expect(result.deductions.length).toBeGreaterThanOrEqual(1)
  })

  it('handles all-caps resume (EC-001)', () => {
    const result = s1_atsParser(WELL_FORMED.toUpperCase())
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
